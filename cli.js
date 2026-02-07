#!/usr/bin/env node

/**
 * Seethbotsite CLI Tool
 * A unified CLI for common development and ticket management tasks
 *
 * Replaces 100+ individual scripts with a single, flexible interface
 */

const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:8081';
const DB_PATH = path.join(__dirname, 'backend/data/tickets.db');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

// Helper: Make HTTP request to API
function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Helper: Get tickets from database
function getTicketsFromDB(filters = {}) {
  const db = new Database(DB_PATH, { readonly: true });

  let query = 'SELECT id, title, status, priority, created_at, updated_at FROM tickets';
  const conditions = [];
  const params = [];

  if (filters.status) {
    // Handle both string and array status
    const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
    const placeholders = statusArray.map(() => '?').join(',');
    conditions.push(`status IN (${placeholders})`);
    params.push(...statusArray);
  }

  if (filters.id) {
    conditions.push('id = ?');
    params.push(filters.id);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY id DESC';

  const stmt = db.prepare(query);
  const tickets = stmt.all(...params);

  db.close();
  return tickets;
}

// ============================================================================
// COMMANDS
// ============================================================================

// Command: ticket list
async function cmdTicketList(args) {
  const statusFilter = args.status ? args.status.split(',') : ['pending', 'needs-info'];
  const limit = args.limit ? parseInt(args.limit) : null;

  const tickets = getTicketsFromDB({ status: statusFilter });

  console.log(colorize('\n=== Tickets ===', 'cyan'));
  console.log(`Filter: ${statusFilter.join(', ')}`);

  if (tickets.length === 0) {
    console.log(colorize('No tickets found.', 'yellow'));
    return;
  }

  const displayTickets = limit ? tickets.slice(0, limit) : tickets;

  displayTickets.forEach(ticket => {
    const statusIcon = ticket.status === 'completed' ? '✅' :
                      ticket.status === 'pending' ? '⏳' :
                      ticket.status === 'needs-info' ? '🔄' :
                      ticket.status === 'declined' ? '❌' : '❓';
    const priorityColor = ticket.priority === 'high' ? 'red' :
                         ticket.priority === 'medium' ? 'yellow' : 'green';

    console.log(`\n${statusIcon} ${colorize(`#${ticket.id}`, 'bright')} ${ticket.title}`);
    console.log(`   Status: ${ticket.status} | Priority: ${colorize(ticket.priority, priorityColor)}`);
    console.log(`   Created: ${ticket.created_at}`);
  });

  console.log(colorize(`\nTotal: ${displayTickets.length}/${tickets.length} tickets\n`, 'cyan'));
}

// Command: ticket show
async function cmdTicketShow(args) {
  if (!args.id) {
    console.error(colorize('Error: --id is required', 'red'));
    process.exit(1);
  }

  const tickets = getTicketsFromDB({ id: args.id });

  if (tickets.length === 0) {
    console.error(colorize(`Ticket #${args.id} not found`, 'red'));
    process.exit(1);
  }

  const ticket = tickets[0];
  console.log(colorize(`\n=== Ticket #${ticket.id} ===`, 'cyan'));
  console.log(`Title: ${ticket.title}`);
  console.log(`Status: ${ticket.status}`);
  console.log(`Priority: ${ticket.priority}`);
  console.log(`Created: ${ticket.created_at}`);
  console.log(`Updated: ${ticket.updated_at}`);
}

// Command: ticket complete
async function cmdTicketComplete(args) {
  if (!args.id) {
    console.error(colorize('Error: --id is required', 'red'));
    process.exit(1);
  }

  const ticketId = parseInt(args.id);
  const response = args.response || '';

  console.log(colorize(`\nCompleting ticket #${ticketId}...`, 'yellow'));

  try {
    const result = await apiRequest('PATCH', `/api/tickets/${ticketId}`, {
      status: 'completed',
      response: response
    });

    console.log(colorize('✅ Ticket completed successfully!', 'green'));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(colorize(`Error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Command: ticket decline
async function cmdTicketDecline(args) {
  if (!args.id) {
    console.error(colorize('Error: --id is required', 'red'));
    process.exit(1);
  }

  const ticketId = parseInt(args.id);
  const response = args.response || '';

  console.log(colorize(`\nDeclining ticket #${ticketId}...`, 'yellow'));

  try {
    const result = await apiRequest('PATCH', `/api/tickets/${ticketId}`, {
      status: 'declined',
      response: response
    });

    console.log(colorize('✅ Ticket declined successfully!', 'green'));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(colorize(`Error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Command: status
async function cmdStatus() {
  console.log(colorize('\n=== System Status ===', 'cyan'));

  // Check API
  try {
    const health = await apiRequest('GET', '/api/health');
    console.log(colorize('✅ API', 'green'), `: ${health.status}`);
  } catch (error) {
    console.log(colorize('❌ API', 'red'), ': Down');
  }

  // Check database
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const ticketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get();
    console.log(colorize('✅ Database', 'green'), `: ${ticketCount.count} tickets`);
    db.close();
  } catch (error) {
    console.log(colorize('❌ Database', 'red'), `: ${error.message}`);
  }

  console.log();
}

// Command: help
function cmdHelp() {
  console.log(colorize('\nSeethbotsite CLI Tool\n', 'cyan'));

  console.log(colorize('Usage:', 'bright') + ' node cli.js <command> [options]\n');

  console.log(colorize('Commands:', 'cyan'));
  console.log('  ticket list      List tickets');
  console.log('  ticket show      Show ticket details');
  console.log('  ticket complete  Mark ticket as completed');
  console.log('  ticket decline   Mark ticket as declined');
  console.log('  status           Show system status');
  console.log('  help             Show this help message');

  console.log(colorize('\nOptions:', 'cyan'));
  console.log('  --id <id>           Ticket ID');
  console.log('  --status <status>   Filter by status (comma-separated)');
  console.log('  --limit <n>         Limit number of results');
  console.log('  --response <text>   Response message for completion/decline');

  console.log(colorize('\nExamples:', 'cyan'));
  console.log('  node cli.js ticket list');
  console.log('  node cli.js ticket list --status pending,needs-info');
  console.log('  node cli.js ticket show --id 128');
  console.log('  node cli.js ticket complete --id 128 --response "Fixed the issue"');
  console.log('  node cli.js status');

  console.log();
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const command = process.argv[2];
  const args = {};

  // Parse args
  for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = process.argv[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    }
  }

  switch (command) {
    case 'ticket':
      const subcommand = process.argv[3];
      const subArgs = {};
      for (let i = 4; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg.startsWith('--')) {
          const key = arg.slice(2);
          const nextArg = process.argv[i + 1];
          if (nextArg && !nextArg.startsWith('--')) {
            subArgs[key] = nextArg;
            i++;
          } else {
            subArgs[key] = true;
          }
        }
      }

      switch (subcommand) {
        case 'list': await cmdTicketList(subArgs); break;
        case 'show': await cmdTicketShow(subArgs); break;
        case 'complete': await cmdTicketComplete(subArgs); break;
        case 'decline': await cmdTicketDecline(subArgs); break;
        default:
          console.error(colorize(`Unknown ticket command: ${subcommand}`, 'red'));
          cmdHelp();
          process.exit(1);
      }
      break;

    case 'status':
      await cmdStatus();
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      cmdHelp();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(colorize(`\n❌ Error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = { apiRequest, getTicketsFromDB };
