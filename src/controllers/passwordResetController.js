const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: config.get('postgresURI') });
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuración del transportador de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para generar una contraseña segura
const generateSecurePassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id FROM public."Users" WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      client.release();
      return res.status(400).json({ message: 'Email not found' });
    }

    const user = result.rows[0];

    // Generar un token de recuperación
    const token = crypto.randomBytes(20).toString('hex');

    // Guardar el token y su expiración en la base de datos
    const expiration = Date.now() + 3600000; // 1 hora
    await client.query('UPDATE public."Users" SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3', [token, expiration, user.id]);
    client.release();

    // Enviar el correo electrónico con el diseño profesional
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #003399;
              padding: 20px;
              color: #ffffff;
              text-align: center;
            }
            .header h1 {
              margin: 0;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
            .content p {
              font-size: 16px;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin-top: 20px;
              background-color: #003399;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
              <p>Please click on the following button, or paste the link into your browser to complete the process:</p>
              <a href="http://${req.headers.host}/reset-password/${token}" class="button">Reset Password</a>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Your Company. All rights reserved.</p>
              <p>Your Company Address</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.error('There was an error:', error);
        res.status(500).json({ message: 'Error sending email' });
      } else {
        res.status(200).json({ message: 'Recovery email sent' });
      }
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, reset_password_expires FROM public."Users" WHERE reset_password_token = $1', [token]);

    if (result.rows.length === 0) {
      client.release();
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = result.rows[0];

    if (user.reset_password_expires < Date.now()) {
      client.release();
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Generar una nueva contraseña segura
    const newPassword = generateSecurePassword();

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña del usuario y eliminar el token
    await client.query('UPDATE public."Users" SET password = $1, reset_password_token = $2, reset_password_expires = $3 WHERE id = $4', [hashedPassword, null, null, user.id]);
    client.release();

    // Enviar la nueva contraseña por correo electrónico
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Your new password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #003399;
              padding: 20px;
              color: #ffffff;
              text-align: center;
            }
            .header h1 {
              margin: 0;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
            .content p {
              font-size: 16px;
              line-height: 1.5;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your New Password</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your password has been successfully reset. Here is your new password:</p>
              <p><strong>${newPassword}</strong></p>
              <p>Please change it after logging in.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Your Company. All rights reserved.</p>
              <p>Your Company Address</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.error('There was an error:', error);
        res.status(500).json({ message: 'Error sending email' });
      } else {
        res.status(200).json({ message: 'Password updated successfully and sent to your email' });
      }
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
