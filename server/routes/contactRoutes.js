import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async(req, res) => {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
            subject: `${category} - ${subject}`,
            html: `
                <h3> PrepEdge AI : New Message Received </h3>
                <hr>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

export default router;