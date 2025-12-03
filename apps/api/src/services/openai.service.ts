import OpenAI from 'openai';

class OpenAIService {
    private openai: OpenAI | null = null;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            console.log('OpenAIService: Initialized');
        } else {
            console.log('OpenAIService: API Key missing, AI disabled');
        }
    }

    async parseBookingEmail(emailContent: string): Promise<any> {
        if (!this.openai) {
            console.log('OpenAIService: Mocking email parsing');
            // Return mock data for dev
            return {
                guestName: "John Doe",
                checkInDate: "2023-12-25",
                checkOutDate: "2023-12-30",
                roomType: "Deluxe Suite",
                totalAmount: 500,
                currency: "USD",
                platform: "Booking.com"
            };
        }

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that extracts hotel booking details from emails. Return JSON with keys: guestName, checkInDate (YYYY-MM-DD), checkOutDate (YYYY-MM-DD), roomType, totalAmount (number), currency, platform."
                    },
                    { role: "user", content: emailContent }
                ],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            return content ? JSON.parse(content) : null;
        } catch (error) {
            console.error('OpenAI Parsing Failed:', error);
            throw error;
        }
    }
}

export const openAIService = new OpenAIService();
