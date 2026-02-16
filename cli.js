#!/usr/bin/env node

/**
 * Seethbotsite CLI Tool
 * A unified CLI for common development and ticket management tasks
 *
 * Replaces 100+ individual scripts with a single, flexible interface
 */

const http = require('http');
const path = require('path');

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:8081';

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

// Helper: Get tickets from API
async function getTicketsFromAPI(filters = {}) {
  try {
    const result = await apiRequest('GET', '/api/tickets');
    let tickets = result.tickets || [];

    // Apply filters
    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      tickets = tickets.filter(t => statusArray.includes(t.status));
    }

    if (filters.id) {
      tickets = tickets.filter(t => t.id === parseInt(filters.id));
    }

    // Sort by id descending
    tickets.sort((a, b) => b.id - a.id);

    return tickets;
  } catch (error) {
    console.error(colorize(`Error fetching tickets: ${error.message}`, 'red'));
    return [];
  }
}

// ============================================================================
// COMMANDS
// ============================================================================

// Command: ticket list
async function cmdTicketList(args) {
  const statusFilter = args.status ? args.status.split(',') : ['pending', 'needs-info', 'in-progress'];
  const limit = args.limit ? parseInt(args.limit) : null;

  const tickets = await getTicketsFromAPI({ status: statusFilter });

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
                      ticket.status === 'in-progress' ? '🔧' :
                      ticket.status === 'declined' ? '❌' : '❓';
    const priorityColor = ticket.priority === 'high' ? 'red' :
                         ticket.priority === 'medium' ? 'yellow' : 'green';

    console.log(`\n${statusIcon} ${colorize(`#${ticket.id}`, 'bright')} ${ticket.title}`);
    console.log(`   Status: ${ticket.status} | Priority: ${colorize(ticket.priority, priorityColor)} | Type: ${ticket.type || 'N/A'}`);
    console.log(`   Created: ${new Date(ticket.created_at).toLocaleString()}`);
    if (ticket.description) {
      const desc = ticket.description.length > 100 ? ticket.description.substring(0, 100) + '...' : ticket.description;
      console.log(`   Description: ${desc}`);
    }
  });

  console.log(colorize(`\nTotal: ${displayTickets.length}/${tickets.length} tickets\n`, 'cyan'));
}

// Command: ticket show
async function cmdTicketShow(args) {
  if (!args.id) {
    console.error(colorize('Error: --id is required', 'red'));
    process.exit(1);
  }

  const tickets = await getTicketsFromAPI({ id: args.id });

  if (tickets.length === 0) {
    console.error(colorize(`Ticket #${args.id} not found`, 'red'));
    process.exit(1);
  }

  const ticket = tickets[0];
  console.log(colorize(`\n=== Ticket #${ticket.id} ===`, 'cyan'));
  console.log(`Title: ${ticket.title}`);
  console.log(`Status: ${ticket.status}`);
  console.log(`Priority: ${ticket.priority}`);
  console.log(`Type: ${ticket.type || 'N/A'}`);
  console.log(`Created: ${new Date(ticket.created_at).toLocaleString()}`);
  console.log(`Updated: ${new Date(ticket.updated_at).toLocaleString()}`);
  if (ticket.description) {
    console.log(`\nDescription:\n${ticket.description}`);
  }
  if (ticket.response) {
    console.log(`\nResponse:\n${ticket.response}`);
  }
  if (ticket.dependencies && ticket.dependencies.length > 0) {
    console.log(`\nDependencies: ${ticket.dependencies.join(', ')}`);
  }
  console.log();
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

  // Check tickets via API
  try {
    const result = await apiRequest('GET', '/api/tickets');
    const tickets = result.tickets || [];
    const pending = tickets.filter(t => t.status === 'pending').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const completed = tickets.filter(t => t.status === 'completed').length;
    console.log(colorize('✅ Tickets', 'green'), `: ${tickets.length} total (${pending} pending, ${inProgress} in-progress, ${completed} completed)`);
  } catch (error) {
    console.log(colorize('❌ Tickets API', 'red'), `: ${error.message}`);
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
  console.log('  node cli.js ticket list --status pending,needs-info,in-progress');
  console.log('  node cli.js ticket show --id 2');
  console.log('  node cli.js ticket complete --id 2 --response "Fixed the issue"');
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

module.exports = { apiRequest, getTicketsFromAPI };
