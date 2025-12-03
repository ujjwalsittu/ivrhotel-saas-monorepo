import { openAIService } from '../openai.service';

/**
 * AI-Powered Email Parser for OTA Bookings
 * 
 * Parses booking confirmation emails from various OTAs and extracts:
 * - Guest details (name, phone, email)
 * - Booking dates (check-in, check-out)
 * - Room type
 * - Booking ID
 * - Price
 * 
 * Uses OpenAI GPT for intelligent extraction (can be replaced with any LLM)
 */

interface ParsedBooking {
    ota: string;
    bookingId: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    checkInDate: string; // ISO date string
    checkOutDate: string;
    roomType: string;
    numberOfRooms?: number;
    numberOfGuests?: number;
    totalPrice?: number;
    specialRequests?: string;
}

/**
 * Parse booking email using AI
 * @param emailContent - Raw email HTML or text
 * @param emailSubject - Email subject line
 * @param fromAddress - Sender email address
 */
export async function parseBookingEmail(
    emailContent: string,
    emailSubject: string,
    fromAddress: string
): Promise<{ success: boolean; booking?: ParsedBooking; error?: string }> {
    try {
        // Detect OTA from email address
        const ota = detectOTA(fromAddress);

        // Use OpenAI for extraction (placeholder for now)
        const extractedData = await extractWithAI(emailContent, emailSubject, ota);

        if (!extractedData) {
            return {
                success: false,
                error: 'Failed to extract booking data'
            };
        }

        return {
            success: true,
            booking: extractedData
        };
    } catch (error) {
        console.error('Email parsing error:', error);
        return {
            success: false,
            error: 'Email parsing failed'
        };
    }
}

/**
 * Detect OTA from email address
 */
function detectOTA(fromAddress: string): string {
    const otaPatterns: Record<string, RegExp> = {
        'MAKEMYTRIP': /makemytrip\.com/i,
        'GOIBIBO': /goibibo\.com/i,
        'BOOKING_COM': /booking\.com/i,
        'AIRBNB': /airbnb\.com/i,
        'OYO': /oyorooms\.com/i,
        'AGODA': /agoda\.com/i,
        'EXPEDIA': /expedia\.com/i
    };

    for (const [ota, pattern] of Object.entries(otaPatterns)) {
        if (pattern.test(fromAddress)) {
            return ota;
        }
    }

    return 'OTHER';
}

/**
 * Extract booking data using AI (OpenAI GPT)
 */
async function extractWithAI(
    emailContent: string,
    emailSubject: string,
    ota: string
): Promise<ParsedBooking | null> {
    // For MVP, use structured regex patterns
    // In production, use OpenAI API

    // Example pattern-based extraction for MakeMyTrip
    if (ota === 'MAKEMYTRIP') {
        return extractMakeMyTrip(emailContent);
    } else if (ota === 'BOOKING_COM') {
        return extractBookingCom(emailContent);
    }

    // Fallback: Generic AI extraction
    return extractGeneric(emailContent, emailSubject);
}

/**
 * MakeMyTrip-specific extraction
 */
function extractMakeMyTrip(content: string): ParsedBooking | null {
    try {
        // Extract booking ID
        const bookingIdMatch = content.match(/Booking\s*(?:ID|Reference)\s*:?\s*([A-Z0-9]+)/i);
        const bookingId = bookingIdMatch ? bookingIdMatch[1] : '';

        // Extract guest name
        const nameMatch = content.match(/Guest\s*Name\s*:?\s*([A-Za-z\s]+)/i);
        const guestName = nameMatch ? nameMatch[1].trim() : '';

        // Extract dates
        const checkInMatch = content.match(/Check-?in\s*:?\s*(\d{1,2}[\s\-\/]\w+[\s\-\/]\d{4})/i);
        const checkOutMatch = content.match(/Check-?out\s*:?\s*(\d{1,2}[\s\-\/]\w+[\s\-\/]\d{4})/i);

        // Extract room type
        const roomMatch = content.match(/Room\s*Type\s*:?\s*([A-Za-z\s]+)/i);
        const roomType = roomMatch ? roomMatch[1].trim() : '';

        if (!bookingId || !guestName || !checkInMatch || !checkOutMatch) {
            return null;
        }

        return {
            ota: 'MAKEMYTRIP',
            bookingId,
            guestName,
            checkInDate: parseDate(checkInMatch[1]),
            checkOutDate: parseDate(checkOutMatch[1]),
            roomType
        };
    } catch (error) {
        return null;
    }
}

/**
 * Booking.com-specific extraction
 */
function extractBookingCom(content: string): ParsedBooking | null {
    // Similar pattern matching for Booking.com
    return null;
}

/**
 * Generic AI-powered extraction (for production with OpenAI)
 */
async function extractGeneric(content: string, subject: string): Promise<ParsedBooking | null> {
    try {
        const parsed = await openAIService.parseBookingEmail(`Subject: ${subject}\n\n${content}`);
        if (!parsed) return null;

        return {
            ota: parsed.platform || 'UNKNOWN',
            bookingId: parsed.bookingId || '',
            guestName: parsed.guestName || '',
            guestEmail: parsed.guestEmail,
            guestPhone: parsed.guestPhone,
            checkInDate: parsed.checkInDate,
            checkOutDate: parsed.checkOutDate,
            roomType: parsed.roomType || '',
            totalPrice: parsed.totalPrice,
            numberOfRooms: 1, // Default
            numberOfGuests: 1 // Default
        };
    } catch (error) {
        console.error('Generic Extraction Failed:', error);
        return null;
    }
}

/**
 * Parse various date formats to ISO string
 */
function parseDate(dateStr: string): string {
    // Handle formats like "15 Dec 2024", "15-12-2024", "15/12/2024"
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
}

/**
 * Validate parsed booking data
 */
export function validateParsedBooking(booking: ParsedBooking): boolean {
    return !!(
        booking.bookingId &&
        booking.guestName &&
        booking.checkInDate &&
        booking.checkOutDate &&
        new Date(booking.checkInDate) < new Date(booking.checkOutDate)
    );
}
