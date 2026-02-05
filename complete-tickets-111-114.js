const Database = require('better-sqlite3');
const http = require('http');

// Function to mark a ticket as complete via API
function markTicketComplete(ticketId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: `/api/tickets/${ticketId}/complete`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Function to update ticket status in database directly
function markTicketCompleteDB(ticketId) {
  const db = new Database('container-tickets.db');
  const stmt = db.prepare('UPDATE tickets SET status = ? WHERE id = ?');
  const result = stmt.run('completed', ticketId);
  db.close();
  return result;
}

async function main() {
  const tickets = [111, 112, 113, 114];

  console.log('Marking tickets as complete...');

  for (const ticketId of tickets) {
    try {
      // Try API first
      await markTicketComplete(ticketId);
      console.log(`✓ Ticket ${ticketId} marked complete via API`);
    } catch (e) {
      // Fallback to database
      try {
        markTicketCompleteDB(ticketId);
        console.log(`✓ Ticket ${ticketId} marked complete via database`);
      } catch (dbError) {
        console.error(`✗ Failed to mark ticket ${ticketId} complete:`, dbError.message);
      }
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
