import { Resend } from 'resend';

class EmailService {
    private resend: Resend | null = null;
    private fromEmail: string = 'onboarding@resend.dev'; // Default Resend testing email

    constructor() {
        if (process.env.RESEND_API_KEY) {
            this.resend = new Resend(process.env.RESEND_API_KEY);
            if (process.env.EMAIL_FROM) {
                this.fromEmail = process.env.EMAIL_FROM;
            }
            console.log('EmailService: Initialized');
        } else {
            console.log('EmailService: API Key missing, Email disabled (logging only)');
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        if (!this.resend) {
            console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
            return;
        }

        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html
            });
        } catch (error) {
            console.error('Email Send Failed:', error);
            throw error;
        }
    }

    async sendPasswordReset(to: string, url: string): Promise<void> {
        const subject = 'Reset Your Password - IVR Hotel';
        const html = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${url}">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
        `;
        await this.sendEmail(to, subject, html);
    }

    async sendWelcome(to: string, name: string): Promise<void> {
        const subject = 'Welcome to IVR Hotel';
        const html = `
            <h1>Welcome, ${name}!</h1>
            <p>We are excited to have you on board.</p>
            <p>Get started by setting up your hotel profile.</p>
        `;
        await this.sendEmail(to, subject, html);
    }
}

export const emailService = new EmailService();
