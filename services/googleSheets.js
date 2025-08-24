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
    try {
      this.checkInitialized();
      const sheetName = domain.toUpperCase();
      const baseHeaders = ['Rank', 'Name', 'Email', 'Branch', 'Year', 'Attendance', 'Points'];
      
      // Get or create the sheet with base headers
      const sheet = await this.getOrCreateSheet(sheetName, baseHeaders);
      
      // Load existing headers
      await sheet.loadHeaderRow();
      const existingHeaders = sheet.headerValues || [];
      
      // Add task columns if they don't exist
      const taskHeaders = tasks.map((task, index) => `Task: ${task.name || index + 1}`);
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
      tasks.forEach((task, index) => {
        const taskHeader = `Task: ${task.name || index + 1}`;
        userRowData[taskHeader] = task.completed ? '✅' : '❌';
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
      } else {
        // Add new row with all columns
        const newRowData = {};
        allHeaders.forEach(header => {
          // Use the value from userRowData if it exists, otherwise use empty string
          newRowData[header] = userRowData[header] ?? '';
        });
        await sheet.addRow(newRowData);
      }

      // After updating, sort the sheet by Points in descending order
      await sheet.loadHeaderRow();
      const allRows = await sheet.getRows();
      
      // Sort rows by Points (descending) and update Rank
      allRows.sort((a, b) => {
        const pointsA = parseInt(a.get('Points') || '0');
        const pointsB = parseInt(b.get('Points') || '0');
        return pointsB - pointsA; // Descending order
      });

      // Update ranks and save all rows
      for (let i = 0; i < allRows.length; i++) {
        allRows[i].set('Rank', (i + 1).toString());
        await allRows[i].save();
      }

      console.log(`Updated user ${userData.email} in ${sheetName} sheet with ${tasks.length} tasks`);
      return true;
    } catch (error) {
      console.error('Error in updateUserWithTasks:', error.message);
      throw error;
    }
  }
}

// Create a singleton instance
export default new GoogleSheetsService();
