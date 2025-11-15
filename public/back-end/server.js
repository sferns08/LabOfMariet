require('dotenv').config()
const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Transporter de Nodemailer (usa los datos del .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // cámbialo a true si usas puerto 465 y tu proveedor lo requiere
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Endpoint del formulario
app.post('/api/contact', async (req, res) => {
  const { nombre, marca, idea, email, whatsapp } = req.body

  // Validación básica
  if (!nombre || !marca || !idea || !email) {
    return res.status(400).json({ ok: false, message: 'Faltan campos obligatorios.' })
  }

  const subject = `Nueva propuesta desde LabOfMariet de ${nombre}`
  const text = `
Nombre: ${nombre}
Marca/Empresa: ${marca}
Email: ${email}
WhatsApp: ${whatsapp || '-'}

Idea:
${idea}
`.trim()

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM, // tú
      to: process.env.MAIL_TO,     // también tú (donde recibes los leads)
      replyTo: email,              // el correo de la persona que ha rellenado el formulario
      subject,
      text
    })

    res.json({ ok: true, message: 'Mensaje enviado correctamente.' })
  } catch (err) {
    console.error('Error enviando email', err)
    res.status(500).json({ ok: false, message: 'Error al enviar el mensaje.' })
  }
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`)
})
