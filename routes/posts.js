const express = require("express");
const prisma = require("../prismaClient");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  const { title, content } = req.body; 

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId: req.userId,
      },
      include: { user: true }, 
    });
    res.status(201).json(post); 
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { user: true }, 
      orderBy: { createdAt: "desc" }, 
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
