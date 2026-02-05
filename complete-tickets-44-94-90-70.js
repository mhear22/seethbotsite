const http = require('http');

const tickets = [
  { id: 44, status: 'completed', response: 'Fixed countdown overflow issue. Fixed CSS syntax error in CountdownPage.vue where .time-value styles were duplicated with broken syntax. Countdown display now properly constrains to container with overflow: hidden and max-width: 100%.' },
  { id: 94, status: 'completed', response: 'Fixed cat page centering issue. Added max-width: 100% to .cat-image CSS to ensure cat images properly center within their container and do not overflow.' },
  { id: 90, status: 'completed', response: 'Fixed about page dark mode text readability. Added dark mode override for global p tag styling (body.dark p { color: #e2e8f0; }) to ensure proper text contrast in dark mode. This also addresses ticket #39.' },
  { id: 70, status: 'completed', response: 'Implemented localStorage persistence for idle clicker stats. Added saveStats() and loadStats() functions to persist count, clickPower, and autoClickPower. Stats are saved periodically (every 5s), on click, on upgrade purchase, and on unmount. Stats are loaded on mount before fetching from server.' }
];

async function completeTicket(ticket) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      status: ticket.status,
      response: ticket.response
    });

    const options = {
      hostname: 'localhost',
      port: 8081,
      path: `/api/tickets/${ticket.id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': 'Bearer sk_D36OvTHMY8zXcS4ia7JtVgdsu1yEbX4l'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✓ Ticket #${ticket.id} completed successfully`);
          resolve(JSON.parse(data));
        } else {
          console.error(`✗ Ticket #${ticket.id} failed with status ${res.statusCode}: ${data}`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`✗ Ticket #${ticket.id} failed: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Completing tickets...');
  console.log('='.repeat(50));

  for (const ticket of tickets) {
    try {
      await completeTicket(ticket);
      await new Promise(r => setTimeout(r, 1000)); // 1 second delay between requests
    } catch (error) {
      console.error(`Failed to complete ticket #${ticket.id}:`, error.message);
    }
  }

  console.log('='.repeat(50));
  console.log('Done!');
}

main().catch(console.error);
