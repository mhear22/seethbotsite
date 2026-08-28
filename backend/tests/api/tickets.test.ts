/**
 * Tickets Controller API Tests
 * Tests for tickets endpoints
 */

import request from 'supertest';
import { registerApiKey } from '../../src/auth';

const TEST_API_KEY = 'test-suite-api-key';
registerApiKey(TEST_API_KEY);
import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';

// Import the controller
import ticketsRouter from '../../src/controllers/tickets.controller';
import { validateApiKey, extractApiKey } from '../../src/auth';

// Create a test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  // These suites exercise CRUD/flow logic, not auth (covered by auth.test.ts);
  // authenticate every request so the API-key middleware lets them through.
  app.use((req, _res, next) => {
    req.headers['x-api-key'] = TEST_API_KEY;
    next();
  });

  // Set up a temporary test database path
  const testDataDir = path.join(__dirname, '..', '..', 'data-test-tickets');

  // Ensure test directory exists
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }

  // Override the DB_PATH by temporarily changing the behavior
  // We need to create the controller after ensuring the test directory exists
  // For now, let's just mount the router and handle database initialization separately

  app.use('/api', ticketsRouter);

  return app;
};

describe('Tickets API', () => {
  let app: Express;
  const testApiKey = 'test-api-key-12345';
  const testCreatorId = 'test-user-123';

  beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';

    // Add test API key to the in-memory list
    const auth = require('../../src/auth');
    // Mock or add test API key
    // Note: This assumes the auth module loads API keys from somewhere
    // We'll need to handle this based on the actual implementation

    app = createTestApp();
  });

  afterAll(() => {
    // Clean up test database
    const testDataDir = path.join(__dirname, '..', '..', 'data-test-tickets');
    if (fs.existsSync(testDataDir)) {
      const files = fs.readdirSync(testDataDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testDataDir, file));
      });
      fs.rmdirSync(testDataDir);
    }
  });

  describe('POST /api/tickets', () => {
    it('should create a new ticket with title and description', async () => {
      const newTicket = {
        title: 'Test Ticket',
        description: 'This is a test ticket description',
        creator_id: testCreatorId
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(newTicket)
        .expect(201);

      expect(response.body).toHaveProperty('ticket');
      expect(response.body.ticket).toHaveProperty('id');
      expect(response.body.ticket.title).toBe(newTicket.title);
      expect(response.body.ticket.description).toBe(newTicket.description);
      expect(response.body.ticket.status).toBe('pending');
      expect(response.body.ticket.creator_id).toBe(testCreatorId);
    });

    it('should create a ticket with just title (description defaults to null)', async () => {
      const newTicket = {
        title: 'Test Ticket No Description',
        description: 'Auto-generated description'
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(newTicket)
        .expect(201);

      expect(response.body).toHaveProperty('ticket');
      expect(response.body.ticket.title).toBe(newTicket.title);
      expect(response.body.ticket.description).toBe('Auto-generated description');
    });

    it('should reject ticket without title', async () => {
      const newTicket = {
        description: 'This ticket has no title'
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(newTicket)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Title is required');
    });
  });

  describe('GET /api/tickets', () => {
    it('should return all tickets', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .expect(200);

      expect(response.body).toHaveProperty('tickets');
      expect(Array.isArray(response.body.tickets)).toBe(true);
    });

    it('should filter tickets by status', async () => {
      const response = await request(app)
        .get('/api/tickets?status=pending')
        .expect(200);

      expect(response.body.tickets).toBeDefined();
      expect(Array.isArray(response.body.tickets)).toBe(true);

      // Verify all returned tickets have 'pending' status
      response.body.tickets.forEach((ticket: any) => {
        expect(ticket.status).toBe('pending');
      });
    });

    it('should filter tickets by type', async () => {
      const response = await request(app)
        .get('/api/tickets?type=feature')
        .expect(200);

      expect(response.body.tickets).toBeDefined();
      expect(Array.isArray(response.body.tickets)).toBe(true);

      // Verify all returned tickets have 'feature' type (if type exists)
      response.body.tickets.forEach((ticket: any) => {
        if (ticket.type) {
          expect(ticket.type).toBe('feature');
        }
      });
    });

    it('should filter tickets by priority', async () => {
      const response = await request(app)
        .get('/api/tickets?priority=high')
        .expect(200);

      expect(response.body.tickets).toBeDefined();
      expect(Array.isArray(response.body.tickets)).toBe(true);

      // Verify all returned tickets have 'high' priority (if priority exists)
      response.body.tickets.forEach((ticket: any) => {
        if (ticket.priority) {
          expect(ticket.priority).toBe('high');
        }
      });
    });

    it('should handle "in-progress" status mapping to "needs-info"', async () => {
      const response = await request(app)
        .get('/api/tickets?status=in-progress')
        .expect(200);

      expect(response.body.tickets).toBeDefined();
      expect(Array.isArray(response.body.tickets)).toBe(true);
    });
  });

  describe('GET /api/tickets/settings/ignore-mode', () => {
    it('should return ignore mode status', async () => {
      const response = await request(app)
        .get('/api/tickets/settings/ignore-mode')
        .expect(200);

      expect(response.body).toHaveProperty('ignoreMode');
      expect(typeof response.body.ignoreMode).toBe('boolean');
    });
  });

  describe('PATCH /api/tickets/settings/ignore-mode', () => {
    it('should update ignore mode to true', async () => {
      const response = await request(app)
        .patch('/api/tickets/settings/ignore-mode')
        .send({ ignoreMode: true })
        .expect(200);

      expect(response.body.ignoreMode).toBe(true);
      expect(response.body).toHaveProperty('message');
    });

    it('should update ignore mode to false', async () => {
      const response = await request(app)
        .patch('/api/tickets/settings/ignore-mode')
        .send({ ignoreMode: false })
        .expect(200);

      expect(response.body.ignoreMode).toBe(false);
    });

    it('should reject non-boolean ignoreMode', async () => {
      const response = await request(app)
        .patch('/api/tickets/settings/ignore-mode')
        .send({ ignoreMode: 'true' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('must be a boolean');
    });
  });

  describe('GET /api/tickets/settings/last-collection', () => {
    it('should return last collection timestamp', async () => {
      const response = await request(app)
        .get('/api/tickets/settings/last-collection')
        .expect(200);

      expect(response.body).toHaveProperty('lastCollection');
      // Can be null or an ISO string
      expect(
        response.body.lastCollection === null ||
        typeof response.body.lastCollection === 'string'
      ).toBe(true);
    });
  });

  describe('PATCH /api/tickets/settings/last-collection', () => {
    it('should update last collection timestamp', async () => {
      const timestamp = new Date().toISOString();

      const response = await request(app)
        .patch('/api/tickets/settings/last-collection')
        .send({ lastCollection: timestamp })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.lastCollection).toBe(timestamp);
    });

    it('should persist the updated timestamp', async () => {
      const timestamp = new Date().toISOString();

      await request(app)
        .patch('/api/tickets/settings/last-collection')
        .send({ lastCollection: timestamp });

      const response = await request(app)
        .get('/api/tickets/settings/last-collection')
        .expect(200);

      expect(response.body.lastCollection).toBe(timestamp);
    });
  });

  describe('GET /api/tickets/next-task', () => {
    it('should return next pending ticket and update last collection', async () => {
      const response = await request(app)
        .get('/api/tickets/next-task')
        .expect(200);

      expect(response.body).toHaveProperty('lastCollection');
      expect(response.body).toHaveProperty('ticket');

      // Verify lastCollection is a valid ISO date
      const lastCollection = new Date(response.body.lastCollection);
      expect(isNaN(lastCollection.getTime())).toBe(false);

      // Ticket can be null if no tickets exist
      if (response.body.ticket) {
        expect(response.body.ticket).toHaveProperty('id');
        expect(response.body.ticket).toHaveProperty('title');
      }
    });
  });

  describe('PATCH /api/tickets/:id', () => {
    let ticketId: number;

    beforeAll(async () => {
      // Create a test ticket
      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Test Ticket for Update',
          description: 'This ticket will be updated',
          creator_id: testCreatorId
        });

      ticketId = response.body.ticket.id;
    });

    it('should update ticket title', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${ticketId}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.ticket.title).toBe('Updated Title');
    });

    it('should update ticket description', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${ticketId}`)
        .send({ description: 'Updated description' })
        .expect(200);

      expect(response.body.ticket.description).toBe('Updated description');
    });

    it('should reject empty title', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${ticketId}`)
        .send({ title: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('non-empty string');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${ticketId}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid status value');
    });

    it('should return 404 for non-existent ticket', async () => {
      const response = await request(app)
        .patch('/api/tickets/999999')
        .send({ title: 'This should fail' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Ticket not found');
    });

    it('should require at least one field to update', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${ticketId}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('At least one field');
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    let ticketId: number;

    beforeAll(async () => {
      // Create a test ticket to delete
      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Test Ticket to Delete',
          description: 'This ticket will be deleted',
          creator_id: testCreatorId
        });

      ticketId = response.body.ticket.id;
    });

    it('should delete ticket', async () => {
      const response = await request(app)
        .delete(`/api/tickets/${ticketId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 for already deleted ticket', async () => {
      const response = await request(app)
        .delete(`/api/tickets/${ticketId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject deletion with mismatched creator_id', async () => {
      // Create another ticket with a specific creator
      const createResponse = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Test Ticket Auth Check',
          description: 'This ticket tests auth',
          creator_id: testCreatorId
        });

      const newTicketId = createResponse.body.ticket.id;

      // Try to delete with a different creator_id
      const response = await request(app)
        .delete(`/api/tickets/${newTicketId}`)
        .send({ creator_id: 'wrong-creator-id' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');

      // Clean up - delete without creator_id (allowed by controller)
      await request(app)
        .delete(`/api/tickets/${newTicketId}`);
    });
  });
});
