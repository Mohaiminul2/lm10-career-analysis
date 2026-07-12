import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  id: string;
  title: string;
  value: string | number;
  subValue?: string | number;
  subLabel?: string;
  icon: LucideIcon;
  accentColor?: 'sky' | 'gold' | 'white';
  tooltipText?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  subValue,
  subLabel,
  icon: Icon,
  accentColor = 'sky',
  tooltipText
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'gold':
        return {
          border: 'border-amber-500/20 hover:border-amber-500/40',
          text: 'text-amber-400',
          glow: 'shadow-amber-500/5',
          bg: 'bg-gradient-to-br from-amber-500/5 to-transparent',
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'white':
        return {
          border: 'border-slate-500/20 hover:border-slate-500/40',
          text: 'text-slate-100',
          glow: 'shadow-white/5',
          bg: 'bg-gradient-to-br from-slate-500/5 to-transparent',
          iconBg: 'bg-slate-100/10 text-slate-100 border-slate-500/20'
        };
      case 'sky':
      default:
        return {
          border: 'border-sky-500/20 hover:border-sky-500/40',
          text: 'text-sky-400',
          glow: 'shadow-sky-500/5',
          bg: 'bg-gradient-to-br from-sky-500/5 to-transparent',
          iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <motion.div
      id={id}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden rounded-xl border ${styles.border} ${styles.bg} bg-slate-900/60 p-5 shadow-lg backdrop-blur-md transition-all duration-300 ${styles.glow}`}
    >
      {/* Decorative subtle linear background bar */}
      <div className={`absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r ${accentColor === 'gold' ? 'from-amber-500/40 to-transparent' : accentColor === 'white' ? 'from-slate-100/40 to-transparent' : 'from-sky-400/40 to-transparent'}`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${styles.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          {value}
        </span>
        {subValue && (
          <span className={`text-sm font-bold ${styles.text}`}>
            {subValue}
          </span>
        )}
      </div>

      {subLabel && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{subLabel}</span>
          {tooltipText && (
            <div className="group relative cursor-help">
              <span className="underline decoration-slate-600 decoration-dotted">Info</span>
              <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-48 rounded bg-slate-950 p-2 text-2xs text-slate-300 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 border border-slate-800 z-50">
                {tooltipText}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
