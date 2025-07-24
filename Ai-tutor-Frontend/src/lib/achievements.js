import { supabase } from './supabase';
import { BADGE_TYPES } from '@/components/badges/BadgeTypes';

export const AchievementService = {
  // Initialize user progress records
  async initializeUser(userId) {
    try {
      // Initialize user_progress
      await supabase
        .from('user_progress')
        .upsert({ user_id: userId }, { onConflict: 'user_id' });

      // Initialize user_doubts
      await supabase
        .from('user_doubts')
        .upsert({ user_id: userId }, { onConflict: 'user_id' });

      // Initialize user_streaks
      await supabase
        .from('user_streaks')
        .upsert({ 
          user_id: userId,
          last_activity_date: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  },

  // Update daily streak
  async updateStreak(userId) {
    try {
      const { data: { update_user_streak } } = await supabase
        .rpc('update_user_streak', { user_uuid: userId });

      // Get current streak after update
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      if (streakData) {
        await this.checkStreakBadges(userId, streakData.current_streak);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  },

  // Record chapter completion
  async completeChapter(userId, chapterId) {
    try {
      // Record chapter completion
      await supabase
        .from('chapter_completion')
        .insert({ user_id: userId, chapter_id: chapterId });

      // Update total chapters completed
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('chapters_completed')
        .eq('user_id', userId)
        .single();

      const newCount = (progressData?.chapters_completed || 0) + 1;

      await supabase
        .from('user_progress')
        .upsert({ 
          user_id: userId,
          chapters_completed: newCount
        });

      await this.checkChapterBadges(userId, newCount);
    } catch (error) {
      console.error('Error completing chapter:', error);
    }
  },

  // Record test completion
  async completeTest(userId, testId, score) {
    try {
      // Record test result
      await supabase
        .from('test_results')
        .insert({ 
          user_id: userId,
          test_id: testId,
          score
        });

      // Update user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      let consecutive = progressData?.consecutive_above_90 || 0;
      if (score > 90) {
        consecutive += 1;
      } else {
        consecutive = 0;
      }

      const perfect = score === 100 ? 
        (progressData?.tests_perfect_score || 0) + 1 : 
        (progressData?.tests_perfect_score || 0);

      await supabase
        .from('user_progress')
        .upsert({ 
          user_id: userId,
          tests_completed: (progressData?.tests_completed || 0) + 1,
          tests_perfect_score: perfect,
          consecutive_above_90: consecutive
        });

      await this.checkTestBadges(userId, {
        totalTests: (progressData?.tests_completed || 0) + 1,
        consecutiveAbove90: consecutive,
        perfectScores: perfect
      });
    } catch (error) {
      console.error('Error completing test:', error);
    }
  },

  // Record doubt activity
  async recordDoubt(userId, isAsking = true) {
    try {
      const { data: doubtData } = await supabase
        .from('user_doubts')
        .select('*')
        .eq('user_id', userId)
        .single();

      await supabase
        .from('user_doubts')
        .upsert({ 
          user_id: userId,
          doubts_asked: isAsking ? 
            (doubtData?.doubts_asked || 0) + 1 : 
            (doubtData?.doubts_asked || 0),
          doubts_resolved: !isAsking ? 
            (doubtData?.doubts_resolved || 0) + 1 : 
            (doubtData?.doubts_resolved || 0)
        });

      await this.checkDoubtBadges(userId, {
        totalDoubts: (doubtData?.doubts_asked || 0) + (isAsking ? 1 : 0),
        doubtsResolved: (doubtData?.doubts_resolved || 0) + (!isAsking ? 1 : 0)
      });
    } catch (error) {
      console.error('Error recording doubt:', error);
    }
  },

  // Check and award streak badges
  async checkStreakBadges(userId, currentStreak) {
    const streakBadges = Object.values(BADGE_TYPES).filter(
      badge => badge.type === 'streak' && badge.requirement <= currentStreak
    );

    for (const badge of streakBadges) {
      await this.awardBadge(userId, badge.id);
    }
  },

  // Check and award chapter badges
  async checkChapterBadges(userId, completedChapters) {
    const chapterBadges = Object.values(BADGE_TYPES).filter(
      badge => badge.type === 'chapter'
    );

    for (const badge of chapterBadges) {
      if (badge.id === 'first_chapter' && completedChapters > 0) {
        await this.awardBadge(userId, badge.id);
      } else if (badge.requirement && completedChapters >= badge.requirement) {
        await this.awardBadge(userId, badge.id);
      }
    }
  },

  // Check and award test badges
  async checkTestBadges(userId, stats) {
    const testBadges = Object.values(BADGE_TYPES).filter(
      badge => badge.type === 'test'
    );

    for (const badge of testBadges) {
      if (badge.id === 'first_test' && stats.totalTests > 0) {
        await this.awardBadge(userId, badge.id);
      } else if (badge.id === 'perfect_score' && stats.perfectScores > 0) {
        await this.awardBadge(userId, badge.id);
      } else if (badge.id === 'consistency_king' && stats.consecutiveAbove90 >= 5) {
        await this.awardBadge(userId, badge.id);
      } else if (badge.requirement && stats.totalTests >= badge.requirement) {
        await this.awardBadge(userId, badge.id);
      }
    }
  },

  // Check and award doubt badges
  async checkDoubtBadges(userId, stats) {
    const doubtBadges = Object.values(BADGE_TYPES).filter(
      badge => badge.type === 'doubt'
    );

    for (const badge of doubtBadges) {
      if (badge.id === 'first_doubt' && stats.totalDoubts > 0) {
        await this.awardBadge(userId, badge.id);
      } else if (badge.id === 'doubt_solver' && stats.doubtsResolved >= 5) {
        await this.awardBadge(userId, badge.id);
      } else if (badge.requirement && stats.totalDoubts >= badge.requirement) {
        await this.awardBadge(userId, badge.id);
      }
    }
  },

  // Award a badge if not already earned
  async awardBadge(userId, badgeId) {
    try {
      // Check if badge already earned
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single();

      if (!existing) {
        await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badgeId
          });
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  }
}; 