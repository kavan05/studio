# **App Name**: BizHub API

## Core Features:

- Data Ingestion Pipeline: Automatically fetch business registration data from government open data portals across Canada on a weekly schedule. This involves extracting, transforming, and loading the data into Firestore.
- Data Normalization & Deduplication: Process and normalize raw data from various sources into a unified schema. Implement deduplication logic to ensure data consistency and accuracy.
- Searchable API Endpoints: Provide API endpoints for searching businesses by name, category, city, and proximity using Firestore indexes. The available endpoints are: /businesses/search?name=…, /businesses/category?type=…, /businesses/city?name=…, /businesses/nearby?lat=X&lng=Y&radius=…
- API Key Generation & Management: Enable users to sign up, generate, and reset API keys through a developer dashboard. Store hashed API keys in Firestore.
- API Authentication & Authorization: Implement API key-based authentication and authorization using a middleware function. API requests must include the API key in the header: Authorization: Bearer <API_KEY>.
- API Usage Tracking & Rate Limiting: Track API usage metrics per API key and enforce rate limits (e.g., 1000 requests/day for the free tier). Store usage data in Firestore and implement rate limiting per IP address.
- API Documentation with Swagger UI: Integrate Swagger UI to provide interactive API documentation and a playground for developers to test the API endpoints.

## Style Guidelines:

- Primary color: Deep blue (#2E4057), inspired by Canada's vast lakes and clear skies, evokes trust and reliability.
- Background color: Light gray (#F0F4F8), a desaturated near-blue providing a clean and professional backdrop.
- Accent color: Soft lavender (#9A8CCF), analogous to deep blue but significantly different, used for highlighting interactive elements and key information.
- Body and headline font: 'Inter', a sans-serif font known for its legibility and clean design, suitable for both headings and body text.
- Use minimalist icons with a focus on clarity and representing business and location concepts, maintaining consistency and professionalism.
- Design a clean, minimal developer dashboard layout optimized for API key management, usage statistics, and API documentation access.
- Subtle animations (e.g., fade-in effects, loading spinners) to improve user experience and provide feedback during API key generation and data loading.