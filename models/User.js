import mongoose from 'mongoose';

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
    details: String,
    completed: { 
      type: Boolean, 
      default: false 
    },
    points: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Create a text index for case-insensitive search
userSchema.index({ email: 'text' });

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