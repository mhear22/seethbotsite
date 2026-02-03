interface UserPoints {
  userId: string;
  userName: string;
  avatar: string;
  points: number;
  basePoints: number;
  lastInteraction: number;
  isCurrentUser?: boolean;
}

const BASE_SCORES: Map<string, UserPoints> = new Map([
  ['cam', { userId: 'cam', userName: 'Cam', avatar: '🥔', points: 10000, basePoints: 10000, lastInteraction: 0 }],
  ['orlando', { userId: 'orlando', userName: 'Orlando', avatar: '🌙', points: 10067, basePoints: 10067, lastInteraction: 0 }],
  ['ashley', { userId: 'ashley', userName: 'Ashley', avatar: '<:flooshies:1000736727259947069>', points: 5000, basePoints: 5000, lastInteraction: 0 }],
  ['averagehex', { userId: 'averagehex', userName: 'Average Hex', avatar: '🌸', points: 2000, basePoints: 2000, lastInteraction: 0 }],
  ['temer3', { userId: 'temer3', userName: 'Temer3', avatar: '🔧', points: 1800, basePoints: 1800, lastInteraction: 0 }],
  ['you', { userId: 'you', userName: 'You', avatar: '🫵', points: 1467, basePoints: 1467, lastInteraction: 0, isCurrentUser: true }],
  ['changyi', { userId: 'changyi', userName: "Chang'Yi", avatar: '<:sadcat:1000736705197907968>', points: 1468, basePoints: 1367, lastInteraction: 0 }],
  ['goose', { userId: 'goose', userName: 'Goose', avatar: '🪿', points: 500, basePoints: 500, lastInteraction: 0 }],
  ['rium', { userId: 'rium', userName: 'RIUM+', avatar: '🎮', points: 501, basePoints: 501, lastInteraction: 0 }],
  ['goopsworthy', { userId: 'goopsworthy', userName: 'Goopsworthy', avatar: '🍄', points: 667, basePoints: 667, lastInteraction: 0 }],
  ['blair', { userId: 'blair', userName: 'Blair', avatar: '🎮', points: 900, basePoints: 900, lastInteraction: 0 }],
  ['claire', { userId: 'claire', userName: "Claire Salem %◕‿‿◕%", avatar: '✨', points: 500, basePoints: 500, lastInteraction: 0 }],
  ['shiyuan', { userId: 'shiyuan', userName: 'ShiYuan', avatar: '🧶', points: 500, basePoints: 500, lastInteraction: 0 }],
  ['meixiang', { userId: 'meixiang', userName: '美香', avatar: '🏍️', points: 21467, basePoints: 21467, lastInteraction: 0 }],
  ['others', { userId: 'others', userName: 'Others', avatar: '✨', points: 500, basePoints: 500, lastInteraction: 0 }],
]);

const COOLDOWN_MS = 60 * 1000;
const MIN_INTERACTION_POINTS = 1;
const SPAM_PENALTY = 2;
const DECAY_RATE = 10;

class PointsManager {
  private userPoints: Map<string, UserPoints>;
  private lastDecayCheck: number;

  constructor() {
    this.userPoints = new Map();
    this.lastDecayCheck = Date.now();
    
    BASE_SCORES.forEach((user, key) => {
      this.userPoints.set(key, { ...user });
    });
  }

  applyDecay() {
    const now = Date.now();
    const hoursPassed = (now - this.lastDecayCheck) / (1000 * 60 * 60);
    
    if (hoursPassed >= 1) {
      const pointsToLose = Math.floor(hoursPassed * DECAY_RATE);
      
      this.userPoints.forEach((user, key) => {
        const pointsAboveBase = user.points - user.basePoints;
        if (pointsAboveBase > 0) {
          const decayAmount = Math.min(pointsAboveBase, pointsToLose);
          user.points = Math.max(user.basePoints, user.points - decayAmount);
        }
      });
      
      this.lastDecayCheck = now;
    }
  }

  getUser(userId: string): UserPoints | undefined {
    this.applyDecay();
    return this.userPoints.get(userId);
  }

  getAllUsers() {
    this.applyDecay();
    return Array.from(this.userPoints.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 50)
      .map((user, index) => ({
        avatar: user.avatar,
        name: user.userName,
        score: user.points,
        isCurrentUser: user.isCurrentUser
      }));
  }

  addPoints(userId: string, reason: string): { success: boolean; points: number; message: string } {
    this.applyDecay();
    
    let user = this.userPoints.get(userId);
    
    if (!user) {
      const base = BASE_SCORES.get('others');
      if (base) {
        user = { ...base, userId, userName: 'User ' + userId.slice(-4), points: base.basePoints };
        this.userPoints.set(userId, user);
      } else {
        return { success: false, points: 0, message: 'User not found' };
      }
    }
    
    const now = Date.now();
    const timeSinceLastInteraction = now - user.lastInteraction;
    
    let pointsEarned = 5;
    
    if (timeSinceLastInteraction < COOLDOWN_MS) {
      const cooldownProgress = timeSinceLastInteraction / COOLDOWN_MS;
      pointsEarned = Math.floor(MIN_INTERACTION_POINTS + (5 - MIN_INTERACTION_POINTS) * cooldownProgress);
      
      user.points = Math.max(user.basePoints, user.points - SPAM_PENALTY);
      
      return { 
        success: true, 
        points: pointsEarned - SPAM_PENALTY, 
        message: `Cooldown: +${pointsEarned} points (spam: -${SPAM_PENALTY})` 
      };
    }
    
    user.points += pointsEarned;
    user.lastInteraction = now;
    
    return { 
      success: true, 
      points: pointsEarned, 
      message: `+${pointsEarned} points for "${reason}"` 
    };
  }

  resetUser(userId: string): boolean {
    const base = BASE_SCORES.get(userId);
    if (base) {
      const user = this.userPoints.get(userId);
      if (user) {
        user.points = base.basePoints;
        user.lastInteraction = 0;
        this.userPoints.set(userId, user);
        return true;
      }
    }
    return false;
  }

  getLeaderboard(): { rankings: any[] } {
    const users = this.getAllUsers();
    
    return {
      rankings: users.map((user, index) => ({
        ...user,
        rank: index + 1
      }))
    };
  }
}

const pointsManager = new PointsManager();

export { pointsManager };
