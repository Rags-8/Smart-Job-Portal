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

    try {
        // Prefer Gmail SMTP if credentials are provided
        if (emailUser && emailPass) {
            if (!transporter) {
                transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });
            }
            const mailOptions = {
                from: `"Smart Job Portal" <${emailUser}>`,
                to: to,
                subject: subject,
                html: htmlContent,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully via Gmail SMTP to ${to} (ID: ${info.messageId})`);
            return true;
        }

        // Fallback to Resend
        if (resendKey) {
            const resend = new Resend(resendKey);
            const { data, error } = await resend.emails.send({
                from: 'Smart Job Portal <onboarding@resend.dev>',
                to: to,
                subject: subject,
                html: htmlContent,
            });

            if (error) {
                console.error("Resend API Error:", error);
                return error;
            }

            console.log(`Email sent successfully via Resend to ${to} (ID: ${data.id})`);
            return true;
        }

        console.warn("⚠️ No email credentials found (Gmail or Resend). Skipping email to:", to);
        return { error: "Missing email configuration." };

    } catch (error) {
        console.error("Critical Error sending email:", {
            message: error.message,
            recipient: to
        });
        return { error: error.message };
    }
};

module.exports = {
    sendEmail
};
