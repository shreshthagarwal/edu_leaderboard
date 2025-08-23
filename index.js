import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';
import leaderboardRoutes from './routes/leaderboard.js';
import taskRoutes from './routes/tasks.js';
import googleSheets from './services/googleSheets.js';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Create Admin if not exists
const createAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Admin user not created.');
    return;
  }

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        domain: 'webd', // Default domain for admin
        branch: 'ADMIN',
        year: 1
      });
      await admin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Check required environment variables
    const requiredEnvVars = [
      'MONGO_URI',
      'JWT_SECRET',
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_SHEETS_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Initialize Google Sheets
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        console.log('Initializing Google Sheets with ID:', process.env.GOOGLE_SHEETS_ID);
        console.log('Using service account email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
        
        await googleSheets.init(process.env.GOOGLE_SHEETS_ID);
        console.log('Google Sheets initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Google Sheets:');
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data
        });
        console.error('Make sure:');
        console.error('1. The Google Sheet exists and is accessible');
        console.error('2. The service account email has edit access to the sheet');
        console.error('3. The GOOGLE_PRIVATE_KEY is correctly formatted with newlines');
        process.exit(1);
      }
    } else {
      console.warn('GOOGLE_SHEETS_ID not set. Google Sheets functionality will be disabled');
    }

    // Create admin user
    await createAdmin();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Start the server
startServer();

export default app;
