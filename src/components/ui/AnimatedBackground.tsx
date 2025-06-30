import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Ball {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

export const AnimatedBackground = () => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const colors = [
    'from-mokm-pink-300/20 to-mokm-pink-500/20',
    'from-mokm-purple-300/20 to-mokm-purple-500/20',
    'from-mokm-blue-300/20 to-mokm-blue-500/20',
  ];

  useEffect(() => {
    const newBalls: Ball[] = [];
    const ballCount = 12; // Reduced number of balls for better performance
    
    for (let i = 0; i < ballCount; i++) {
      newBalls.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 200 + 100, // 100-300px
        duration: Math.random() * 15 + 20, // 20-35s
        delay: Math.random() * -30, // Start at different times
        opacity: Math.random() * 0.1 + 0.05, // 0.05-0.15
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setBalls(newBalls);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {balls.map((ball) => (
        <motion.div
          key={ball.id}
          className={`absolute rounded-full bg-gradient-to-br ${ball.color} blur-3xl`}
          style={{
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            opacity: ball.opacity,
          }}
          animate={{
            x: [
              '0%',
              `${(Math.random() - 0.5) * 30}%`,
              `${(Math.random() - 0.5) * 20}%`,
              '0%',
            ],
            y: [
              '0%',
              `${(Math.random() - 0.5) * 30}%`,
              `${(Math.random() - 0.5) * 20}%`,
              '0%',
            ],
          }}
          transition={{
            duration: ball.duration,
            delay: ball.delay,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
