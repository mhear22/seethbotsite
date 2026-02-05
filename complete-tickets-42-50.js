const http = require('http');

const tickets = [
  { id: 42, status: 'completed', response: 'Ctrl+Enter keyboard shortcut is already implemented in TicketForm.vue. The handleKeyDown function detects Ctrl+Enter and calls handleSubmit(). Both title input and description textarea have @keydown="handleKeyDown" bound. There is also a visible hint in the form showing "Tip: Press Ctrl + Enter to submit quickly".' },
  { id: 50, status: 'completed', response: 'Ctrl+Enter keyboard shortcut is already implemented. Same implementation as ticket #42. The TicketForm component has handleKeyDown function that detects Ctrl+Enter and submits the form. Feature is working and available for both creating and editing tickets.' }
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
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✓ Ticket #${ticket.id} completed`);
            resolve(JSON.parse(data));
          } else {
            console.error(`✗ Ticket #${ticket.id} failed with status ${res.statusCode}`);
            console.error(`Response: ${data}`);
            reject(new Error(`Status ${res.statusCode}`));
          }
        } catch (e) {
          console.error(`✗ Ticket #${ticket.id} - JSON parse error: ${e.message}`);
          reject(e);
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
  console.log('Completing tickets 42 and 50...');
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
