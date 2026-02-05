const http = require('http');

const API_KEY = process.env.SEETHBOT_API_KEY || '';

// Tickets that are already implemented and should be marked complete
const completedTickets = [
  { id: 142, title: 'PWA support' },
  { id: 143, title: 'Caching' },
  { id: 144, title: 'API rate limiting' },
  { id: 147, title: 'Dark mode themes' }
];

function updateTicketStatus(id, status, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ status });
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: `/api/tickets/${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    if (apiKey) {
      options.headers['X-API-Key'] = apiKey;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Marking already-implemented tickets as complete...\n');

  for (const ticket of completedTickets) {
    try {
      const result = await updateTicketStatus(ticket.id, 'completed', API_KEY);
      console.log(`✅ Ticket #${ticket.id} "${ticket.title}" marked as completed`);
    } catch (err) {
      console.error(`❌ Failed to mark ticket #${ticket.id} complete:`, err.message);
    }
  }

  console.log('\n✅ Completed ticket status updates');
}

main().catch(console.error);
