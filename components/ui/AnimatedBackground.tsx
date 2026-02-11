import React from 'react';

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Animated Grid Lines */}
            <div className="absolute inset-0">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern
                            id="grid-pattern"
                            width="50"
                            height="50"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 50 0 L 0 0 0 50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-slate-100 dark:text-blue-500/10"
                            />
                        </pattern>
                        <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                            <stop offset="50%" stopColor="rgba(255, 255, 255, 0)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>

            {/* Animated Diagonal Lines */}
            <div className="absolute inset-0 opacity-30 dark:opacity-20">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-[2px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                        style={{
                            width: '200%',
                            top: `${i * 8}%`,
                            left: '-50%',
                            transform: `rotate(-15deg)`,
                            animation: `slideRight ${15 + i * 2}s linear infinite`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
        @keyframes slideRight {
          0% {
            transform: translateX(-50%) rotate(-15deg);
          }
          100% {
            transform: translateX(50%) rotate(-15deg);
          }
        }
      `}</style>
        </div>
    );
};
