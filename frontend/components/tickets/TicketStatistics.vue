<script setup lang="ts">
import type { TicketStats } from '../../stores/useTicketsStore'
import { formatDate } from '../../utils/format'

interface Props {
  ticketStats: TicketStats | null
}

defineProps<Props>()

// Status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
  'needs-info': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
  completed: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
  declined: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
  unresolved: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700'
}
</script>

<template>
  <div v-if="ticketStats" class="ticket-stats-section">
    <div class="stats-header">
      <span class="stats-icon">📊</span>
      <h3 class="stats-title">Ticket Statistics</h3>
    </div>
    <div class="stats-grid">
      <!-- Total Tickets Card -->
      <div class="stat-card stat-primary">
        <div class="stat-icon stat-icon-primary">🎫</div>
        <div class="stat-content">
          <span class="stat-label">Total Tickets</span>
          <span class="stat-value">{{ ticketStats.totalTickets }}</span>
        </div>
      </div>

      <!-- Status Breakdown Card -->
      <div class="stat-card stat-status">
        <div class="stat-icon stat-icon-status">📋</div>
        <div class="stat-content">
          <span class="stat-label">By Status</span>
          <div class="status-breakdown">
            <span :class="['status-badge', statusColors.pending]">
              ⏳ {{ ticketStats.byStatus.pending || 0 }}
            </span>
            <span :class="['status-badge', statusColors['needs-info']]">
              🔄 {{ ticketStats.byStatus['needs-info'] || 0 }}
            </span>
            <span :class="['status-badge', statusColors.completed]">
              ✅ {{ ticketStats.byStatus.completed || 0 }}
            </span>
            <span :class="['status-badge', statusColors.declined]">
              ❌ {{ ticketStats.byStatus.declined || 0 }}
            </span>
            <span v-if="ticketStats.byStatus.unresolved" :class="['status-badge', statusColors.unresolved]">
              ⚠️ {{ ticketStats.byStatus.unresolved }}
            </span>
          </div>
        </div>
      </div>

      <!-- Oldest Ticket Card -->
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <span class="stat-label">Oldest Ticket</span>
          <div class="ticket-info">
            <span class="ticket-id">#{{ ticketStats.oldestTicket.id }}</span>
            <span class="ticket-title">{{ ticketStats.oldestTicket.title }}</span>
          </div>
          <span class="ticket-date">{{ formatDate(ticketStats.oldestTicket.created_at, true) }}</span>
        </div>
      </div>

      <!-- Newest Ticket Card -->
      <div class="stat-card">
        <div class="stat-icon">✨</div>
        <div class="stat-content">
          <span class="stat-label">Newest Ticket</span>
          <div class="ticket-info">
            <span class="ticket-id">#{{ ticketStats.newestTicket.id }}</span>
            <span class="ticket-title">{{ ticketStats.newestTicket.title }}</span>
          </div>
          <span class="ticket-date">{{ formatDate(ticketStats.newestTicket.created_at, true) }}</span>
        </div>
      </div>

      <!-- Date Range Card -->
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <span class="stat-label">Date Range</span>
          <div class="date-range">
            <div class="date-row">
              <span class="date-label">Created:</span>
              <span class="date-value">{{ formatDate(ticketStats.dates.oldestCreated, true) }}</span>
              <span class="date-separator">→</span>
              <span class="date-value">{{ formatDate(ticketStats.dates.newestCreated, true) }}</span>
            </div>
            <div v-if="ticketStats.dates.oldestCompleted" class="date-row completed-date">
              <span class="date-label">Completed:</span>
              <span class="date-value">{{ formatDate(ticketStats.dates.oldestCompleted, true) }}</span>
              <span class="date-separator">→</span>
              <span class="date-value">{{ formatDate(ticketStats.dates.newestCompleted, true) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ticket Statistics Section */
.ticket-stats-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.stats-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stats-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  letter-spacing: -0.02em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-card.stat-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.stat-card.stat-status {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-icon-primary,
.stat-icon-status {
  filter: brightness(1.3);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #718096;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-primary .stat-label {
  color: rgba(255, 255, 255, 0.85);
}

.stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  line-height: 1;
}

.stat-primary .stat-value {
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.status-breakdown .status-badge {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.ticket-id {
  font-size: 0.75rem;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ticket-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-date {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
}

.date-range {
  font-size: 0.85rem;
  line-height: 1.7;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.date-label {
  font-weight: 600;
  color: #718096;
}

.date-value {
  font-weight: 600;
  color: #2d3748;
}

.date-separator {
  color: #cbd5e0;
  font-weight: 500;
}

.completed-date {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
}

/* Dark mode ticket stats */
.dark .ticket-stats-section {
  background: rgba(40, 44, 52, 0.95);
  border-color: #4a5568;
}

.dark .stats-header .stats-title {
  color: #e2e8f0;
}

.dark .stat-card {
  background: #2d3748;
  border-color: #4a5568;
}

.dark .stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.dark .stat-card.stat-primary {
  background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
  border: none;
}

.dark .stat-card.stat-status {
  background: #1a202c;
  border-color: #4a5568;
}

.dark .stat-label {
  color: #a0aec0;
}

.dark .stat-primary .stat-label {
  color: rgba(255, 255, 255, 0.85);
}

.dark .stat-value {
  color: #e2e8f0;
}

.dark .stat-primary .stat-value {
  color: white;
}

.dark .ticket-id {
  color: #a0aec0;
}

.dark .ticket-title,
.dark .date-value {
  color: #cbd5e0;
}

.dark .ticket-date,
.dark .date-label {
  color: #718096;
}

.dark .date-separator {
  color: #4a5568;
}

.dark .completed-date {
  border-top-color: #4a5568;
}
</style>
