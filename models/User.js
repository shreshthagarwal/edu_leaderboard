import mongoose from 'mongoose';

// Domain specific tasks
const DOMAIN_TASKS = {
  webd: [
    { name: 'Build a responsive portfolio website', points: 10 },
    { name: 'Create a CRUD application with React', points: 15 },
    { name: 'Implement user authentication', points: 20 },
    { name: 'Build a RESTful API with Node.js', points: 20 },
    { name: 'Create a responsive landing page', points: 10 },
    { name: 'Implement form validation', points: 10 },
    { name: 'Build a weather app with API integration', points: 15 },
    { name: 'Create a blog with CMS functionality', points: 20 },
    { name: 'Optimize website performance', points: 15 },
    { name: 'Deploy a full-stack application', points: 25 }
  ],
  aiml: [
    { name: 'Implement linear regression from scratch', points: 15 },
    { name: 'Build an image classifier with CNN', points: 25 },
    { name: 'Create a chatbot using NLP', points: 20 },
    { name: 'Implement a recommendation system', points: 25 },
    { name: 'Work with a real-world dataset', points: 15 },
    { name: 'Train a model with TensorFlow/PyTorch', points: 20 },
    { name: 'Implement data preprocessing pipeline', points: 15 },
    { name: 'Create a computer vision application', points: 25 },
    { name: 'Deploy a machine learning model', points: 20 },
    { name: 'Work on a Kaggle competition', points: 30 }
  ],
  dsa: [
    { name: 'Implement common sorting algorithms', points: 15 },
    { name: 'Solve 20+ Leetcode easy problems', points: 20 },
    { name: 'Implement binary search tree', points: 15 },
    { name: 'Solve 15+ Leetcode medium problems', points: 25 },
    { name: 'Implement graph traversal algorithms', points: 20 },
    { name: 'Solve 5+ Leetcode hard problems', points: 30 },
    { name: 'Implement dynamic programming solutions', points: 25 },
    { name: 'Solve problems on recursion', points: 20 },
    { name: 'Implement common data structures', points: 25 },
    { name: 'Participate in a coding competition', points: 30 }
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
