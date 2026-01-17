import React, { useEffect, useState } from 'react';

interface StarBurstProps {
    active: boolean;
    duration?: number;
}

export const StarBurst: React.FC<StarBurstProps> = ({ active, duration = 1500 }) => {
    const [stars, setStars] = useState<Array<{
        id: number;
        size: number;
        color: string;
        delay: number;
        angle: number;
    }>>([]);

    useEffect(() => {
        if (!active) {
            setStars([]);
            return;
        }

        const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF1493', '#7B68EE'];
        const newStars = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            size: 20 + Math.random() * 40,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 300,
            angle: (360 / 50) * i
        }));

        setStars(newStars);

        const cleanup = setTimeout(() => setStars([]), duration);
        return () => clearTimeout(cleanup);
    }, [active, duration]);

    if (!active || stars.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute"
                    style={{
                        animation: `star-burst ${duration}ms ease-out forwards`,
                        animationDelay: `${star.delay}ms`,
                        '--star-angle': `${star.angle}deg`,
                        '--star-distance': '400px'
                    } as React.CSSProperties}
                >
                    <div
                        className="relative"
                        style={{
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            animation: `star-spin ${duration}ms linear infinite`
                        }}
                    >
                        <svg viewBox="0 0 51 48" fill={star.color}>
                            <path d="M25.5 0L31.5 18.5H51L36 30L42 48L25.5 36L9 48L15 30L0 18.5H19.5L25.5 0Z" />
                        </svg>
                    </div>
                </div>
            ))}

            <style>{`
        @keyframes star-burst {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(cos(var(--star-angle)) * var(--star-distance)),
              calc(sin(var(--star-angle)) * var(--star-distance))
            ) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes star-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
};
