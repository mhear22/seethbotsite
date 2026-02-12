<script setup lang="ts">
import type { Ticket } from '../../stores/useTicketsStore'
import { formatDate } from '../../utils/format'

interface Props {
  ticket: Ticket
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
  isOwnTicket: (ticket: Ticket) => boolean
  isTicketFavorite: (ticket: Ticket) => boolean
  isTicketDescriptionExpanded: (ticketId: number) => boolean
  loading?: boolean
}

interface Emits {
  (e: 'favorite', ticket: Ticket, event: Event): void
  (e: 'toggleDescription', ticketId: number, event: Event): void
  (e: 'viewDetails', ticket: Ticket, event: Event): void
  (e: 'edit', ticket: Ticket): void
  (e: 'close', ticket: Ticket): void
  (e: 'delete', ticket: Ticket): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleFavorite = (ticket: Ticket, e: Event) => {
  emit('favorite', ticket, e)
}

const handleToggleDescription = (ticketId: number, e: Event) => {
  emit('toggleDescription', ticketId, e)
}

const handleViewDetails = (ticket: Ticket, e: Event) => {
  emit('viewDetails', ticket, e)
}

const handleEdit = (ticket: Ticket) => {
  emit('edit', ticket)
}

const handleClose = (ticket: Ticket) => {
  emit('close', ticket)
}

const handleDelete = (ticket: Ticket) => {
  emit('delete', ticket)
}
</script>

<template>
  <div class="ticket-card">
    <div class="ticket-header">
      <h3 class="ticket-title">{{ ticket.title }}</h3>
      <div class="ticket-badges">
        <span class="ticket-status" :class="statusColors[ticket.status]">
          {{ statusLabels[ticket.status] }}
        </span>
        <button
          @click="handleFavorite(ticket, $event)"
          :class="['ticket-favorite-btn', { favorited: isTicketFavorite(ticket) }]"
          :title="isTicketFavorite(ticket) ? 'Remove from favorites' : 'Add to favorites'"
        >
          ⭐
        </button>
      </div>
    </div>

    <!-- Expandable Description -->
    <button
      @click="handleToggleDescription(ticket.id, $event)"
      class="ticket-expand-btn"
      :class="{ expanded: isTicketDescriptionExpanded(ticket.id) }"
    >
      <span class="expand-icon">{{ isTicketDescriptionExpanded(ticket.id) ? '▼' : '▶' }}</span>
      <span class="expand-text">
        {{ isTicketDescriptionExpanded(ticket.id) ? 'Show Less' : 'More Details' }}
      </span>
    </button>

    <div
      v-if="isTicketDescriptionExpanded(ticket.id)"
      class="ticket-description"
    >
      {{ ticket.description }}
    </div>

    <!-- Tags and Category -->
    <div v-if="ticket.tags || ticket.category" class="ticket-tags-category">
      <div v-if="ticket.tags" class="ticket-tags">
        <span
          v-for="tag in ticket.tags.split(',').map(t => t.trim()).filter(t => t)"
          :key="tag"
          class="tag-chip"
        >
          🏷️ {{ tag }}
        </span>
      </div>
      <div v-if="ticket.category" class="ticket-category">
        <span class="category-chip">📁 {{ ticket.category }}</span>
      </div>
    </div>

    <div class="ticket-meta">
      <span class="ticket-date">Created: {{ formatDate(ticket.created_at, true) }}</span>
      <div class="ticket-actions">
        <button
          @click="handleViewDetails(ticket, $event)"
          class="view-details-btn"
          :disabled="loading"
          title="View full ticket details"
        >
          👁️ View Details
        </button>
        <button
          v-if="ticket.status === 'pending'"
          @click="handleEdit(ticket)"
          class="edit-ticket-btn"
          :disabled="loading"
          title="Edit ticket"
        >
          ✏️ Edit
        </button>
        <button
          v-if="isOwnTicket(ticket) && ticket.status === 'pending'"
          @click="handleClose(ticket)"
          class="close-ticket-btn"
          :disabled="loading"
          title="Mark as completed"
        >
          ✅ Close
        </button>
        <button
          v-if="isOwnTicket(ticket) && ticket.status === 'pending'"
          @click="handleDelete(ticket)"
          class="delete-ticket-btn"
          :disabled="loading"
          title="Delete ticket"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
    <div v-if="ticket.response" class="ticket-response">
      <div class="response-label">Response:</div>
      <div class="response-text">{{ ticket.response }}</div>
    </div>
  </div>
</template>

<style scoped>
.ticket-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.ticket-title {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  flex: 1;
}

.ticket-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid;
}

