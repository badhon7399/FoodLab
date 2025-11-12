import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, text, html }) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: Number(process.env.EMAIL_SMTP_PORT || 587),
        secure: false,
        auth: process.env.EMAIL_SMTP_USER ? {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS,
        } : undefined,
    })

    return transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
    })
}
