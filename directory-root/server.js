require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir carpeta public al inicio
app.use(express.static(path.join(__dirname, 'public')));

// Transporter de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // poner true solo si usas 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Endpoint del formulario
app.post('/api/contact', async (req, res) => {
  const { nombre, marca, idea, email, whatsapp } = req.body;

  if (!nombre || !marca || !idea || !email) {
    return res.status(400).json({
      ok: false,
      message: 'Faltan campos obligatorios.',
    });
  }

  const subject = `Nueva propuesta desde LabOfMariet de ${nombre}`;
  const text = `
Nombre: ${nombre}
Marca/Empresa: ${marca}
Email: ${email}
WhatsApp: ${whatsapp || '-'}

Idea:
${idea}
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject,
      text,
    });

    res.json({ ok: true, message: 'Mensaje enviado correctamente.' });
  } catch (err) {
    console.error('Error enviando email', err);
    res.status(500).json({ ok: false, message: 'Error al enviar el mensaje.' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
