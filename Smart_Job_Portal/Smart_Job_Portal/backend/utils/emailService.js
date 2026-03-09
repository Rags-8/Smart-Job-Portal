const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const getResendKey = () => (process.env.RESEND_API_KEY || "").trim();

let transporter = null;

/**
 * Sends an email using Gmail SMTP (via Nodemailer) or Resend as backup.
 */
const sendEmail = async (to, subject, htmlContent) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const resendKey = getResendKey();

    let gmailFailed = false;

    try {
        // 1. Attempt Gmail SMTP if credentials exist
        if (emailUser && emailPass) {
            try {
                if (!transporter) {
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: { user: emailUser, pass: emailPass },
                        connectionTimeout: 10000, // 10 seconds
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
                return true;
            } catch (smtpError) {
                gmailFailed = true;
                console.warn(`[SMTP] Gmail failed (${smtpError.message}). Falling back to secondary...`);
            }
        }

        // 2. Fallback to Resend if Gmail was skipped or failed
        if (resendKey) {
            console.log(`[Resend] Attempting API delivery to: ${to}...`);
            const resend = new Resend(resendKey);
            const { data, error } = await resend.emails.send({
                from: 'Smart Job Portal <onboarding@resend.dev>',
                to: to,
                subject: subject,
                html: htmlContent,
            });

            if (error) {
                console.error("[Resend] API Error:", error);
                return { error: error.message };
            }

            console.log(`[Resend] Success! ID: ${data.id}`);
            return true;
        }

        const reason = gmailFailed ? "Gmail SMTP failed and no Resend key found." : "No email credentials configured.";
        console.warn(`⚠️ ${reason} Skipping email to: ${to}`);
        return { error: reason };

    } catch (criticalError) {
        console.error("Critical error in sendEmail wrapper:", criticalError);
        return { error: criticalError.message };
    }
};

module.exports = {
    sendEmail
};
