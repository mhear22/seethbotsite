const tickets = [
  { id: 37, response: 'Randomized goose button starting location. The goose now appears at a random position on page load instead of always starting in the center-right area.' },
  { id: 41, response: 'Made goose button more compact and rounder. Reduced padding from 18px to 10px 15px, increased border-radius to 50px for a rounder look, and adjusted font sizes to fit the smaller container.' },
  { id: 40, response: 'Fixed goose emoji in leaderboards. Updated EmojiRenderer component to detect the 🪿 goose emoji and render the goose.png image instead of the unicode emoji for better visual consistency.' },
  { id: 97, response: 'Fixed movie night header contrast. Added proper dark mode background gradient to MoviePage (matching other pages) and improved header text color in dark mode to use a pink gradient instead of solid pink for better readability.' },
  { id: 98, response: 'Made pages narrower by adding proper container constraints. Updated CountdownPage to use a countdown-container with max-width: 1000px and auto margins, preventing the page from spanning full viewport width.' }
];

const BASE_URL = 'http://localhost:8081';
const API_KEY = 'sk_g0uijqQRZNck97sLW5hubMCv00fPuzFt';

async function completeTicket(id, response) {
  try {
    const res = await fetch(`${BASE_URL}/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ status: 'completed', response })
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update ticket ${id}: ${res.status} - ${errorText}`);
    }
    console.log(`✅ Ticket #${id} completed`);
    const data = await res.json();
    console.log(`   Response: ${data.ticket.title}`);
  } catch (err) {
    console.error(`❌ Failed to complete ticket #${id}:`, err.message);
  }
}

async function main() {
  console.log('Completing tickets...');
  for (const ticket of tickets) {
    await completeTicket(ticket.id, ticket.response);
  }
  console.log('Done!');
}

main();
