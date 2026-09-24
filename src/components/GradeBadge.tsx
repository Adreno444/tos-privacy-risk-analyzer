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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20';
      case 'B':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/20';
      case 'C':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/20';
      case 'D':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-orange-500/20';
      case 'F':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-rose-500/20';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'text-lg px-2.5 py-1 border';
      case 'lg':
        return 'text-4xl px-5 py-2.5 border-2';
      case 'xl':
        return 'text-6xl px-8 py-4 border-2';
      case 'md':
      default:
        return 'text-2xl px-4 py-1.5 border';
    }
  };

  return (
    <span
      className={`font-black rounded-xl inline-flex items-center justify-center font-mono tracking-wider shadow-lg ${getStyles()} ${getSize()}`}
    >
      {grade}
    </span>
  );
};
