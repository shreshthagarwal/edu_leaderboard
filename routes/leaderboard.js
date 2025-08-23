import express from 'express';
import { auth } from '../middleware/auth.js';
import googleSheets from '../services/googleSheets.js';

const router = express.Router();

// Map domain to sheet names
const DOMAIN_TO_SHEET = {
  webd: 'WEBD',
  aiml: 'AIML',
  dsa: 'DSA'
};

// Get leaderboard by domain - Public access
router.get('/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Validate domain
    if (!DOMAIN_TO_SHEET[domain]) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid domain. Must be one of: webd, aiml, dsa' 
      });
    }

    // Check if Google Sheets is initialized
    if (!googleSheets.initialized) {
      return res.status(503).json({
        success: false,
        message: 'Leaderboard service is currently unavailable. Please try again later.'
      });
    }

    const sheetName = DOMAIN_TO_SHEET[domain];
    
    try {
      // Get the sheet for the domain
      const sheet = googleSheets.doc.sheetsByTitle[sheetName];
      
      // If sheet doesn't exist, return empty array
      if (!sheet) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Load the header row and get all rows
      await sheet.loadHeaderRow();
      const rows = await sheet.getRows();
      
      // Format the data
      const leaderboardData = rows.map(row => {
        return {
          rank: row.get('Rank') || '',
          name: row.get('Name') || '',
          email: row.get('Email') || '',
          branch: row.get('Branch') || '',
          year: row.get('Year') || '',
          attendance: row.get('Attendance') || '0',
          points: row.get('Points') || '0'
        };
      });
      
      // Sort by points descending (as a fallback, though it should be sorted in the sheet)
      leaderboardData.sort((a, b) => {
        return (parseInt(b.points) || 0) - (parseInt(a.points) || 0);
      });
      
      // Update ranks in the sorted order
      leaderboardData.forEach((user, index) => {
        user.rank = (index + 1).toString();
      });

      return res.json({
        success: true,
        data: leaderboardData
      });
      
    } catch (error) {
      console.error(`Error getting leaderboard for ${sheetName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard data'
      });
    }
    
  } catch (error) {
    console.error('Error in leaderboard route:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all tasks for a domain (for admin)
router.get('/:domain/tasks', auth, async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Only admin can access all tasks
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view tasks' 
      });
    }

    if (!DOMAIN_TO_SHEET[domain]) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid domain' 
      });
    }

    const users = await User.find({ domain, role: 'student' })
      .select('name email tasks')
      .sort({ 'name': 1 });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
