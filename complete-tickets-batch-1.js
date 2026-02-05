const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');
const db = new Database(DB_PATH);

// Tickets to mark as complete with responses
const tickets = [
  {
    id: 52,
    status: 'completed',
    response: 'Added advice to quotes using api.adviceslip.com. Quotes now include a random advice slip that appears in a styled section below the main quote. Implemented in useQuote composable and QuoteSection component with dedicated styling for advice.'
  },
  {
    id: 54,
    status: 'completed',
    response: 'Coolness rankings already have time-based decay implemented. The PointsManager class in backend/src/services/points-manager.ts includes an applyDecay() method that reduces points above the base level by 10 points per hour of inactivity. Decay is applied every time rankings are accessed.'
  },
  {
    id: 57,
    status: 'completed',
    response: 'Patch notes section already implemented. Features include: (1) /api/patch-notes endpoint to get all patch notes, (2) /api/patch-notes/latest for the latest patch, (3) PATCH_NOTES_PAGE displaying all patches, (4) Latest patch note shown on home page, (5) Patch notes linked in Tools dropdown navigation. Backend uses patch-notes.json for storage.'
  },
  {
    id: 92,
    status: 'completed',
    response: 'Brand icon now rotates based on scroll position. Added scroll event listener in Router component that calculates scroll percentage and applies rotation (0 to 360 degrees). Brand icon rotates smoothly as user scrolls down the page using CSS transition.'
  }
];

let totalAffected = 0;

tickets.forEach(ticket => {
  const result = db.prepare(
    "UPDATE tickets SET status = ?, response = ? WHERE id = ?"
  ).run(ticket.status, ticket.response, ticket.id);

  totalAffected += result.changes;
  console.log(`✅ Ticket #${ticket.id} marked as ${ticket.status}`);
});

console.log(`\n🎉 Total tickets updated: ${totalAffected}`);

// Verify the updates
const updatedTickets = db.prepare("SELECT id, title, status FROM tickets WHERE id IN (52, 54, 57, 92)").all();
console.log('\n📋 Updated tickets:');
updatedTickets.forEach(t => {
  console.log(`   #${t.id} ${t.title.substring(0, 40)}... - ${t.status}`);
});

db.close();
