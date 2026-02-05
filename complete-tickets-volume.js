const Database = require('better-sqlite3');
const dbPath = '/var/lib/docker/volumes/seethbot-data/_data/tickets.db';
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
    console.log('Updating tickets 110, 111, 112, and 113 to completed in volume database...\n');

    const response110 = "Fixed mobile navigation bar width issue. The nav bar no longer slowly gets wider on mobile. Changes made: 1) Removed overflow-x: auto and set overflow: hidden on .mobile-bottom-nav 2) Changed width: 100% to width: 100vw 3) Removed padding from container 4) Made nav items responsive with flex: 1 and min-width: 0 5) Reduced padding and font sizes to fit mobile viewport 6) Added text-overflow: ellipsis for long labels. Deployed to production.";

    updateTicket(110, 'completed', response110);

    const response111 = "Duplicate of ticket #110. Same fix applied - mobile navigation bar width issue resolved.";

    updateTicket(111, 'completed', response111);

    const response112 = "Added mold mode toggle button (🦠) to nav-controls next to the goose button (🦆). Mold mode can now be toggled on/off. When disabled, mold circles stop spawning and existing circles are cleared. Setting is persisted to localStorage. Changes made: 1) Added moldMode state to useAppStore with localStorage persistence 2) Added toggleMoldMode() function to enable/disable mold 3) Added stopMoldSpawner() and clearMoldCircles() functions 4) Modified startMoldSpawner() to check moldMode before spawning 5) Updated App.vue to only initialize mold if moldMode is enabled 6) Added mold mode button (🦠) to Router.vue nav-controls. Deployed to production (Build #31).";

    updateTicket(112, 'completed', response112);

    const response113 = "Created a new settings page at /settings that allows users to configure various settings: 1) Max Hearts on Screen (default: 20) - controls how many falling hearts are visible 2) Heart Spawn Interval in ms (default: 125ms) - time between each heart spawn 3) Max Mold Circles (default: 27) - maximum number of mold circles 4) Mold Spawn Rate in seconds (default: 15s) - average time between new mold circles 5) Mold Growth Rate (default: 0.95px/tick) - how fast mold circles grow 6) Min/Max Start Circles (default: 5-10) - number of mold circles on page load. All settings are automatically saved to localStorage. Added settings page to Tools dropdown in navigation. Deployed to production (Build #31).";

    updateTicket(113, 'completed', response113);

    console.log('\n✅ All tickets updated successfully!');
    console.log('\nTicket #110: Mobile navigation bar width fix');
    console.log('Ticket #111: Duplicate of 110');
    console.log('Ticket #112: Mold mode toggle added to nav-controls');
    console.log('Ticket #113: Settings page created with configurable options');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
