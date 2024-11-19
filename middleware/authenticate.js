const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient'); 

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization']; 
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; 
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const verified = jwt.verify(token, 'secret_key');
    req.userId = verified.id; 

    // Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true }, 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    console.log('User authenticated:', user); 
    next(); 
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;
