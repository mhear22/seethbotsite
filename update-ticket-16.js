const fetch = require('node-fetch');

// Configuration
const API_KEY = process.env.API_KEY || 'your-api-key-here';
const BASE_URL = 'http://localhost:3000';

async function updateTicketStatus() {
  const ticketId = 16;
  const status = 'completed';

  console.log(`Updating ticket ${ticketId} to status: ${status}...`);

  try {
    const response = await fetch(`${BASE_URL}/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✓ Ticket updated successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('✗ Failed to update ticket:', error.message);
    process.exit(1);
  }
}

updateTicketStatus();
