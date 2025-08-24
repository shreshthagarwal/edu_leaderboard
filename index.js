import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { createServer } from 'http';
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
  origin: ['http://localhost:3000', 'http://localhost:5000', 'https://edu-leaderboard.vercel.app'],
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
    const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Error: Missing required environment variables:', missingVars.join(', '));
      process.exit(1);
    }

    // Connect to MongoDB
    try {
      console.log('🔌 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected successfully');
    } catch (dbError) {
      console.error('❌ MongoDB connection error:', dbError.message);
      console.error('Please check your MongoDB connection string and ensure MongoDB is running');
      process.exit(1);
    }

    // Initialize Google Sheets if configured
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        console.log('📊 Initializing Google Sheets...');
        await googleSheets.init(process.env.GOOGLE_SHEETS_ID);
        console.log('✅ Google Sheets initialized successfully');
      } catch (sheetsError) {
        console.warn('⚠️  Google Sheets initialization warning:', sheetsError.message);
        console.warn('Google Sheets functionality will be disabled');
      }
    }

    // Create admin user
    try {
      await createAdmin();
    } catch (adminError) {
      console.warn('⚠️  Admin user creation warning:', adminError.message);
    }

    // Create HTTP server
    const server = createServer(app);
    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
      console.log('\nPress Ctrl+C to stop the server\n');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        console.log('👋 Server stopped');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
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
