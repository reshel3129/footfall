import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  change?: string;
}

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * value);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);
  
  return <>{displayValue}</>;
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          bg: 'from-emerald-900/20 to-emerald-800/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          glow: 'shadow-emerald-500/20',
          iconBg: 'from-emerald-500 to-emerald-600'
        };
      case 'danger':
        return {
          bg: 'from-rose-900/20 to-rose-800/20',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          glow: 'shadow-rose-500/20',
          iconBg: 'from-rose-500 to-rose-600'
        };
      case 'warning':
        return {
          bg: 'from-amber-900/20 to-amber-800/20',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          glow: 'shadow-amber-500/20',
          iconBg: 'from-amber-500 to-amber-600'
        };
      case 'info':
        return {
          bg: 'from-blue-900/20 to-blue-800/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          glow: 'shadow-blue-500/20',
          iconBg: 'from-blue-500 to-blue-600'
        };
      default:
        return {
          bg: 'from-blue-900/20 to-blue-800/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          glow: 'shadow-blue-500/20',
          iconBg: 'from-blue-500 to-blue-600'
        };
    }
  };

  const colors = getColorClasses();
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)'
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={`backdrop-blur-xl bg-gradient-to-br ${colors.bg} rounded-2xl shadow-2xl p-6 border ${colors.border} relative overflow-hidden group`}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />
      
      {/* Glowing border effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, transparent, rgba(100, 116, 139, 0.3), transparent)`,
        }}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-medium text-slate-400 mb-2"
          >
            {title}
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              delay: 0.2 
            }}
            className="text-4xl font-bold text-slate-100 mb-1"
          >
            <AnimatedCounter value={numericValue} duration={1.5} />
          </motion.p>
          {change && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-slate-400 font-medium"
            >
              {change}
            </motion.p>
          )}
        </div>
        <motion.div
          whileHover={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: 1.1
          }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div 
            className={`p-4 rounded-2xl bg-gradient-to-br ${colors.iconBg} shadow-lg`}
            animate={{
              boxShadow: [
                '0 4px 20px rgba(0, 0, 0, 0.1)',
                '0 8px 30px rgba(0, 0, 0, 0.15)',
                '0 4px 20px rgba(0, 0, 0, 0.1)',
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-white">
              {icon}
            </div>
          </motion.div>
          {/* Pulsing ring effect */}
          <motion.div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.iconBg}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Floating particles effect */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${colors.text} opacity-30`}
          style={{
            left: `${20 + i * 30}%`,
            bottom: `${10 + i * 10}%`,
          }}
          animate={{
            y: [-20, -40, -20],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </motion.div>
  );
};

export default StatsCard;
