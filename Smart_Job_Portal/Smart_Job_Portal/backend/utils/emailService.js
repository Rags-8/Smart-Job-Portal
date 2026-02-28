const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a reusable transporter using SMTP transport
// You can switch to other services like SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard for general use. For others, specify host/port.
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Sends an email to the specified recipient.
 * @param {string} to - The recipient's email address
 * @param {string} subject - The subject of the email
 * @param {string} htmlContent - The HTML content body of the email
 */
const sendEmail = async (to, subject, htmlContent) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("⚠️ SMTP_USER or SMTP_PASS not defined. Skipping email to:", to);
            return false;
        }

        const info = await transporter.sendMail({
            from: `"Smart Job Portal" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent
        });

        console.log(`Email sent successfully to ${to} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = {
    sendEmail
};
