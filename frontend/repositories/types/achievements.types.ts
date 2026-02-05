export interface AchievementTemplate {
  id: string
  name: string
  description: string
  icon: string
}

export interface Achievement {
  id: number
  userId: string
  achievementId: string
  achievementName: string
  description: string
  icon: string
  unlockedAt: string
}

export interface AchievementDisplay {
  template: AchievementTemplate
  unlocked: boolean
  unlockedAt?: string
}

export interface AchievementProgress {
  total: number
  unlocked: number
  locked: number
  percentage: number
}

export interface AchievementsResponse {
  success: boolean
  achievements: Achievement[]
  count: number
}

export interface AllAchievementsResponse {
  success: boolean
  achievements: AchievementDisplay[]
}

export interface AchievementProgressResponse {
  success: boolean
  progress: AchievementProgress
}

export interface CheckAchievementsResponse {
  success: boolean
  newUnlocks: string[]
  message: string
}
