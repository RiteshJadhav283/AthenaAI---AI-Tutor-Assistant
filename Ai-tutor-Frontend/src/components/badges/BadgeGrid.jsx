import React from 'react';
import { Badge } from './Badge';
import { BADGE_TYPES } from './BadgeTypes';

export function BadgeGrid({ earnedBadges = [] }) {
  // Group badges by type
  const groupedBadges = Object.values(BADGE_TYPES).reduce((acc, badge) => {
    if (!acc[badge.type]) {
      acc[badge.type] = [];
    }
    acc[badge.type].push(badge);
    return acc;
  }, {});

  const typeLabels = {
    chapter: 'Chapter Progress',
    streak: 'Daily Streaks',
    test: 'Test Achievements',
    doubt: 'Learning Engagement'
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedBadges).map(([type, badges]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-lg font-semibold">{typeLabels[type]}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <Badge
                key={badge.id}
                badge={badge}
                isEarned={earnedBadges.includes(badge.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 