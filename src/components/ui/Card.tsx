import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-[2rem] bg-white/90 dark:bg-[#0d1322]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xl shadow-slate-900/5 transition-all duration-300',
          hoverEffect && 'hover:shadow-2xl hover:shadow-blue-500/10 hover:border-slate-300 dark:hover:border-slate-700/80 hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
