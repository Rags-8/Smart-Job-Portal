const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const getResendKey = () => (process.env.RESEND_API_KEY || "").trim();

let transporter = null;

/**
 * Sends an email using Gmail SMTP (via Nodemailer) or Resend as backup.
 */
const sendEmail = async (to, subject, htmlContent) => {
    const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
    const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").trim();
    const resendKey = getResendKey();

    let gmailFailed = false;
    let smtpErrorDetails = null;

    try {
        // 1. Attempt Gmail SMTP if credentials exist
        if (emailUser && emailPass) {
            try {
                // If transporter already exists but credentials changed or were missing before, we might need a fresh one
                // For simplicity, we'll recreate if credentials don't match or every time if needed, 
                // but let's just make sure it's initialized with the found credentials.
                if (!transporter) {
                    console.log(`[SMTP] Initializing transporter via Gmail service for ${emailUser}`);
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: { user: emailUser, pass: emailPass },
                        connectionTimeout: 10000,
                        greetingTimeout: 10000,
                        socketTimeout: 15000
                    });
                }

                const mailOptions = {
                    from: `"Smart Job Portal" <${emailUser}>`,
                    to: to,
                    subject: subject,
                    html: htmlContent,
                };

                console.log(`[SMTP] Attempting Gmail delivery to: ${to}...`);
                console.time(`[SMTP_Timer] ${to}`);
                const info = await transporter.sendMail(mailOptions);
                console.timeEnd(`[SMTP_Timer] ${to}`);
                console.log(`[SMTP] Success! ID: ${info.messageId}`);
                return { success: true, provider: 'Gmail', messageId: info.messageId };
            } catch (smtpError) {
                gmailFailed = true;
                smtpErrorDetails = smtpError.message;
                // Wipe the transporter so the next attempt starts fresh if this was a connection hang
                transporter = null;
                console.warn(`[SMTP] Gmail failed (${smtpError.message}). Falling back to secondary...`);
            }
        }

        // 2. Fallback to Resend if Gmail was skipped or failed
        if (resendKey) {
            console.log(`[Resend] Attempting API delivery to: ${to}...`);
            const resend = new Resend(resendKey);

            // Check for Resend onboarding limits
            if (to !== emailUser && to !== process.env.SMTP_USER) {
                console.warn(`[Resend] Warning: Sending to external address ${to} via onboarding@resend.dev might be blocked by Resend unless domain is verified.`);
            }

            const { data, error } = await resend.emails.send({
                from: 'Smart Job Portal <onboarding@resend.dev>',
                to: to,
                subject: subject,
                html: htmlContent,
            });

            if (error) {
                console.error("[Resend] API Error:", error);
                return {
                    error: error.message,
                    source: 'Resend',
                    smtpError: smtpErrorDetails
                };
            }

            console.log(`[Resend] Success! ID: ${data.id}`);
            return {
                success: true,
                provider: 'Resend',
                id: data.id,
                smtpError: smtpErrorDetails // Show why Gmail failed even if Resend worked
            };
        }

        const reason = gmailFailed ? `Gmail SMTP failed (${smtpErrorDetails}) and no Resend key found.` : "No email credentials configured (checked EMAIL_USER/PASS and SMTP_USER/PASS).";
        console.warn(`⚠️ ${reason} Skipping email to: ${to}`);
        return {
            error: reason,
            smtpError: smtpErrorDetails
        };

    } catch (criticalError) {
        console.error("Critical error in sendEmail wrapper:", criticalError);
        return { error: criticalError.message, source: 'Critical' };
    }
};

module.exports = {
    sendEmail
};
