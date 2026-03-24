const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ REGISTER ADMIN (only once)
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    await admin.save();
    res.json({ message: "Admin registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ LOGIN ADMIN
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};