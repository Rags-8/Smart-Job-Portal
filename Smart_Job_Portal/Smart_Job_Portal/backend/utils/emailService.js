const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 as the default for all network operations
// This is critical for Render/Vercel environments that have broken IPv6 routing
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const getUser = () => (process.env.SMTP_USER || "").trim();
const getPass = () => (process.env.SMTP_PASS || "").replace(/\s/g, "");

/**
 * Sends an email to the specified recipient.
 */
const sendEmail = async (to, subject, htmlContent) => {
    const user = getUser();
    const pass = getPass();

    console.log(`Node version: ${process.version}`);

    try {
        if (!user || !pass) {
            console.warn("⚠️ SMTP_USER or SMTP_PASS not defined. Skipping email to:", to);
            return false;
        }

        // Manually resolve the hostname to an IPv4 address to bypass broken IPv6
        const host = 'smtp.gmail.com';
        const ip = await new Promise((resolve, reject) => {
            dns.lookup(host, { family: 4 }, (err, address) => {
                if (err) reject(err);
                else resolve(address);
            });
        });

        console.log(`Resolved ${host} to IPv4: ${ip}`);

        const transporter = nodemailer.createTransport({
            host: ip, // Use the IP directly
            port: 587,
            secure: false,
            auth: { user, pass },
            tls: {
                servername: host, // Critical: set servername so certificate matches 'smtp.gmail.com'
                rejectUnauthorized: false // Skip cert validation if IP is used directly (only for diag/emergency)
            },
            debug: true,
            logger: true
        });

        await transporter.verify();
        console.log("SMTP Connection verified successfully.");

        const info = await transporter.sendMail({
            from: `"Smart Job Portal" <${user}>`,
            to: to,
            subject: subject,
            html: htmlContent
        });

        console.log(`Email sent successfully to ${to} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        const errorDetails = {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            recipient: to
        };
        console.error("Critical Error sending email:", errorDetails);
        return errorDetails; // Return the error object instead of just false
    }
};

module.exports = {
    sendEmail
};
