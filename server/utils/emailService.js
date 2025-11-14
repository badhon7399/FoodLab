import nodemailer from 'nodemailer'

// Gmail/generic SMTP only (no external HTTP providers)
function createTransporter() {
    const gmailUser = process.env.SMTP_GMAIL_USER
    const gmailPass = process.env.SMTP_GMAIL_PASS
    const debug = String(process.env.EMAIL_DEBUG || '').toLowerCase() === 'true'

    if (gmailUser && gmailPass) {
        // Prefer STARTTLS 587 to avoid 465 blocks; can override via SMTP_GMAIL_PORT
        const port = Number(process.env.SMTP_GMAIL_PORT || 587)
        const useSecure = port === 465
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port,
            secure: useSecure,
            requireTLS: !useSecure,
            auth: { user: gmailUser, pass: gmailPass },
            connectionTimeout: Number(process.env.EMAIL_SMTP_TIMEOUT || 10000),
            socketTimeout: Number(process.env.EMAIL_SMTP_TIMEOUT || 10000),
            logger: debug,
            debug,
        })
    }

    // Generic SMTP fallback
    return nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: Number(process.env.EMAIL_SMTP_PORT || 587),
        secure: String(process.env.EMAIL_SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.EMAIL_SMTP_PORT) === 465,
        auth: process.env.EMAIL_SMTP_USER
            ? { user: process.env.EMAIL_SMTP_USER, pass: process.env.EMAIL_SMTP_PASS }
            : undefined,
        connectionTimeout: Number(process.env.EMAIL_SMTP_TIMEOUT || 10000),
        socketTimeout: Number(process.env.EMAIL_SMTP_TIMEOUT || 10000),
        logger: debug,
        debug,
    })
}

export async function sendEmail({ to, subject, text, html }) {
    const transporter = createTransporter()
    const from = process.env.EMAIL_FROM || process.env.SMTP_GMAIL_USER || 'no-reply@example.com'
    return transporter.sendMail({ from, to, subject, text, html })
}
