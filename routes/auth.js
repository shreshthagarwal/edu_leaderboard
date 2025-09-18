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

// Domain-specific tasks
const DOMAIN_TASKS = {
  webd: [
    {
      "name": "Build Personalized HTML/CSS Project (from 6hr video: https://www.youtube.com/watch?v=G3e-cpL7ofc)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Watch 22-Hour JavaScript Video Course (Link: https://www.youtube.com/watch?v=EerdGm-ehJQ)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Build JavaScript Amazon Clone (Project from JS course)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Push Amazon Clone to GitHub (Learn Git: https://www.youtube.com/watch?v=vA5TTz6BXhY)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Watch React & TailwindCSS Courses (React: https://www.youtube.com/watch?v=dCLhUialKPQ | Tailwind: https://www.youtube.com/watch?v=6biMWgD6_JY)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Build React Quiz App (Using Open Trivia DB API)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Complete Backend Course - Node, Express, MongoDB (Playlist: https://youtube.com/playlist?list=PL78RhpUUKSwfeSOOwfE9x6l5jTjn5LbY3)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Build Modified Backend Project (Airbnb Clone with a new concept)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Plan Final Full-Stack Resume Project (Define problem statement and architecture)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Develop & Deploy Final Full-Stack Project (Showcase all learned skills)",
      "completed": false,
      "points": 100
    }
  ],
  aiml: [
    {
      "name": "Foundational Python Skills: Core Syntax, Data Structures, and Functions",
      "completed": false,
      "points": 100
    },
    {
      "name": "Data Manipulation with NumPy and Pandas: Arrays, DataFrames, and Data Cleaning",
      "completed": false,
      "points": 100
    },
    {
      "name": "Data Visualization with Matplotlib and Seaborn: Creating Plots, Charts, and Statistical Graphics",
      "completed": false,
      "points": 100
    },
    {
      "name": "Project 1: Practical Application of Python and Data Handling Techniques",
      "completed": false,
      "points": 100
    },
    {
      "name": "Supervised Learning Fundamentals: Introduction to Regression and Gradient Descent",
      "completed": false,
      "points": 100
    },
    {
      "name": "Advanced Supervised Learning: Multiple Linear Regression and Practical Gradient Descent",
      "completed": false,
      "points": 100
    },
    {
      "name": "Classification and Model Optimization: Logistic Regression and Addressing Overfitting",
      "completed": false,
      "points": 100
    },
    {
      "name": "Project 2: Capstone Project Applying all Machine Learning Concepts Learned",
      "completed": false,
      "points": 100
    }
  ],
  dsa: [
    {
      "name": "Implement basic DSA concepts and array operations",
      "completed": false,
      "points": 100
    },
    {
      "name": "Solve problems on arrays",
      "completed": false,
      "points": 100
    },
    {
      "name": "Implement binary search and string manipulation",
      "completed": false,
      "points": 100
    },
    {
      "name": "Solve problems on binary search and strings",
      "completed": false,
      "points": 100
    },
    {
      "name": "Implement recursion and backtracking algorithms",
      "completed": false,
      "points": 100
    },
    {
      "name": "Solve problems on recursion and backtracking",
      "completed": false,
      "points": 100
    },
    {
      "name": "Implement stack and queue from scratch",
      "completed": false,
      "points": 100
    },
    {
      "name": "Solve problems on stack and queue",
      "completed": false,
      "points": 100
    },
    {
      "name": "Implement sliding window and two pointer techniques",
      "completed": false,
      "points": 100
    },
    {
      "name": "Solve problems using sliding window and two pointers",
      "completed": false,
      "points": 100
    },
    {
      "name": "Implement linked lists and binary trees",
      "completed": false,
      "points": 100
    },
    {
      "name": "Solve problems on linked lists and binary trees",
      "completed": false,
      "points": 100
    },
    {
      "name": "Implement binary search trees and heaps",
      "completed": false,
      "points": 100
    },
    {
      "name": "Solve problems on binary search trees and heaps",
      "completed": false,
      "points": 100
    },
    {
      "name": "Implement advanced heaps and graph algorithms",
      "completed": false,
      "points": 100
    },
    {
      "name": "Solve problems on heaps and graphs",
      "completed": false,
      "points": 100
    },
    {
      "name": "Participate in weekly quizzes (all weeks)",
      "completed": false,
      "points": 100
    },
    {
      "name": "Contribute to weekly discussion sessions",
      "completed": false,
      "points": 100
    }
  ]
};

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
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with domain-specific tasks
    const user = new User({
      name,
      email,
      password: hashedPassword,
      domain,
      branch,
      year,
      tasks: DOMAIN_TASKS[domain] || [],
      role: 'student',
      points: 0,
      attendance: 0
    });

    await user.save();

    // Add user to Google Sheets with their domain-specific tasks
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
        user.tasks.map(task => ({
          name: task.name,
          completed: task.completed || false,
          points: task.points || 0
        }))
      );
      console.log(`Successfully added ${user.email} to Google Sheets with ${user.tasks.length} tasks`);
    } catch (sheetError) {
      console.error('Error adding user to Google Sheets:', {
        message: sheetError.message,
        stack: sheetError.stack,
        user: { email: user.email, domain }
      });
      // Don't fail the request if Google Sheets update fails
      console.warn('User created but Google Sheets update failed. User can still use the system.');
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
