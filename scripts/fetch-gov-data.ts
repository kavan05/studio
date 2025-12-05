import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import crypto from 'crypto';

// --- CONFIGURATION ---
const LOCAL_CSV_PATH = process.env.CSV_PATH || path.join(process.cwd(), 'data', 'businesses.csv');
const DATA_URL = process.env.DATA_URL || '';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'service-account.json');

// Optimized batch configuration
const BATCH_SIZE = 500; // Firestore maximum
const MAX_CONCURRENT_BATCHES = 5; // Conservative for stability
const DELAY_BETWEEN_BATCHES = 50; // Small delay to avoid throttling

// Single timestamp for entire import run
const IMPORT_TIMESTAMP = new Date();
const IMPORT_RUN_ID = `import-${Date.now()}`;

// --- INITIALIZATION ---
if (getApps().length === 0) {
    try {
        if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
            const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✓ Firebase Admin initialized with service-account.json');
        } else {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
            console.log('✓ Firebase Admin initialized with default credentials');
        }
    } catch (error) {
        console.error('✗ Failed to initialize Firebase Admin:', error);
        process.exit(1);
    }
}

const db = getFirestore();

// --- DETERMINISTIC ID GENERATION ---
function generateSafeId(record: Record<string, any>): string {
    // Priority 1: Use official business ID if available
    if (record.business_id_no) {
        const id = String(record.business_id_no).trim();
        if (id && id.length > 0 && !id.includes('e') && !id.includes('E') && id !== 'null' && id !== 'undefined') {
            return id.replace(/[\/\s\.#\[\]]/g, '_').substring(0, 1500);
        }
    }

    // Priority 2: Create deterministic hash from business data
    const name = (record.business_name || record.name || '').trim();
    const address = (record.full_address || '').trim();
    const postal = (record.postal_code || '').trim();
    const city = (record.city || '').trim();
    
    if (!name) {
        return ''; // Will be skipped
    }

    // Create unique fingerprint for this business
    const fingerprint = `${name}|${address}|${postal}|${city}`.toLowerCase();
    
    // Generate deterministic hash
    const hash = crypto
        .createHash('sha256')
        .update(fingerprint)
        .digest('hex')
        .substring(0, 20);
    
    // Create readable prefix from name
    const prefix = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 40);
    
    return prefix ? `${prefix}-${hash}` : `biz-${hash}`;
}

// --- CLEAN AND VALIDATE BUSINESS DATA ---
function cleanBusinessData(record: Record<string, any>): Record<string, any> | null {
    const name = (record.business_name || record.name || '').trim();
    
    if (!name) {
        return null; // Skip records without name
    }

    // Parse numeric values safely
    const parseNumber = (val: any): number | null => {
        if (!val) return null;
        const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? null : num;
    };

    return {
        // Basic info
        name: name,
        alt_name: record.alt_business_name || null,
        business_id: record.business_id_no || null,

        // Address
        address: record.full_address || null,
        unit: record.unit || null,
        street_no: record.street_no || null,
        street_name: record.street_name || null,
        street_direction: record.street_direction || null,
        street_type: record.street_type || null,
        city: record.city || record.CSDNAME || null,
        province: record.prov_terr || 'ON',
        postal_code: record.postal_code || null,

        // Geographic
        latitude: parseNumber(record.latitude),
        longitude: parseNumber(record.longitude),
        geo_source: record.geo_source || null,
        CSDUID: record.CSDUID || null,

        // Classification
        sector: record.business_sector || null,
        subsector: record.business_subsector || null,
        description: record.business_description || null,
        naics_code: record.derived_NAICS || record.source_NAICS_primary || null,
        naics_description: record.NAICS_descr || null,
        category: record.NAICS_descr || record.business_sector || null,

        // License
        licence_number: record.licence_number || null,
        licence_type: record.licence_type || null,

        // Metadata
        status: record.status || null,
        employees: parseNumber(record.total_no_employees),
        provider: record.provider || null,

        // System fields
        source: 'gov-csv-import',
        importRunId: IMPORT_RUN_ID,
        importedAt: IMPORT_TIMESTAMP,
        updatedAt: IMPORT_TIMESTAMP
    };
}

// --- BATCH PROCESSING WITH ERROR HANDLING ---
async function processBatch(
    records: Array<Record<string, any>>,
    startIndex: number,
    batchSize: number
): Promise<{ success: number; failed: number; skipped: number; errors: string[] }> {
    
    const batch = db.batch();
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < batchSize && startIndex + i < records.length; i++) {
        const record = records[startIndex + i];
        const globalIndex = startIndex + i;

        try {
            // Clean and validate data
            const business = cleanBusinessData(record);
            
            if (!business) {
                skippedCount++;
                continue;
            }

            // Generate deterministic ID
            const id = generateSafeId(record);
            
            if (!id) {
                skippedCount++;
                continue;
            }

            // Validate Firestore ID
            if (id.length > 1500 || id.includes('..') || id === '.' || id === '') {
                errors.push(`Invalid ID at row ${globalIndex}: "${id}"`);
                failedCount++;
                continue;
            }

            const docRef = db.collection('businesses').doc(id);
            batch.set(docRef, business);
            successCount++;

        } catch (error) {
            failedCount++;
            errors.push(`Row ${globalIndex}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Commit batch with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
        try {
            await batch.commit();
            return { success: successCount, failed: failedCount, skipped: skippedCount, errors };
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                // All writes in this batch failed
                return { 
                    success: 0, 
                    failed: successCount + failedCount, 
                    skipped: skippedCount, 
                    errors: [`Batch commit failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`] 
                };
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
    }

    return { success: successCount, failed: failedCount, skipped: skippedCount, errors };
}

// --- DELAY HELPER ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MAIN FUNCTION ---
async function fetchAndInsertData() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  FIRESTORE BUSINESS DATA IMPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Import Run ID: ${IMPORT_RUN_ID}`);
    console.log(`Timestamp: ${IMPORT_TIMESTAMP.toISOString()}`);
    console.log('───────────────────────────────────────────────────────────\n');

    try {
        // --- STEP 1: LOAD CSV DATA ---
        let csvText = '';

        if (fs.existsSync(LOCAL_CSV_PATH)) {
            console.log(`📂 Reading CSV: ${LOCAL_CSV_PATH}`);
            csvText = fs.readFileSync(LOCAL_CSV_PATH, 'utf8');
        } else if (DATA_URL) {
            console.log(`🌐 Fetching CSV from: ${DATA_URL}`);
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            csvText = await response.text();
        } else {
            throw new Error(`❌ No CSV source found.\n   Please either:\n   1. Place CSV at: ${LOCAL_CSV_PATH}\n   2. Set DATA_URL environment variable`);
        }

        console.log('✓ CSV loaded successfully\n');

        // --- STEP 2: PARSE CSV ---
        console.log('📊 Parsing CSV data...');
        
        const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true,
            relax_quotes: true,
            skip_records_with_error: true
        }) as Array<Record<string, any>>;

        console.log(`✓ Parsed ${records.length.toLocaleString()} records\n`);

        if (records.length === 0) {
            console.log('⚠️  No records found in CSV');
            return;
        }

        // Show sample
        console.log('📋 Sample record (first row):');
        console.log('   Columns:', Object.keys(records[0]).join(', '));
        console.log('');

        // --- STEP 3: PROCESS IN BATCHES ---
        console.log('🚀 Starting import process...');
        console.log(`   Batch size: ${BATCH_SIZE}`);
        console.log(`   Concurrent batches: ${MAX_CONCURRENT_BATCHES}`);
        console.log('───────────────────────────────────────────────────────────\n');

        let totalSuccess = 0;
        let totalFailed = 0;
        let totalSkipped = 0;
        const allErrors: string[] = [];

        const totalBatches = Math.ceil(records.length / BATCH_SIZE);
        const startTime = Date.now();

        for (let i = 0; i < totalBatches; i += MAX_CONCURRENT_BATCHES) {
            const batchPromises = [];
            
            // Process multiple batches concurrently
            for (let j = 0; j < MAX_CONCURRENT_BATCHES && i + j < totalBatches; j++) {
                const batchIndex = i + j;
                const startIndex = batchIndex * BATCH_SIZE;
                
                batchPromises.push(
                    processBatch(records, startIndex, BATCH_SIZE)
                );
            }

            // Wait for concurrent batches to complete
            const results = await Promise.all(batchPromises);
            
            // Aggregate results
            results.forEach(result => {
                totalSuccess += result.success;
                totalFailed += result.failed;
                totalSkipped += result.skipped;
                allErrors.push(...result.errors);
            });

            // Progress update
            const processed = Math.min((i + MAX_CONCURRENT_BATCHES) * BATCH_SIZE, records.length);
            const percent = Math.round((processed / records.length) * 100);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = Math.round(processed / (Date.now() - startTime) * 1000);
            
            console.log(`📈 Progress: ${processed.toLocaleString()}/${records.length.toLocaleString()} (${percent}%) | ${rate} records/sec | ${elapsed}s elapsed`);

            // Small delay between batch groups
            if (i + MAX_CONCURRENT_BATCHES < totalBatches) {
                await delay(DELAY_BETWEEN_BATCHES);
            }
        }

        // --- STEP 4: FINAL REPORT ---
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const avgRate = Math.round(records.length / (Date.now() - startTime) * 1000);

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('  IMPORT COMPLETE');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`✅ Successfully imported: ${totalSuccess.toLocaleString()} businesses`);
        
        if (totalSkipped > 0) {
            console.log(`⚠️  Skipped (missing data): ${totalSkipped.toLocaleString()} records`);
        }
        
        if (totalFailed > 0) {
            console.log(`❌ Failed: ${totalFailed.toLocaleString()} records`);
        }
        
        console.log('───────────────────────────────────────────────────────────');
        console.log(`⏱️  Total time: ${totalTime}s`);
        console.log(`⚡ Average rate: ${avgRate} records/second`);
        console.log('═══════════════════════════════════════════════════════════\n');

        // Show errors if any
        if (allErrors.length > 0) {
            console.log('❌ ERRORS ENCOUNTERED:');
            const uniqueErrors = [...new Set(allErrors)].slice(0, 20); // Show first 20 unique errors
            uniqueErrors.forEach(err => console.log(`   - ${err}`));
            if (allErrors.length > 20) {
                console.log(`   ... and ${allErrors.length - 20} more errors\n`);
            }
        }

        // Success criteria
        const successRate = (totalSuccess / records.length) * 100;
        if (successRate >= 99) {
            console.log('🎉 Import completed successfully!\n');
        } else if (successRate >= 95) {
            console.log('⚠️  Import completed with some issues. Review errors above.\n');
        } else {
            console.log('❌ Import completed with significant failures. Please review.\n');
        }

    } catch (error) {
        console.error('\n═══════════════════════════════════════════════════════════');
        console.error('❌ FATAL ERROR');
        console.error('═══════════════════════════════════════════════════════════');
        console.error(error);
        console.error('═══════════════════════════════════════════════════════════\n');
        process.exit(1);
    }
}

// --- RUN ---
fetchAndInsertData();