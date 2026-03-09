const nodemailer = require('nodemailer');
require('dotenv').config();

const getUser = () => (process.env.SMTP_USER || "").trim();
const getPass = () => (process.env.SMTP_PASS || "").trim();

/**
 * Sends an email to the specified recipient.
 */
const sendEmail = async (to, subject, htmlContent) => {
    const user = getUser();
    const pass = getPass();

    try {
        if (!user || !pass) {
            console.warn("⚠️ SMTP_USER or SMTP_PASS not defined. Skipping email to:", to);
            return false;
        }

        // Create transporter only when needed to ensure fresh env vars
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
        });

        const info = await transporter.sendMail({
            from: `"Smart Job Portal" <${user}>`,
            to: to,
            subject: subject,
            html: htmlContent
        });

        console.log(`Email sent successfully to ${to} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error("Critical Error sending email:", {
            message: error.message,
            code: error.code,
            command: error.command,
            recipient: to
        });
        return false;
    }
};

module.exports = {
    sendEmail
};
