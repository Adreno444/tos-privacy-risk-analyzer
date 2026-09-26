import React from 'react';

interface GradeBadgeProps {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, size = 'md' }) => {
  const getStyles = () => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-zinc-900 text-zinc-100 border-zinc-700';
      case 'B':
        return 'bg-zinc-900 text-zinc-200 border-zinc-700';
      case 'C':
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
      case 'D':
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
      case 'F':
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2.5 py-0.5 border rounded-md font-mono';
      case 'lg':
        return 'text-3xl px-5 py-2 border rounded-xl font-mono';
      case 'xl':
        return 'text-5xl px-7 py-3 border rounded-xl font-mono';
      case 'md':
      default:
        return 'text-xl px-3.5 py-1 border rounded-lg font-mono';
    }
  };

  return (
    <span
      className={`font-semibold inline-flex items-center justify-center tracking-tight select-none ${getStyles()} ${getSize()}`}
    >
      {grade}
    </span>
  );
};
