import { supabase } from './supabase';

export const ActivityService = {
  // Record user login and update streak
  async recordLogin(userId) {
    try {
      await supabase.rpc('record_login', { user_uuid: userId });
    } catch (error) {
      console.error('Error recording login:', error);
    }
  },

  // Get user's current streak info
  async getStreakInfo(userId) {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_login_date')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting streak info:', error);
      return null;
    }
  },

  // Get user's activity data for heatmap
  async getActivityData(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('login_date')
        .eq('user_id', userId)
        .gte('login_date', startDate)
        .lte('login_date', endDate)
        .order('login_date', { ascending: true });

      if (error) throw error;

      // Convert to format needed for heatmap
      const activityMap = new Map();
      data.forEach(({ login_date }) => {
        activityMap.set(login_date, (activityMap.get(login_date) || 0) + 1);
      });

      // Create array for all dates in range
      const allDates = [];
      const current = new Date(startDate);
      const end = new Date(endDate);
      
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        allDates.push({
          date: dateStr,
          count: activityMap.get(dateStr) || 0
        });
        current.setDate(current.getDate() + 1);
      }

      return allDates;
    } catch (error) {
      console.error('Error getting activity data:', error);
      return [];
    }
  },

  // Get date range for last 365 days
  getActivityDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364); // Get last 365 days
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
}; 