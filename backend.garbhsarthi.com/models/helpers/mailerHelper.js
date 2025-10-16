import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: 'mail.garbhsarthi.com',
    port: 587,
    secure: false,          // STARTTLS
    requireTLS: true,
    family: 4,
    name: 'mail.garbhsarthi.com',
    auth: { user: 'mayank', pass: 'Pa$$W0rd@123' },
    logger: true,
    debug: true,
});

export async function sendEmail({
                                    to,
                                    subject,
                                    html,
                                    text,
                                    headers={},
                                    from = '"Garbhsarthi" <info@garbhsarthi.com>',
                                    envelopeFrom = "info@garbhsarthi.com",
                                    attachments = []
                                }) {

    const message = {
        from,
        to,
        subject,
        text: text || html?.replace(/<[^>]+>/g, " ").trim() || " ",
        html,
        envelope: { from: envelopeFrom, to },
        messageId: `<${Date.now()}.${Math.random().toString(36).slice(2)}@mail.garbhsarthi.com>`,
    };

    try {
        const info = await transporter.sendMail(message);
        return { ok: true, id: info.messageId, response: info.response };
    } catch (err) {
        const why = err?.response || err?.message || String(err);
        return { ok: false, error: why, code: err?.code };
    }
}
