/**
 * Manually trigger data synchronization
 * This calls the Firebase Cloud Function to sync business data from external sources
 * 
 * Note: Since we're using static export, this is a client-side function
 * that triggers the existing Cloud Function endpoint
 */

export async function manualDataSync(userId: string) {
    try {
        // Verify user is authenticated
        if (!userId) {
            return { error: "User not authenticated" };
        }

        // Get the Cloud Function URL from environment
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            return {
                error: "API URL not configured. Please set NEXT_PUBLIC_API_URL in your environment."
            };
        }

        // Call the Firebase Cloud Function to trigger data sync
        // This assumes you have a /sync endpoint in your Cloud Functions
        const response = await fetch(`${apiUrl}/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                timestamp: new Date().toISOString(),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                error: errorData.message || `Failed to sync data: ${response.statusText}`,
            };
        }

        const result = await response.json();

        return {
            success: true,
            data: result,
            message: `Data sync completed successfully. Fetched: ${result.fetched || 0}, Written: ${result.written || 0}`,
        };
    } catch (error) {
        console.error("Manual data sync error:", error);

        // Provide helpful error messages
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                error: "Network error. Please check your internet connection and API configuration.",
            };
        }

        return {
            error: error instanceof Error ? error.message : "An unexpected error occurred during sync",
        };
    }
}
