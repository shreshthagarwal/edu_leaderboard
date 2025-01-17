require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Added CORS support
const bcrypt = require('bcrypt'); // Required for admin setup
const User = require('./models/User'); // Required for admin setup
const app = express();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection failed:', err));

app.use(cors()); // Enable CORS for all requests
app.use(express.json());

// Define Routes
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

// Create Admin if not exists
const createAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin created successfully');
    } else {
      console.log('Admin already exists');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }
};

createAdmin();

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));