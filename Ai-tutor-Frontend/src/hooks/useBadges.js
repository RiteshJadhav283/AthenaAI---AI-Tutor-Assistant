import { useState, useEffect } from 'react';
import { BADGE_TYPES } from '@/components/badges/BadgeTypes';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export function useBadges(userId) {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load earned badges from the database
  useEffect(() => {
    if (!userId) return;

    const loadBadges = async () => {
      try {
        const { data, error } = await supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', userId);

        if (error) throw error;

        setEarnedBadges(data.map(b => b.badge_id));
      } catch (error) {
        console.error('Error loading badges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, [userId]);

  // Check and award streak badges
  const checkStreakBadges = async (currentStreak) => {
    const streakBadges = Object.values(BADGE_TYPES).filter(
      badge => badge.type === 'streak' && badge.requirement <= currentStreak
    );

    for (const badge of streakBadges) {
      if (!earnedBadges.includes(badge.id)) {
        await awardBadge(badge);
      }
    }
  };

  // Check and award chapter badges
  const checkChapterBadges = async (completedChapters) => {
    const chapterBadges = Object.values(BADGE_TYPES).filter(
      badge => badge.type === 'chapter'
    );

    for (const badge of chapterBadges) {
      if (badge.id === 'first_chapter' && completedChapters > 0) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      } else if (badge.requirement && completedChapters >= badge.requirement) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      }
    }
  };

  // Check and award test badges
  const checkTestBadges = async (testStats) => {
    const { totalTests, consecutiveAbove90, perfectScores } = testStats;
    const testBadges = Object.values(BADGE_TYPES).filter(
      badge => badge.type === 'test'
    );

    for (const badge of testBadges) {
      if (badge.id === 'first_test' && totalTests > 0) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      } else if (badge.id === 'perfect_score' && perfectScores > 0) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      } else if (badge.id === 'consistency_king' && consecutiveAbove90 >= 5) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      } else if (badge.requirement && totalTests >= badge.requirement) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      }
    }
  };

  // Check and award doubt badges
  const checkDoubtBadges = async (doubtStats) => {
    const { totalDoubts, doubtsResolved } = doubtStats;
    const doubtBadges = Object.values(BADGE_TYPES).filter(
      badge => badge.type === 'doubt'
    );

    for (const badge of doubtBadges) {
      if (badge.id === 'first_doubt' && totalDoubts > 0) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      } else if (badge.id === 'doubt_solver' && doubtsResolved >= 5) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      } else if (badge.requirement && totalDoubts >= badge.requirement) {
        if (!earnedBadges.includes(badge.id)) {
          await awardBadge(badge);
        }
      }
    }
  };

  // Award a badge to the user
  const awardBadge = async (badge) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badge.id,
          awarded_at: new Date().toISOString()
        });

      if (error) throw error;

      setEarnedBadges(prev => [...prev, badge.id]);

      // Show toast notification
      toast({
        title: "🎉 New Badge Earned!",
        description: `Congratulations! You've earned the "${badge.name}" badge.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  return {
    earnedBadges,
    loading,
    checkStreakBadges,
    checkChapterBadges,
    checkTestBadges,
    checkDoubtBadges
  };
} 