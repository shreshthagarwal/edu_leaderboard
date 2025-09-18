import mongoose from 'mongoose';

// Domain specific tasks
const DOMAIN_TASKS = {
  webd: [
    { name: 'Build Personalized HTML/CSS Project (from 6hr video: https://www.youtube.com/watch?v=G3e-cpL7ofc)', points: 100 },
    { name: 'Watch 22-Hour JavaScript Video Course (Link: https://www.youtube.com/watch?v=EerdGm-ehJQ)', points: 100 },
    { name: 'Build JavaScript Amazon Clone (Project from JS course)', points: 100 },
    { name: 'Push Amazon Clone to GitHub (Learn Git: https://www.youtube.com/watch?v=vA5TTz6BXhY)', points: 100 },
    { name: 'Watch React & TailwindCSS Courses (React: https://www.youtube.com/watch?v=dCLhUialKPQ | Tailwind: https://www.youtube.com/watch?v=6biMWgD6_JY)', points: 100 },
    { name: 'Build React Quiz App (Using Open Trivia DB API)', points: 100 },
    { name: 'Complete Backend Course - Node, Express, MongoDB (Playlist: https://youtube.com/playlist?list=PL78RhpUUKSwfeSOOwfE9x6l5jTjn5LbY3)', points: 100 },
    { name: 'Build Modified Backend Project (Airbnb Clone with a new concept)', points: 100 },
    { name: 'Plan Final Full-Stack Resume Project (Define problem statement and architecture)', points: 100 },
    { name: 'Develop & Deploy Final Full-Stack Project (Showcase all learned skills)', points: 100 }
  ],
  aiml: [
    { name: 'Foundational Python Skills: Core Syntax, Data Structures, and Functions', points: 100 },
    { name: 'Data Manipulation with NumPy and Pandas: Arrays, DataFrames, and Data Cleaning', points: 100 },
    { name: 'Data Visualization with Matplotlib and Seaborn: Creating Plots, Charts, and Statistical Graphics', points: 100 },
    { name: 'Project 1: Practical Application of Python and Data Handling Techniques', points: 100 },
    { name: 'Supervised Learning Fundamentals: Introduction to Regression and Gradient Descent', points: 100 },
    { name: 'Advanced Supervised Learning: Multiple Linear Regression and Practical Gradient Descent', points: 100 },
    { name: 'Classification and Model Optimization: Logistic Regression and Addressing Overfitting', points: 100 },
    { name: 'Project 2: Capstone Project Applying all Machine Learning Concepts Learned', points: 100 }
  ],
  dsa: [
    { name: 'Implement basic DSA concepts and array operations', points: 100 },
    { name: 'Solve problems on arrays', points: 100 },
    { name: 'Implement binary search and string manipulation', points: 100 },
    { name: 'Solve problems on binary search and strings', points: 100 },
    { name: 'Implement recursion and backtracking algorithms', points: 100 },
    { name: 'Solve problems on recursion and backtracking', points: 100 },
    { name: 'Implement stack and queue from scratch', points: 100 },
    { name: 'Solve problems on stack and queue', points: 100 },
    { name: 'Implement sliding window and two pointer techniques', points: 100 },
    { name: 'Solve problems using sliding window and two pointers', points: 100 },
    { name: 'Implement linked lists and binary trees', points: 100 },
    { name: 'Solve problems on linked lists and binary trees', points: 100 },
    { name: 'Implement binary search trees and heaps', points: 100 },
    { name: 'Solve problems on binary search trees and heaps', points: 100 },
    { name: 'Implement advanced heaps and graph algorithms', points: 100 },
    { name: 'Solve problems on heaps and graphs', points: 100 },
    { name: 'Participate in weekly quizzes (all weeks)', points: 100 },
    { name: 'Contribute to weekly discussion sessions', points: 100 }
  ]
};

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    set: v => v.toLowerCase()
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: { 
    type: String, 
    enum: ['student', 'admin'], 
    default: 'student' 
  },
  domain: { 
    type: String, 
    enum: ['webd', 'aiml', 'dsa', null],
    required: [
      function() { return this.role === 'student'; },
      'Domain is required for students'
    ]
  },
  branch: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1,
    max: 4
  },
  points: { 
    type: Number, 
    default: 0,
    min: 0
  },
  tasks: [{
    name: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      required: true
    },
    dueDate: Date
  }]
}, {
  timestamps: true
});

// Create a text index for case-insensitive search
userSchema.index({ email: 'text' });

// Pre-save hook to set default tasks based on domain
userSchema.pre('save', function(next) {
  if (this.isNew && this.domain && DOMAIN_TASKS[this.domain]) {
    this.tasks = DOMAIN_TASKS[this.domain].map(task => ({
      name: task.name,
      points: task.points,
      completed: false
    }));
  }
  next();
});

// Pre-save hook to ensure domain is null for admin users
userSchema.pre('save', function(next) {
  if (this.role === 'admin') {
    this.domain = null;
  }
  next();
});

// Static method for case-insensitive email lookup
userSchema.statics.findByEmail = async function(email) {
  return this.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
};

// Add this method to the User schema
userSchema.methods.calculatePoints = function() {
  return this.tasks.reduce((total, task) => {
    return task.completed ? total + task.points : total;
  }, 0);
};

export default mongoose.model('User', userSchema);
