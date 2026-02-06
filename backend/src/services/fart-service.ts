import Database from 'better-sqlite3';
import path from 'path';

/**
 * Fart Service
 * Handles all fart-related data operations and statistics
 */
class FartService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(__dirname, '../../data/farts.db');
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    try {
      this.db = new Database(this.dbPath);
      this.createTables();
      console.log('✅ Farts database initialized');
    } catch (error) {
      console.error('❌ Failed to initialize farts database:', error);
    }
  }

  private createTables(): void {
    if (!this.db) return;

    // User fart statistics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_fart_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        total_farts INTEGER DEFAULT 0,
        total_volume REAL DEFAULT 0.0,
        avg_volume REAL DEFAULT 0.0,
        max_volume REAL DEFAULT 0.0,
        min_volume REAL DEFAULT 0.0,
        first_fart TIMESTAMP,
        last_fart TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Fart events table for detailed history
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS fart_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        volume REAL NOT NULL,
        bass_gain REAL,
        bass_frequency REAL,
        distortion_amount REAL,
        volume_multiplier REAL,
        playback_rate REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        ip_address TEXT
      )
    `);

    // Processing statistics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS processing_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        total_processed INTEGER DEFAULT 0,
        simple_playbacks INTEGER DEFAULT 0,
        processed_playbacks INTEGER DEFAULT 0,
        avg_bass_gain REAL DEFAULT 0.0,
        avg_distortion REAL DEFAULT 0.0,
        avg_volume_multiplier REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_fart_events_user_id ON fart_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_fart_events_timestamp ON fart_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_user_fart_stats_total_farts ON user_fart_stats(total_farts DESC);
    `);
  }

  /**
   * Get overall fart statistics
   */
  async getFartStats(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const totalFarts = this.db.prepare('SELECT COUNT(*) as count FROM fart_events').get() as { count: number };
    const totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM user_fart_stats').get() as { count: number };
    const totalVolume = this.db.prepare('SELECT SUM(volume) as sum FROM fart_events').get() as { sum: number | null };
    const avgVolume = this.db.prepare('SELECT AVG(volume) as avg FROM fart_events').get() as { avg: number | null };

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayFarts = this.db.prepare('SELECT COUNT(*) as count FROM fart_events WHERE date(timestamp) = ?').get(today) as { count: number };

    return {
      totalFarts: totalFarts.count,
      totalUsers: totalUsers.count,
      totalVolume: totalVolume.sum || 0,
      avgVolume: avgVolume.avg || 0,
      todayFarts: todayFarts.count,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get fart statistics for a specific user
   */
  async getUserFartStats(userId: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const stats = this.db.prepare('SELECT * FROM user_fart_stats WHERE user_id = ?').get(userId) as any;
    
    if (!stats) {
      return null;
    }

    // Get recent farts
    const recentFarts = this.db.prepare(`
      SELECT * FROM fart_events 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 10
    `).all(userId);

    return {
      ...stats,
      recentFarts
    };
  }

  /**
   * Record a fart event
   */
  async recordFart(data: {
    userId: string;
    volume: number;
    parameters?: any;
    timestamp?: string;
  }): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const timestamp = data.timestamp || new Date().toISOString();
    const parameters = data.parameters || {};

    // Insert fart event
    const insertEvent = this.db.prepare(`
      INSERT INTO fart_events (
        user_id, volume, bass_gain, bass_frequency, 
        distortion_amount, volume_multiplier, playback_rate, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertEvent.run(
      data.userId,
      data.volume,
      parameters.bassGain || null,
      parameters.bassFrequency || null,
      parameters.distortionAmount || null,
      parameters.volumeMultiplier || null,
      parameters.playbackRate || null,
      timestamp
    );

    // Update or insert user stats
    const existingStats = this.db.prepare('SELECT * FROM user_fart_stats WHERE user_id = ?').get(data.userId) as any;

    if (existingStats) {
      const updateStats = this.db.prepare(`
        UPDATE user_fart_stats 
        SET total_farts = total_farts + 1,
            total_volume = total_volume + ?,
            avg_volume = (total_volume + ?) / (total_farts + 1),
            max_volume = MAX(max_volume, ?),
            min_volume = CASE WHEN min_volume = 0 OR ? < min_volume THEN ? ELSE min_volume END,
            last_fart = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      updateStats.run(data.volume, data.volume, data.volume, data.volume, data.volume, timestamp, data.userId);
    } else {
      const insertStats = this.db.prepare(`
        INSERT INTO user_fart_stats (
          user_id, total_farts, total_volume, avg_volume,
          max_volume, min_volume, first_fart, last_fart
        ) VALUES (?, 1, ?, ?, ?, ?, ?, ?)
      `);

      insertStats.run(
        data.userId,
        data.volume,
        data.volume,
        data.volume,
        data.volume,
        timestamp,
        timestamp
      );
    }

    // Update daily processing stats
    const today = new Date().toISOString().split('T')[0];
    const existingDailyStats = this.db.prepare('SELECT * FROM processing_stats WHERE date = ?').get(today) as any;

    if (existingDailyStats) {
      const isProcessed = parameters.bassGain !== undefined;
      const updateDaily = this.db.prepare(`
        UPDATE processing_stats 
        SET total_processed = total_processed + 1,
            ${isProcessed ? 'processed_playbacks = processed_playbacks + 1,' : 'simple_playbacks = simple_playbacks + 1,'}
            avg_bass_gain = CASE WHEN ? IS NOT NULL THEN (avg_bass_gain * (total_processed - 1) + ?) / total_processed ELSE avg_bass_gain END,
            avg_distortion = CASE WHEN ? IS NOT NULL THEN (avg_distortion * (total_processed - 1) + ?) / total_processed ELSE avg_distortion END,
            avg_volume_multiplier = CASE WHEN ? IS NOT NULL THEN (avg_volume_multiplier * (total_processed - 1) + ?) / total_processed ELSE avg_volume_multiplier END,
            updated_at = CURRENT_TIMESTAMP
        WHERE date = ?
      `);

      updateDaily.run(
        parameters.bassGain, parameters.bassGain,
        parameters.distortionAmount, parameters.distortionAmount,
        parameters.volumeMultiplier, parameters.volumeMultiplier,
        today
      );
    } else {
      const isProcessed = parameters.bassGain !== undefined;
      const insertDaily = this.db.prepare(`
        INSERT INTO processing_stats (
          date, total_processed, ${isProcessed ? 'processed_playbacks' : 'simple_playbacks'},
          avg_bass_gain, avg_distortion, avg_volume_multiplier
        ) VALUES (?, 1, 1, ?, ?, ?)
      `);

      insertDaily.run(
        today,
        parameters.bassGain || 0,
        parameters.distortionAmount || 0,
        parameters.volumeMultiplier || 0
      );
    }

    return {
      success: true,
      fartId: result.lastInsertRowid,
      timestamp
    };
  }

  /**
   * Get fart leaderboard
   */
  async getFartLeaderboard(limit: number = 10): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const leaderboard = this.db.prepare(`
      SELECT 
        user_id,
        total_farts,
        total_volume,
        avg_volume,
        max_volume,
        last_fart
      FROM user_fart_stats
      ORDER BY total_farts DESC
      LIMIT ?
    `).all(limit);

    return leaderboard;
  }

  /**
   * Get fart history for a user
   */
  async getFartHistory(userId: string, limit: number = 20): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const history = this.db.prepare(`
      SELECT * FROM fart_events
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(userId, limit);

    return history;
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    // Get last 7 days of processing stats
    const stats = this.db.prepare(`
      SELECT * FROM processing_stats
      ORDER BY date DESC
      LIMIT 7
    `).all();

    // Calculate overall averages
    const overall = this.db.prepare(`
      SELECT 
        SUM(total_processed) as total_processed,
        SUM(processed_playbacks) as processed_playbacks,
        SUM(simple_playbacks) as simple_playbacks,
        AVG(avg_bass_gain) as avg_bass_gain,
        AVG(avg_distortion) as avg_distortion,
        AVG(avg_volume_multiplier) as avg_volume_multiplier
      FROM processing_stats
    `).get();

    return {
      daily: stats,
      overall
    };
  }

  /**
   * Get daily fart statistics
   */
  async getDailyFartStats(days: number = 7): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stats = this.db.prepare(`
      SELECT 
        date(timestamp) as date,
        COUNT(*) as total_farts,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(volume) as avg_volume,
        SUM(volume) as total_volume,
        MAX(volume) as max_volume
      FROM fart_events
      WHERE date(timestamp) >= date('now', '-${days} days')
      GROUP BY date(timestamp)
      ORDER BY date DESC
    `).all();

    return stats;
  }
}

// Export singleton instance
export const fartService = new FartService();