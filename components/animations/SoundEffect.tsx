import React from 'react';

interface SoundEffectProps {
    type: 'correct' | 'wrong' | 'perfect' | 'timeout' | 'click';
    show: boolean;
}

export const SoundEffect: React.FC<SoundEffectProps> = ({ type, show }) => {
    if (!show) return null;

    const effects = {
        correct: { emoji: '🔊', text: 'DING!', color: 'text-green-500', bg: 'bg-green-100' },
        wrong: { emoji: '🔔', text: 'OOP!', color: 'text-orange-500', bg: 'bg-orange-100' },
        perfect: { emoji: '🎺', text: 'AMAZING!', color: 'text-yellow-500', bg: 'bg-yellow-100' },
        timeout: { emoji: '⏰', text: 'BEEP!', color: 'text-red-500', bg: 'bg-red-100' },
        click: { emoji: '💥', text: 'POP!', color: 'text-purple-500', bg: 'bg-purple-100' }
    };

    const effect = effects[type];

    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className={`${effect.bg} ${effect.color} px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-in`}>
                <span className="text-3xl animate-wiggle">{effect.emoji}</span>
                <span className="text-2xl font-black">{effect.text}</span>
            </div>
        </div>
    );
};
