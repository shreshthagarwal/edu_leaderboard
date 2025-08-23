import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import googleSheets from '../services/googleSheets.js';

const router = express.Router();

// Get user tasks from Google Sheets
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email domain branch year points attendance');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Get user's row from Google Sheets
    const sheetName = user.domain.toUpperCase();
    const sheet = googleSheets.doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      return res.json({
        success: true,
        tasks: [],
        user: {
          name: user.name,
          email: user.email,
          domain: user.domain,
          branch: user.branch,
          year: user.year,
          points: user.points || 0,
          attendance: user.attendance || 0
        }
      });
    }

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const userRow = rows.find(row => 
      row.get('Email')?.toLowerCase() === user.email.toLowerCase()
    );

    if (!userRow) {
      return res.json({
        success: true,
        tasks: [],
        user: {
          name: user.name,
          email: user.email,
          domain: user.domain,
          branch: user.branch,
          year: user.year,
          points: user.points || 0,
          attendance: user.attendance || 0
        }
      });
    }

    // Process tasks from the sheet
    const tasks = [];
    const headers = sheet.headerValues;
    
    // Find all task columns (columns that start with 'Task: ')
    headers.forEach((header, index) => {
      if (header.startsWith('Task: ')) {
        const taskName = header.replace('Task: ', '');
        const taskStatus = userRow.get(header);
        
        tasks.push({
          id: `task-${index}`,
          name: taskName,
          completed: taskStatus === '✅',
          points: 10 // Default points per task
        });
      }
    });

    res.json({
      success: true,
      tasks,
      user: {
        name: user.name,
        email: user.email,
        domain: user.domain,
        branch: user.branch,
        year: user.year,
        points: user.points || 0,
        attendance: user.attendance || 0
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching tasks' 
    });
  }
});

// Update task status
router.put('/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Completed status is required and must be a boolean'
      });
    }

    const user = await User.findById(req.user._id).select('name email domain branch year points attendance');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Get user's row from Google Sheets
    const sheetName = user.domain.toUpperCase();
    const sheet = googleSheets.doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Domain sheet not found'
      });
    }

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const userRow = rows.find(row => 
      row.get('Email')?.toLowerCase() === user.email.toLowerCase()
    );

    if (!userRow) {
      return res.status(404).json({
        success: false,
        message: 'User data not found in the sheet'
      });
    }

    // Find the task column
    const taskHeader = `Task: ${taskId.replace('task-', '')}`;
    if (!sheet.headerValues.includes(taskHeader)) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update task status in the sheet
    userRow.set(taskHeader, completed ? '✅' : '❌');
    await userRow.save();

    // Recalculate points
    let totalPoints = 0;
    sheet.headerValues.forEach(header => {
      if (header.startsWith('Task: ') && userRow.get(header) === '✅') {
        totalPoints += 10; // 10 points per completed task
      }
    });

    // Update points in the sheet and database
    userRow.set('Points', totalPoints.toString());
    await userRow.save();

    // Update user in database
    user.points = totalPoints;
    await user.save();

    // Update the leaderboard ranking
    await googleSheets.updateUserWithTasks(
      user.domain,
      {
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        points: user.points,
        attendance: user.attendance
      },
      [] // We don't need to pass tasks here as we're just updating points
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      points: totalPoints
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating task' 
    });
  }
});

export default router;
