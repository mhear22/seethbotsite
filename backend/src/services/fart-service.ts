/**
 * Fart Service
 * Handles all fart-related data operations and statistics
 */

import { prisma } from '../lib/prisma';

/**
 * Fart Service class
 */
class FartService {
  /**
   * Get overall fart statistics
   */
  async getFartStats(): Promise<any> {
    const totalFarts = await prisma.fartEvent.count();
    const totalUsers = await prisma.userFartStats.count();

    const aggregates = await prisma.fartEvent.aggregate({
      _sum: { volume: true },
      _avg: { volume: true }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFarts = await prisma.fartEvent.count({
      where: {
        timestamp: {
          gte: today
        }
      }
    });

    return {
      totalFarts,
      totalUsers,
      totalVolume: aggregates._sum.volume || 0,
      avgVolume: aggregates._avg.volume || 0,
      todayFarts,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get fart statistics for a specific user
   */
  async getUserFartStats(userId: string | number): Promise<any> {
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;

    const stats = await prisma.userFartStats.findUnique({
      where: { user_id: userIdNum }
    });

    if (!stats) {
      return null;
    }

    // Get recent farts
    const recentFarts = await prisma.fartEvent.findMany({
      where: { user_id: userIdNum },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    return {
      ...stats,
      recentFarts
    };
  }

  /**
   * Record a fart event
   */
  async recordFart(data: {
    userId: string | number;
    volume: number;
    parameters?: any;
    timestamp?: Date;
  }): Promise<any> {
    const userIdNum = typeof data.userId === 'string' ? parseInt(data.userId) : data.userId;
    const timestamp = data.timestamp || new Date();
    const parameters = data.parameters || {};

    // Insert fart event
    const fartEvent = await prisma.fartEvent.create({
      data: {
        user_id: userIdNum,
        volume: data.volume,
        bass_gain: parameters.bassGain || null,
        bass_frequency: parameters.bassFrequency || null,
        distortion_amount: parameters.distortionAmount || null,
        volume_multiplier: parameters.volumeMultiplier || null,
        playback_rate: parameters.playbackRate || null,
        timestamp: timestamp as any
      }
    });

    // Update or insert user stats
    const existingStats = await prisma.userFartStats.findUnique({
      where: { user_id: userIdNum }
    });

    if (existingStats) {
      const newTotalFarts = existingStats.total_farts + 1;
      const newTotalVolume = existingStats.total_volume + data.volume;
      const newAvgVolume = newTotalVolume / newTotalFarts;

      await prisma.userFartStats.update({
        where: { user_id: userIdNum },
        data: {
          total_farts: newTotalFarts,
          total_volume: newTotalVolume,
          avg_volume: newAvgVolume,
          max_volume: Math.max(existingStats.max_volume, data.volume),
          min_volume: existingStats.min_volume === 0 || data.volume < existingStats.min_volume ? data.volume : existingStats.min_volume,
          last_fart: timestamp as any,
          updated_at: new Date()
        }
      });
    } else {
      await prisma.userFartStats.create({
        data: {
          user_id: userIdNum,
          total_farts: 1,
          total_volume: data.volume,
          avg_volume: data.volume,
          max_volume: data.volume,
          min_volume: data.volume,
          first_fart: timestamp as any,
          last_fart: timestamp as any
        }
      });
    }

    // Update daily processing stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    const isProcessed = parameters.bassGain !== undefined;

    const existingDailyStats = await prisma.processingStats.findUnique({
      where: { date: todayString }
    });

    if (existingDailyStats) {
      const newTotalProcessed = existingDailyStats.total_processed + 1;

      await prisma.processingStats.update({
        where: { date: todayString },
        data: {
          total_processed: newTotalProcessed,
          simple_playbacks: existingDailyStats.simple_playbacks + (isProcessed ? 0 : 1),
          processed_playbacks: existingDailyStats.processed_playbacks + (isProcessed ? 1 : 0),
          avg_bass_gain: parameters.bassGain !== undefined
            ? (existingDailyStats.avg_bass_gain * (newTotalProcessed - 1) + parameters.bassGain) / newTotalProcessed
            : existingDailyStats.avg_bass_gain,
          avg_distortion: parameters.distortionAmount !== undefined
            ? (existingDailyStats.avg_distortion * (newTotalProcessed - 1) + parameters.distortionAmount) / newTotalProcessed
            : existingDailyStats.avg_distortion,
          avg_volume_multiplier: parameters.volumeMultiplier !== undefined
            ? (existingDailyStats.avg_volume_multiplier * (newTotalProcessed - 1) + parameters.volumeMultiplier) / newTotalProcessed
            : existingDailyStats.avg_volume_multiplier,
          updated_at: new Date()
        }
      });
    } else {
      await prisma.processingStats.create({
        data: {
          date: todayString,
          total_processed: 1,
          simple_playbacks: isProcessed ? 0 : 1,
          processed_playbacks: isProcessed ? 1 : 0,
          avg_bass_gain: parameters.bassGain || 0,
          avg_distortion: parameters.distortionAmount || 0,
          avg_volume_multiplier: parameters.volumeMultiplier || 0
        }
      });
    }

    return {
      success: true,
      fartId: fartEvent.id,
      timestamp
    };
  }

  /**
   * Get fart leaderboard
   */
  async getFartLeaderboard(limit: number = 10): Promise<any[]> {
    return prisma.userFartStats.findMany({
      orderBy: { total_farts: 'desc' },
      take: limit,
      select: {
        user_id: true,
        total_farts: true,
        total_volume: true,
        avg_volume: true,
        max_volume: true,
        last_fart: true
      }
    });
  }

  /**
   * Get fart history for a user
   */
  async getFartHistory(userId: string | number, limit: number = 20): Promise<any[]> {
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;

    return prisma.fartEvent.findMany({
      where: { user_id: userIdNum },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<any> {
    const stats = await prisma.processingStats.findMany({
      orderBy: { date: 'desc' },
      take: 7
    });

    const overall = await prisma.processingStats.aggregate({
      _sum: {
        total_processed: true,
        processed_playbacks: true,
        simple_playbacks: true
      },
      _avg: {
        avg_bass_gain: true,
        avg_distortion: true,
        avg_volume_multiplier: true
      }
    });

    return {
      daily: stats,
      overall
    };
  }

  /**
   * Get daily fart statistics
   */
  async getDailyFartStats(days: number = 7): Promise<any[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    daysAgo.setHours(0, 0, 0, 0);

    return prisma.$queryRaw<any[]>`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as total_farts,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(volume) as avg_volume,
        SUM(volume) as total_volume,
        MAX(volume) as max_volume
      FROM "FartEvent"
      WHERE timestamp >= ${daysAgo}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `;
  }
}

// Export singleton instance
export const fartService = new FartService();
