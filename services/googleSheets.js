import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

class GoogleSheetsService {
  constructor() {
    this.doc = null;
    this.initialized = false;
  }

  async init(spreadsheetId) {
    try {
      if (!spreadsheetId) {
        throw new Error('Spreadsheet ID is required');
      }

      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Missing required Google service account credentials');
      }

      console.log('Initializing Google Sheets with spreadsheet ID:', spreadsheetId);
      
      const auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.doc = new GoogleSpreadsheet(spreadsheetId, auth);
      
      // Test the connection
      await this.doc.loadInfo();
      console.log(`Connected to Google Sheets: ${this.doc.title}`);
      this.initialized = true;
      return true;
      
    } catch (error) {
      console.error('Error initializing Google Sheets:', error.message);
      throw new Error(`Failed to initialize Google Sheets: ${error.message}`);
    }
  }

  checkInitialized() {
    if (!this.initialized) {
      throw new Error('Google Sheets not initialized. Call init() first.');
    }
    return true;
  }

  async getOrCreateSheet(title, headers) {
    this.checkInitialized();
    try {
      let sheet;
      try {
        sheet = this.doc.sheetsByTitle[title];
        if (!sheet) {
          sheet = await this.doc.addSheet({ title, headerValues: headers });
          console.log(`Created new sheet: ${title}`);
        } else {
          // Only set headers if they don't match existing ones
          await sheet.loadHeaderRow();
          const existingHeaders = sheet.headerValues || [];
          if (JSON.stringify(existingHeaders) !== JSON.stringify(headers)) {
            await sheet.setHeaderRow(headers);
          }
        }
        return sheet;
      } catch (error) {
        console.error(`Error getting/creating sheet ${title}:`, error);
        throw error;
      }
    } catch (error) {
      console.error('Error in getOrCreateSheet:', error.message);
      throw error;
    }
  }

  async updateSheet(sheetName, rows) {
    this.checkInitialized();
    try {
      if (!this.initialized) {
        throw new Error('Google Sheets not initialized');
      }

      try {
        const headers = ['Rank', 'Name', 'Email', 'Branch', 'Year', 'Attendance', 'Points'];
        const sheet = await this.getOrCreateSheet(sheetName, headers);
        
        // Add rows to the sheet
        await sheet.addRows(rows);
        console.log(`Updated ${sheetName} with ${rows.length} rows`);
        
        // Auto-resize columns
        await sheet.autoResizeColumns(1, headers.length);
        
        return true;
      } catch (error) {
        console.error('Error updating sheet:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateSheet:', error.message);
      throw error;
    }
  }

  async getSheetData(sheetName) {
    this.checkInitialized();
    try {
      if (!this.initialized) {
        throw new Error('Google Sheets not initialized');
      }

      try {
        const sheet = this.doc.sheetsByTitle[sheetName];
        if (!sheet) {
          return [];
        }
        
        await sheet.loadHeaderRow();
        const rows = await sheet.getRows();
        
        return rows.map(row => {
          const data = {};
          sheet.headerValues.forEach(header => {
            data[header.toLowerCase()] = row[header];
          });
          return data;
        });
      } catch (error) {
        console.error('Error getting sheet data:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in getSheetData:', error.message);
      throw error;
    }
  }

  async updateUserWithTasks(domain, userData, tasks = []) {
    this.checkInitialized();
    
    try {
      if (!domain) {
        console.error('Domain is required to update user tasks');
        return;
      }

      const sheetName = domain.toUpperCase();
      console.log(`Updating user in sheet: ${sheetName}`, { email: userData.email });

      // Get or create the sheet with default headers
      const defaultHeaders = [
        'Rank', 'Name', 'Email', 'Branch', 'Year', 'Attendance', 'Points'
      ];
      
      const sheet = await this.getOrCreateSheet(sheetName, defaultHeaders);
      
      // Get existing headers
      await sheet.loadHeaderRow();
      const existingHeaders = sheet.headerValues || [];
      
      // Add task columns if they don't exist
      const taskHeaders = [];
      tasks.forEach((task, index) => {
        const taskName = task.name || `Task ${index + 1}`;
        taskHeaders.push(`Task: ${taskName}`);
      });
      
      const headersToAdd = taskHeaders.filter(header => !existingHeaders.includes(header));
      
      if (headersToAdd.length > 0) {
        // Add new task columns
        const newHeaders = [...existingHeaders, ...headersToAdd];
        await sheet.setHeaderRow(newHeaders);
        console.log(`Added ${headersToAdd.length} task columns to ${sheetName} sheet`);
      }
      
      // Reload headers after potential updates
      await sheet.loadHeaderRow();
      const allHeaders = sheet.headerValues;
      
      // Load all rows to find the user
      const rows = await sheet.getRows();
      const userRowIndex = rows.findIndex(row => 
        row.get('Email')?.toLowerCase() === userData.email?.toLowerCase()
      );

      // Prepare user data for the sheet
      const userRowData = {
        'Name': userData.name || '',
        'Email': userData.email || '',
        'Branch': userData.branch || '',
        'Year': userData.year?.toString() || '',
        'Attendance': userData.attendance?.toString() || '0',
        'Points': userData.points?.toString() || '0',
      };
      
      // Add task statuses to the row data
      tasks.forEach((task) => {
        const taskName = task.name || '';
        const taskHeader = `Task: ${taskName}`;
        if (allHeaders.includes(taskHeader)) {
          userRowData[taskHeader] = task.completed ? '✅' : '❌';
        }
      });

      if (userRowIndex !== -1) {
        // Update existing row
        const row = rows[userRowIndex];
        Object.entries(userRowData).forEach(([key, value]) => {
          if (allHeaders.includes(key)) { // Only update existing columns
            row.set(key, value);
          }
        });
        await row.save();
        console.log(`Updated user ${userData.email} in ${sheetName} sheet`);
      } else {
        // Add new row with all columns
        const newRowData = {};
        allHeaders.forEach(header => {
          newRowData[header] = userRowData[header] || ''; // Fill with empty string for new columns
        });
        
        await sheet.addRow(newRowData);
        console.log(`Added new user ${userData.email} to ${sheetName} sheet`);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error updating user in Google Sheets:', {
        message: error.message,
        stack: error.stack,
        userEmail: userData?.email,
        domain
      });
      throw error;
    }
  }
}

// Create a singleton instance
export default new GoogleSheetsService();
