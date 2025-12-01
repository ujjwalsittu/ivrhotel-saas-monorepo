/**
 * Dummy Digilocker Service
 * 
 * This is a mock implementation for MVP.
 * In production, integrate with actual Digilocker OAuth API.
 * 
 * Digilocker API: https://digilocker.gov.in/
 */

interface DigilockerResponse {
    success: boolean;
    data?: {
        documentNumber: string;
        name: string;
        dob: string;
        address: string;
        documentImage: string;
        gender?: string;
        photo?: string;
    };
    error?: string;
}

/**
 * Simulate Digilocker verification
 * @param aadhaarNumber - Aadhaar number (12 digits)
 * @returns Mock Digilocker data
 */
export async function verifyWithDigilocker(aadhaarNumber: string): Promise<DigilockerResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Basic validation
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
        return {
            success: false,
            error: 'Invalid Aadhaar number'
        };
    }

    // Mock successful response
    return {
        success: true,
        data: {
            documentNumber: `XXXX-XXXX-${aadhaarNumber.slice(-4)}`, // Masked
            name: 'John Doe', // In production, fetch from Digilocker
            dob: '1990-01-01',
            address: '123 Main Street, New Delhi, India, 110001',
            gender: 'M',
            photo: '/uploads/mock/aadhaar-photo.jpg', // Mock photo URL
            documentImage: '/uploads/mock/aadhaar-card.jpg'
        }
    };
}

/**
 * Generate Digilocker OAuth URL (for production)
 * @param redirectUri - Callback URL after authentication
 * @returns OAuth URL
 */
export function generateDigilockerAuthUrl(redirectUri: string): string {
    // In production:
    // const clientId = process.env.DIGILOCKER_CLIENT_ID;
    // const state = crypto.randomBytes(16).toString('hex');
    // return `https://digilocker.gov.in/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&response_type=code`;

    // For now, return dummy URL
    return `https://dummy-digilocker.example.com/auth?redirect_uri=${redirectUri}`;
}

/**
 * Exchange OAuth code for access token (for production)
 * @param code - OAuth authorization code
 * @returns Access token
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
    // In production:
    // const response = await fetch('https://digilocker.gov.in/oauth/token', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         client_id: process.env.DIGILOCKER_CLIENT_ID,
    //         client_secret: process.env.DIGILOCKER_CLIENT_SECRET,
    //         code,
    //         grant_type: 'authorization_code'
    //     })
    // });
    // return response.json().access_token;

    return 'mock-access-token';
}

/**
 * Fetch document from Digilocker (for production)
 * @param accessToken - OAuth access token
 * @param documentId - Document identifier
 * @returns Document data
 */
export async function fetchDocument(accessToken: string, documentId: string): Promise<any> {
    // In production:
    // const response = await fetch(`https://digilocker.gov.in/api/document/${documentId}`, {
    //     headers: { 'Authorization': `Bearer ${accessToken}` }
    // });
    // return response.json();

    return {
        documentType: 'aadhaar',
        data: {} // Mock document data
    };
}
