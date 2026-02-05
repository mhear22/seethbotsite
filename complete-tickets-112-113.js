const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'container-tickets.db');
const db = new Database(dbPath);

const updateTicket = (ticketId, status, response) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE tickets
    SET status = ?, response = ?, updated_at = ?
    WHERE id = ?
  `);
  const result = stmt.run(status, response, now, ticketId);
  console.log(`✅ Ticket #${ticketId} updated to status: ${status}`);
  return result;
};

async function main() {
  try {
    console.log('Updating tickets 112 and 113 to completed...\n');

    const response112 = "Added mold mode toggle button (🦠) to nav-controls next to the goose button (🦆). Mold mode can now be toggled on/off. When disabled, mold circles stop spawning and existing circles are cleared. Setting is persisted to localStorage. Changes made: 1) Added moldMode state to useAppStore with localStorage persistence 2) Added toggleMoldMode() function to enable/disable mold 3) Added stopMoldSpawner() and clearMoldCircles() functions 4) Modified startMoldSpawner() to check moldMode before spawning 5) Updated App.vue to only initialize mold if moldMode is enabled 6) Added mold mode button (🦠) to Router.vue nav-controls. Deployed to production (Build #31).";

    updateTicket(112, 'completed', response112);

    const response113 = "Created a new settings page at /settings that allows users to configure various settings: 1) Max Hearts on Screen (default: 20) - controls how many falling hearts are visible 2) Heart Spawn Interval in ms (default: 125ms) - time between each heart spawn 3) Max Mold Circles (default: 27) - maximum number of mold circles 4) Mold Spawn Rate in seconds (default: 15s) - average time between new mold circles 5) Mold Growth Rate (default: 0.95px/tick) - how fast mold circles grow 6) Min/Max Start Circles (default: 5-10) - number of mold circles on page load. All settings are automatically saved to localStorage. Added settings page to Tools dropdown in navigation. Deployed to production (Build #31).";

    updateTicket(113, 'completed', response113);

    console.log('\n✅ All tickets updated successfully!');
    console.log('\nTicket #112: Mold mode toggle added to nav-controls');
    console.log('Ticket #113: Settings page created with configurable options');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
