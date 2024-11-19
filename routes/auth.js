const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return res.status(400).json({ message: 'El nombre no debe contener números o caracteres especiales' });
    }

    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'El correo electrónico no tiene un formato válido' });
    }

   
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

   
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email.toLowerCase(), mode: 'insensitive' } },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(), 
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Hubo un problema al registrar el usuario' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    
    const normalizedEmail = email.toLowerCase();

    
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    
    const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });

    res.json({ token, message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    res.status(500).json({ error: 'Hubo un problema al iniciar sesión' });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

module.exports = router;