.ticket-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.ticket-favorite-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  background: white;
  color: #cbd5e0;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.ticket-favorite-btn:hover {
  transform: scale(1.1);
  border-color: #f6d365;
  color: #f6d365;
}

.ticket-favorite-btn.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
  color: white;
  box-shadow: 0 2px 6px rgba(246, 211, 101, 0.3);
}

.ticket-favorite-btn.favorited:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(246, 211, 101, 0.4);
}

.dark .ticket-favorite-btn {
  background: #2d3748;
  border-color: #4a5568;
  color: #718096;
}

.dark .ticket-favorite-btn:hover {
  border-color: #f6d365;
  color: #f6d365;
}

.dark .ticket-favorite-btn.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
}

.ticket-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 12px;
}

.ticket-expand-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.ticket-expand-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.ticket-expand-btn .expand-icon {
  font-size: 10px;
  transition: transform 0.2s;
}

.ticket-expand-btn.expanded {
  background: #ebf8ff;
  border-color: #bee3f8;
  color: #2b6cb0;
}

.ticket-expand-btn.expanded:hover {
  background: #e6fffa;
  border-color: #9ae6b4;
}

.ticket-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;
}

.ticket-date {
  font-size: 13px;
  color: #a0aec0;
}

.ticket-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.edit-ticket-btn,
.close-ticket-btn,
.delete-ticket-btn,
.view-details-btn {
  padding: 6px 14px;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-ticket-btn {
  background: #ed8936;
}

.edit-ticket-btn:hover:not(:disabled) {
  background: #dd6b20;
  transform: translateY(-1px);
}

.close-ticket-btn {
  background: #48bb78;
}

.close-ticket-btn:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-1px);
}

.delete-ticket-btn {
  background: #f56565;
}

.delete-ticket-btn:hover:not(:disabled) {
  background: #e53e3e;
  transform: translateY(-1px);
}

.view-details-btn {
  background: #4299e1;
}

.view-details-btn:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-1px);
}

.edit-ticket-btn:disabled,
.close-ticket-btn:disabled,
.delete-ticket-btn:disabled,
.view-details-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.ticket-response {
  margin-top: 16px;
  padding: 14px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
}

.response-label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
  font-size: 14px;
}

.response-text {
  color: #4a5568;
  line-height: 1.6;
  font-size: 14px;
}

/* Tags and Category Styles */
.ticket-tags-category {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.ticket-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  display: inline-block;
  padding: 4px 10px;
  background: #ebf8ff;
  color: #2b6cb0;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #bee3f8;
}

.ticket-category {
  display: flex;
  align-items: center;
}

.category-chip {
  display: inline-block;
  padding: 4px 10px;
  background: #faf5ff;
  color: #6b46c1;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #d6bcfa;
}

/* Dark mode */
.dark .ticket-card {
  background: #2d3748;
  border-color: #4a5568;
}

.dark .ticket-title,
.dark .response-label {
  color: #e2e8f0;
}

.dark .ticket-expand-btn {
  background: #2d3748;
  border-color: #4a5568;
  color: #cbd5e0;
}

.dark .ticket-expand-btn:hover {
  background: #4a5568;
  border-color: #718096;
}

.dark .ticket-expand-btn.expanded {
  background: #2a4365;
  border-color: #4a6fa5;
  color: #90cdf4;
}

.dark .ticket-expand-btn.expanded:hover {
  background: #285e61;
  border-color: #38b2ac;
}

.dark .ticket-description,
.dark .ticket-response,
.dark .response-text {
  color: #cbd5e0;
}

.dark .ticket-meta {
  border-top-color: #4a5568;
}

.dark .ticket-response {
  background: #1a202c;
}

.dark .tag-chip {
  background: #2c5282;
  color: #bee3f8;
  border-color: #2b6cb0;
}

.dark .category-chip {
  background: #44337a;
  color: #d6bcfa;
  border-color: #6b46c1;
}
</style>
