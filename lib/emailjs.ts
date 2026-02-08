/**
 * EmailJS Integration for sending OTP emails
 * 
 * Setup Instructions:
 * 1. Create account at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template with variables: {{to_email}}, {{to_name}}, {{otp_code}}
 * 4. Add environment variables to .env.local
 */

interface EmailJSResponse {
    status: number;
    text: string;
}

interface SendOTPEmailParams {
    toEmail: string;
    toName: string;
    otpCode: string;
}

/**
 * Send OTP email using EmailJS API
 * This uses the server-side REST API for better security
 */
export async function sendOTPEmail({
    toEmail,
    toName,
    otpCode,
}: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
        console.error('EmailJS configuration missing');
        return {
            success: false,
            error: 'Email service not configured',
        };
    }

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                template_params: {
                    to_email: toEmail,
                    to_name: toName,
                    otp_code: otpCode,
                    app_name: 'EduTrack',
                    validity: '10 minutes',
                },
            }),
        });

        if (response.ok) {
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error('EmailJS error:', errorText);
            return {
                success: false,
                error: 'Failed to send email',
            };
        }
    } catch (error) {
        console.error('Email sending error:', error);
        return {
            success: false,
            error: 'Network error while sending email',
        };
    }
}

/**
 * EmailJS template structure (to be created in EmailJS dashboard):
 * 
 * Subject: Your EduTrack Verification Code
 * 
 * Body:
 * Hello {{to_name}},
 * 
 * Your verification code for {{app_name}} is:
 * 
 * {{otp_code}}
 * 
 * This code is valid for {{validity}}.
 * 
 * If you didn't request this code, please ignore this email.
 * 
 * Best regards,
 * The EduTrack Team
 * 
 * Template Variables to add in EmailJS:
 * - to_email (recipient's email)
 * - to_name (recipient's name)
 * - otp_code (the 6-digit code)
 * - app_name (EduTrack)
 * - validity (e.g., "10 minutes")
 */
