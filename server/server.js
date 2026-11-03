require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const News = require("./models/News");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Verify logged-in user
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
};


// Allow only admin users
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin permission required.",
    });
  }

  next();
};


app.get("/", (req, res) => {
  res.send("LocalBuzz backend is running!");
});

// Register API
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "Registration successful!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Login API
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

app.post("/api/news", verifyToken, async (req, res) => {
  try {
    console.log("POST /api/news received");
console.log("Request body:", req.body);
    const {
  title,
  description,
  location,
  category,
  imageUrl,
  videoUrl,
  audioUrl,
} = req.body;

const news = new News({
  title,
  description,
  location,
  category,
  imageUrl,
  videoUrl,
  audioUrl,
  submittedBy: req.user.userId,
});

    await news.save();

    res.status(201).json({
      message: "News submitted successfully!",
      news,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit news",
      error: error.message,
    });
  }
});

// Get news submitted by the logged-in user
app.get("/api/news/my-submissions", verifyToken, async (req, res) => {
  try {
    const news = await News.find({
      submittedBy: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your submissions",
      error: error.message,
    });
  }
});

app.get("/api/news/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch submitted news",
      error: error.message,
    });
  }
});

app.get("/api/news", async (req, res) => {
  try {
    const news = await News.find({ status: "approved" }).sort({
  createdAt: -1,
});

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch news",
      error: error.message,
    });
  }
});


const PORT = process.env.PORT || 5000;

app.patch(
  "/api/news/:id/status",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { status, reviewerComment } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedNews = await News.findByIdAndUpdate(
        req.params.id,
        {
          status,
          reviewerComment: reviewerComment || "",
        },
        { new: true, runValidators: true }
      );

      if (!updatedNews) {
        return res.status(404).json({
          message: "News submission not found",
        });
      }

      res.status(200).json({
        message: `News ${status} successfully!`,
        news: updatedNews,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update news status",
        error: error.message,
      });
    }
  }
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
