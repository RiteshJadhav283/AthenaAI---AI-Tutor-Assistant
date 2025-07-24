import React from 'react';
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function Badge({ 
  badge, 
  isEarned = false, 
  size = "md",
  showTooltip = true 
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const BadgeContent = () => (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-muted",
        sizeClasses[size],
        !isEarned && "opacity-40 grayscale"
      )}
    >
      <span className="text-2xl">{badge.icon}</span>
      {isEarned && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );

  if (!showTooltip) return <BadgeContent />;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="cursor-default">
          <BadgeContent />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{badge.name}</h4>
            <p className="text-sm text-muted-foreground">
              {badge.description}
            </p>
            {badge.requirement && (
              <p className="text-xs text-muted-foreground">
                Required: {badge.requirement} {badge.type}(s)
              </p>
            )}
          </div>
          <div className={sizeClasses.sm}>
            <BadgeContent />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 