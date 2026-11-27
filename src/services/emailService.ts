import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { createLogger } from '../utils/logger';
import { InternalError } from '../utils/errors';

const logger = createLogger('EmailService');

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

// Verify connection on startup
transporter.verify()
    .then(() => {
        logger.info('Email service connected');
    })
    .catch((error: Error) => {
        logger.error('Email service connection failed', { error });
    });

export class EmailService {

   // Send verification email
    static async sendVerificationEmail(email: string, token: string) {
        const verificationLink =
            `${config.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome to Our App!</h2>
                    <p>Please verify your email address:</p>

                    <a href="${verificationLink}"
                       style="display:inline-block;padding:12px 24px;
                       background-color:#007bff;color:white;
                       text-decoration:none;border-radius:5px;">
                        Verify Email Address
                    </a>

                    <p style="margin-top: 16px; word-break: break-all;">
                        Or copy this link: <a href="${verificationLink}">${verificationLink}</a>
                    </p>

                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, ignore this email.</p>
                </div>
            </body>
            </html>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Verify Your Email Address',
            html,
        });
    }

    // Send password reset email
    static async sendPasswordResetEmail(email: string, token: string) {
        const resetLink =
            `${config.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password.</p>

                    <a href="${resetLink}"
                       style="display:inline-block;padding:12px 24px;
                       background-color:#dc3545;color:white;
                       text-decoration:none;border-radius:5px;">
                        Reset Password
                    </a>

                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request this, ignore this email.</p>
                </div>
            </body>
            </html>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            html,
        });
    }

    // Generic email sender
    private static async sendEmail(options: {
        to: string;
        subject: string;
        html: string;
    }) {
        try {
            const info = await transporter.sendMail({
                from: `"Your App" <${config.email.from}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });

            logger.info('Email sent successfully', {
                to: options.to,
                subject: options.subject,
                messageId: info.messageId,
            });

            // Ethereal email preview
            if (config.email.host === 'smtp.ethereal.email') {
                const previewUrl = nodemailer.getTestMessageUrl(info);

                logger.info('Ethereal preview URL', { previewUrl });
            }

            return info;

        } catch (error) {
            logger.error('Failed to send email', {
                to: options.to,
                subject: options.subject,
                error,
            });

            throw new InternalError('Failed to send email');
        }
    }
}
