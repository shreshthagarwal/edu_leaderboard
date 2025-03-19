const express = require('express');
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');
const Request = require('../models/Request');
const router = express.Router();

// Middleware to check role
const checkStudentRole = (req, res, next) => {
  if (req.user.role !== 'student' && req.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }
  next();
};
// Leaderboard route
router.get('/leaderboard', authenticate, checkStudentRole, async (req, res) => {
  const students = await User.find({ role: 'student' }).sort({ points: -1 });
  res.status(200).json(students);
});

// Request points route with 16-hour restriction
router.post('/request', authenticate, checkStudentRole, async (req, res) => {
  const { taskDescription } = req.body;

  try {
    const lastRequest = await Request.findOne({ studentId: req.user.id }).sort({ createdAt: -1 });

    if (lastRequest) {
      const timeDifference = (Date.now() - lastRequest.createdAt) / (1000 * 60 * 60); // Convert to hours
      if (timeDifference < 16) {
        return res.status(400).json({ error: 'You have already sent a request today.' });
      }
    }

    const request = new Request({ studentId: req.user.id, taskDescription });
    await request.save();

    res.status(201).json({ message: 'Task request submitted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
