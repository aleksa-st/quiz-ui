import React, { useEffect, useState } from 'react';

interface EmojiExplosionProps {
    active: boolean;
    type?: 'correct' | 'wrong' | 'perfect' | 'timeout';
    duration?: number;
}

const emojiSets = {
    correct: ['🎉', '⭐', '✨', '🌟', '💫', '🎊', '🏆', '👏', '🎯', '💪'],
    wrong: ['😅', '💭', '🤔', '📚', '💡', '🔄', '👍'],
    perfect: ['🏆', '👑', '🌟', '⭐', '✨', '💎', '🎖️', '🥇', '🎉', '🔥'],
    timeout: ['⏰', '⏱️', '💨', '🏃', '⚡']
};

export const EmojiExplosion: React.FC<EmojiExplosionProps> = ({
    active,
    type = 'correct',
    duration = 2000
}) => {
    const [emojis, setEmojis] = useState<Array<{
        emoji: string;
        id: number;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        rotation: number;
        delay: number;
        scale: number;
    }>>([]);

    useEffect(() => {
        if (!active) {
            setEmojis([]);
            return;
        }

        const emojiList = emojiSets[type];
        const count = type === 'perfect' ? 30 : 20;

        const newEmojis = Array.from({ length: count }, (_, i) => {
            const angle = (Math.PI * 2 * i) / count;
            const distance = 150 + Math.random() * 150;

            return {
                emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
                id: i,
                startX: 50,
                startY: 50,
                endX: 50 + Math.cos(angle) * distance,
                endY: 50 + Math.sin(angle) * distance,
                rotation: Math.random() * 720 - 360,
                delay: Math.random() * 200,
                scale: 0.8 + Math.random() * 0.6
            };
        });

        setEmojis(newEmojis);

        const cleanup = setTimeout(() => {
            setEmojis([]);
        }, duration);

        return () => clearTimeout(cleanup);
    }, [active, type, duration]);

    if (!active || emojis.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {emojis.map((item) => (
                <div
                    key={item.id}
                    className="absolute text-6xl animate-emoji-burst"
                    style={{
                        left: `${item.startX}%`,
                        top: `${item.startY}%`,
                        transform: `translate(-50%, -50%) scale(${item.scale})`,
                        animation: `emoji-burst ${duration}ms ease-out forwards`,
                        animationDelay: `${item.delay}ms`,
                        '--emoji-end-x': `${item.endX - item.startX}%`,
                        '--emoji-end-y': `${item.endY - item.startY}%`,
                        '--emoji-rotation': `${item.rotation}deg`
                    } as React.CSSProperties}
                >
                    {item.emoji}
                </div>
            ))}

            <style>{`
        @keyframes emoji-burst {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--emoji-end-x)), calc(-50% + var(--emoji-end-y))) 
                      scale(0.5) rotate(var(--emoji-rotation));
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
};
