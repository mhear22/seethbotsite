/**
 * Export Repository
 * Handles data export functionality
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ExportRankingsParams {
  format?: 'json' | 'csv';
}

export interface ExportStatsParams {
  userId: string;
  gameType?: 'clicker' | 'fishing';
  format?: 'json' | 'csv';
}

export interface ExportClicksParams {
  userId: string;
  limit?: number;
  format?: 'json' | 'csv';
}

export interface ExportHistoryParams {
  userId: string;
  gameType?: 'clicker' | 'fishing';
  statType?: string;
  limit?: number;
  format?: 'json' | 'csv';
}

export interface ExportLeaderboardParams {
  gameType: 'clicker' | 'fishing';
  limit?: number;
  format?: 'json' | 'csv';
}

class ExportRepository {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_BASE_URL;
  }

  /**
   * Export rankings data
   */
  async exportRankings(params: ExportRankingsParams = {}): Promise<void> {
    const { format = 'json' } = params;
    const response = await fetch(`${this.apiUrl}/export/rankings?format=${format}`);

    if (!response.ok) {
      throw new Error('Failed to export rankings');
    }

    const blob = await response.blob();
    this.downloadBlob(blob, `rankings_${this.getTimestamp()}.${format}`);
  }

  /**
   * Export user stats
   */
  async exportStats(params: ExportStatsParams): Promise<void> {
    const { userId, gameType, format = 'json' } = params;
    const response = await fetch(`${this.apiUrl}/export/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, gameType, format })
    });

    if (!response.ok) {
      throw new Error('Failed to export stats');
    }

    const blob = await response.blob();
    this.downloadBlob(blob, `stats_${userId}_${this.getTimestamp()}.${format}`);
  }

  /**
   * Export clicks data
   */
  async exportClicks(params: ExportClicksParams): Promise<void> {
    const { userId, limit = 100, format = 'json' } = params;
    const response = await fetch(`${this.apiUrl}/export/clicks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, limit, format })
    });

    if (!response.ok) {
      throw new Error('Failed to export clicks');
    }

    const blob = await response.blob();
    this.downloadBlob(blob, `clicks_${userId}_${this.getTimestamp()}.${format}`);
  }

  /**
   * Export stats history
   */
  async exportHistory(params: ExportHistoryParams): Promise<void> {
    const { userId, gameType, statType, limit = 500, format = 'json' } = params;
    const response = await fetch(`${this.apiUrl}/export/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, gameType, statType, limit, format })
    });

    if (!response.ok) {
      throw new Error('Failed to export history');
    }

    const blob = await response.blob();
    this.downloadBlob(blob, `history_${userId}_${this.getTimestamp()}.${format}`);
  }

  /**
   * Export leaderboard data
   */
  async exportLeaderboard(params: ExportLeaderboardParams): Promise<void> {
    const { gameType, limit = 50, format = 'json' } = params;
    const response = await fetch(`${this.apiUrl}/export/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gameType, limit, format })
    });

    if (!response.ok) {
      throw new Error('Failed to export leaderboard');
    }

    const blob = await response.blob();
    this.downloadBlob(blob, `leaderboard_${gameType}_${this.getTimestamp()}.${format}`);
  }

  /**
   * Download a blob as a file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Get current timestamp string
   */
  private getTimestamp(): string {
    return new Date().toISOString().split('T')[0];
  }
}

export const exportRepository = new ExportRepository();
