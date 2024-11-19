const express = require("express");
const bcrypt = require("bcryptjs"); // Importa bcrypt
const prisma = require("../prismaClient");
const authenticate = require("../middleware/authenticate"); // Middleware de autenticación
const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error al obtener perfil:", error.message);
    res.status(500).json({ error: "An error occurred while fetching the profile." });
  }
});

router.put("/edit", authenticate, async (req, res) => {
  const { name, password } = req.body;

  try {
    const dataToUpdate = {};

    if (name) {
      dataToUpdate.name = name;
    }

    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); 
      dataToUpdate.password = hashedPassword;
    }

   
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: "No data provided to update." });
    }

   
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: dataToUpdate,
    });

    res.json({ message: "Profile updated successfully", updatedUser });
  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    res.status(500).json({ error: "An error occurred while updating the profile." });
  }
});

module.exports = router;
