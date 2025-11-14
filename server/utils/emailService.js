import nodemailer from 'nodemailer'

// Creates a transporter using either Gmail SMTP (recommended with App Password)
// or a generic SMTP server via EMAIL_SMTP_* variables.
function createTransporter() {
    const gmailUser = process.env.SMTP_GMAIL_USER
    const gmailPass = process.env.SMTP_GMAIL_PASS

    if (gmailUser && gmailPass) {
        // Gmail SMTP using App Password (preferred for simplicity)
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: gmailUser, pass: gmailPass },
            connectionTimeout: 10000,
            socketTimeout: 10000,
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
    })
}

export async function sendEmail({ to, subject, text, html }) {
    const transporter = createTransporter()

    const from =process.env.SMTP_GMAIL_USER

    return transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
    })
}
