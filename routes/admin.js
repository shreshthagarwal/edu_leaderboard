import express from 'express';
import authenticate from '../middleware/authenticate.js';
import User from '../models/User.js';
import Request from '../models/Request.js';

const router = express.Router();

// Middleware to check role
const checkAdminRole = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).send('Access denied');
  next();
};

// Get pending requests
router.get('/requests', authenticate, checkAdminRole, async (req, res) => {
  const requests = await Request.find({ status: 'pending' }).populate('studentId', 'name email');
  res.status(200).json(requests);
});

// Update request status
router.post('/requests/:id', authenticate, checkAdminRole, async (req, res) => {
  const { id } = req.params;
  const { status, customPoints } = req.body;

  try {
    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (status === 'accepted') {
      request.customPoints = customPoints;
      const student = await User.findById(request.studentId);
      student.points += customPoints;
      await student.save();
    }

    await Request.deleteOne({ _id: id }); // Correctly delete the request
    res.status(200).json({ message: 'Request processed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign points manually
router.post('/assign-points', authenticate, checkAdminRole, async (req, res) => {
  const { id, points } = req.body;

  try {
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.points += points; // Add points to the student
    await student.save();

    res.status(200).json({ message: 'Points assigned successfully', student });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
