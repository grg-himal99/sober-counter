// Default date
const defaultDate = new Date('2025-03-19T09:00:00').toISOString();

// In-memory storage that persists between requests
let cachedDate = null;

export default defineEventHandler(async (event) => {
  // Handle GET request
  if (event.method === 'GET') {
    try {
      // If we have a cached date, use it
      if (cachedDate) {
        return { date: cachedDate, source: 'cache' };
      }
      
      // Otherwise, try to fetch from the public JSON file
      const baseUrl = event.node.req.headers.host 
        ? `http://${event.node.req.headers.host}` 
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/soberDate.json`);
      
      if (response.ok) {
        const data = await response.json();
        cachedDate = data.date;
        return { date: data.date, source: 'file' };
      } else {
        // Return default date if file doesn't exist or can't be read
        cachedDate = defaultDate;
        return { date: defaultDate, source: 'default' };
      }
    } catch (error) {
      console.error('Error reading soberDate.json:', error);
      cachedDate = defaultDate;
      return { date: defaultDate, error: 'Error reading date', source: 'error' };
    }
  }
  
  // Handle POST request
  if (event.method === 'POST') {
    try {
      const body = await readBody(event);
      if (body.date) {
        // Update the cached date
        cachedDate = body.date;
        return { success: true, date: body.date };
      } else {
        return { success: false, error: 'No date provided' };
      }
    } catch (error) {
      console.error('Error updating date:', error);
      return { success: false, error: 'Error saving date' };
    }
  }
  
  // Handle other methods
  return { error: 'Method not allowed' };
});