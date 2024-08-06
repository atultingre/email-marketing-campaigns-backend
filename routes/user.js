const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Campaign = require("../models/Campaign");
const bcrypt = require("bcryptjs");

const router = express.Router();
const jwt_sceret = "atultingre.work@gmail.com";
const generateToken = (id) => {
  return jwt.sign({ id }, jwt_sceret, {
    expiresIn: "30d",
  });
};

// Signup Route
router.post("/api/users/signup", async (req, res) => {
  const { name, employeeId, password } = req.body;

  try {
    const userExists = await User.findOne({ employeeId });

    if (userExists) {
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    const user = await User.create({ name, employeeId, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      employeeId: user.employeeId,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login Route
router.post("/api/users/login", async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const user = await User.findOne({ employeeId });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid Employee ID or Password" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, jwt_sceret);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      console.error("Token verification failed:", err.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.error("No token provided");
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Create a new campaign
router.post("/api/campaigns", protect, async (req, res) => {
  try {
    const campaign = new Campaign({ ...req.body, user: req.user._id });
    await campaign.save();
    res.status(201).send(campaign);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all campaigns
router.get("/api/campaigns", protect, async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).populate("user", "name");
    res.status(200).send(campaigns);
  } catch (err) {
    console.error("Error fetching campaigns:", err.message);
    res.status(400).send({ message: "Failed to fetch campaigns" });
  }
});

router.put("/api/campaigns/:id", protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "User not authorized to update this campaign" });
    }

    // Update campaign details
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCampaign);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete a campaign
router.delete("/api/campaigns/:id", protect, async (req, res) => {
  try {
    // Check if campaign exists
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      console.log("Campaign not found:", req.params.id);
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Check if user is authorized
    if (campaign.user.toString() !== req.user._id.toString()) {
      console.log("User not authorized:", req.user._id);
      return res
        .status(401)
        .json({ message: "User not authorized to delete this campaign" });
    }

    // Delete the campaign
    await Campaign.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Campaign deleted successfully", campaign });
  } catch (err) {
    console.error("Error details:", err.message, err.stack);
    res
      .status(500)
      .json({ message: "Failed to delete campaign", error: err.message });
  }
});

module.exports = router;
