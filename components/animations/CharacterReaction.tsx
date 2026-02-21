import React from 'react';

interface CharacterReactionProps {
    mood: 'happy' | 'thinking' | 'excited' | 'sad' | 'motivated';
    message?: string;
    show: boolean;
}

export const CharacterReaction: React.FC<CharacterReactionProps> = ({ mood, message, show }) => {
    if (!show) return null;

    const reactions = {
        happy: {
            face: '😊',
            color: 'from-green-400 to-emerald-500',
            messages: ['Great job!', 'You got it!', 'Awesome!', 'Well done!']
        },
        thinking: {
            face: '🤔',
            color: 'from-sky-400 to-cyan-500',
            messages: ['Hmm...', 'Think carefully!', 'You can do it!']
        },
        excited: {
            face: '🤩',
            color: 'from-yellow-400 to-orange-500',
            messages: ['WOW!', 'AMAZING!', 'INCREDIBLE!', 'SUPERSTAR!']
        },
        sad: {
            face: '😢',
            color: 'from-purple-400 to-pink-500',
            messages: ["It's okay!", 'Try again!', "Don't give up!", 'You got this!']
        },
        motivated: {
            face: '💪',
            color: 'from-red-400 to-pink-500',
            messages: ['Keep going!', "You're doing great!", 'Almost there!']
        }
    };

    const reaction = reactions[mood];
    const displayMessage = message || reaction.messages[Math.floor(Math.random() * reaction.messages.length)];

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-in-right">
            <div className={`bg-gradient-to-r ${reaction.color} p-6 rounded-3xl shadow-2xl transform hover:scale-110 transition-transform`}>
                <div className="flex items-center gap-4">
                    <div className="text-6xl animate-bounce-gentle">
                        {reaction.face}
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl relative">
                        <div className="text-xl font-black text-gray-800">
                            {displayMessage}
                        </div>
                        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

