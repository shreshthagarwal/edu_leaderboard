import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import authenticate from '../middleware/authenticate.js';
import googleSheets from '../services/googleSheets.js';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Default tasks for new users
const DEFAULT_TASKS = [
  { name: 'Task 1', details: 'Complete project setup', points: 10 },
  { name: 'Task 2', details: 'Attend workshop', points: 15 },
  { name: 'Task 3', details: 'Submit assignment', points: 20 }
];

// Input validation rules
const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false
    })
    .custom(async (email) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        throw new Error('Email already in use');
      }
      return true;
    }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('domain').isIn(['webd', 'aiml', 'dsa']).withMessage('Invalid domain'),
  body('branch').trim().notEmpty().withMessage('Branch is required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4')
];


// Initialize Google Sheets
const initGoogleSheets = async () => {
  try {
    await googleSheets.init(process.env.GOOGLE_SHEET_ID);
    console.log('Google Sheets initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error);
  }
};

// Initialize on startup
initGoogleSheets();

// Signup route with validation
router.post('/signup', validateSignup, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const { name, email, password, domain, branch, year } = req.body;
    
    // Create new user with exact email (preserving dots and case)
    const user = new User({
      name: name.trim(),
      email: email,  
      password: await bcrypt.hash(password, 10),
      domain,
      branch: branch.trim(),
      year: parseInt(year),
      tasks: [
        { name: 'Task 1', completed: false, points: 10 },
        { name: 'Task 2', completed: false, points: 10 },
        { name: 'Task 3', completed: false, points: 10 },
        { name: 'Task 4', completed: false, points: 10 },
        { name: 'Task 5', completed: false, points: 10 },
        { name: 'Task 6', completed: false, points: 10 },
        { name: 'Task 7', completed: false, points: 10 },
        { name: 'Task 8', completed: false, points: 10 },
        { name: 'Task 9', completed: false, points: 10 },
        { name: 'Task 10', completed: false, points: 10 }
      ],
      role: 'student',
      points: 0,
      attendance: 0
    });

    await user.save();

    // Add user to Google Sheets
    try {
      console.log('Attempting to add user to Google Sheets:', { email: user.email, domain });
      await googleSheets.updateUserWithTasks(
        domain,
        {
          name: user.name,
          email: user.email,
          branch: user.branch,
          year: user.year,
          points: user.points,
          attendance: user.attendance
        },
        user.tasks
      );
      console.log(`Successfully added ${user.email} to Google Sheets`);
    } catch (sheetError) {
      console.error('Error adding user to Google Sheets:', {
        message: sheetError.message,
        stack: sheetError.stack,
        user: { email: user.email, domain }
      });
      // Don't fail the signup, just log the error
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Omit sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
        field: 'email'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = [];
      for (const field in error.errors) {
        errors.push({
          field,
          message: error.errors[field].message
        });
      }
      return res.status(400).json({ success: false, errors });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Omit sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user route
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ 
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      domain: user.domain,
      branch: user.branch,
      year: user.year,
      points: user.points,
      attendance: user.attendance,
      tasks: user.tasks
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize user in Google Sheets
router.post('/init-sheets', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Initialize user in Google Sheets with their tasks
    await googleSheets.updateUserWithTasks(
      user.domain,
      {
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        points: user.points || 0,
        attendance: user.attendance || 0
      },
      user.tasks || []
    );

    res.json({ 
      success: true,
      message: 'User initialized in Google Sheets' 
    });
  } catch (error) {
    console.error('Error initializing user in Google Sheets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error initializing user in Google Sheets' 
    });
  }
});

export default router;
