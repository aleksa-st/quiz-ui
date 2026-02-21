import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { Brain, Trophy, Timer, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';

interface Card {
    id: number;
    emoji: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface PuzzleGameProps {
    difficulty: 'easy' | 'medium' | 'hard';
    onClose: () => void;
    onComplete: (points: number, xp: number) => void;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ difficulty, onClose, onComplete }) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const emojis = ['🎮', '🧩', '🚀', '🧠', '🌟', '🎨', '📚', '🧪', '🧬', '🔭', '🌍', '⚡', '🔥', '💎', '🏆', '🌈', '🍕', '🍦'];

    const initGame = useCallback(() => {
        let pairCount = 8;
        if (difficulty === 'medium') pairCount = 18;
        if (difficulty === 'hard') pairCount = 32;

        const selectedEmojis = emojis.slice(0, pairCount);
        const gameCards: Card[] = [...selectedEmojis, ...selectedEmojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                emoji,
                isFlipped: false,
                isMatched: false,
            }));

        setCards(gameCards);
        setFlippedCards([]);
        setMoves(0);
        setTime(0);
        setIsGameOver(false);
        setIsProcessing(false);
    }, [difficulty]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!isGameOver && cards.length > 0) {
            timer = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isGameOver, cards.length]);

    const handleCardClick = (id: number) => {
        if (isProcessing || isGameOver) return;
        const card = cards.find(c => c.id === id);
        if (!card || card.isFlipped || card.isMatched || flippedCards.includes(id)) return;

        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setIsProcessing(true);
            setMoves(prev => prev + 1);

            const [id1, id2] = newFlipped;
            const card1 = cards.find(c => c.id === id1)!;
            const card2 = cards.find(c => c.id === id2)!;

            if (card1.emoji === card2.emoji) {
                // Match found
                setCards(prev => prev.map(c =>
                    (c.id === id1 || c.id === id2) ? { ...c, isMatched: true } : c
                ));
                setFlippedCards([]);
                setIsProcessing(false);

                // Check for win
                const allMatched = cards.every(c =>
                    (c.id === id1 || c.id === id2) ? true : c.isMatched
                );
                if (allMatched) {
                    handleWin();
                }
            } else {
                // No match
                setTimeout(() => {
                    setFlippedCards([]);
                    setIsProcessing(false);
                }, 1000);
            }
        }
    };

    const handleWin = async () => {
        setIsGameOver(true);
        try {
            const res = await api.puzzle.complete({
                difficulty,
                moves: moves + 1,
                time_taken: time
            });
            if (res.success) {
                onComplete(res.data.points_awarded, res.data.xp_awarded);
            }
        } catch (err) {
            console.error("Failed to submit puzzle results", err);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const gridCols = difficulty === 'hard' ? 'grid-cols-8' : difficulty === 'medium' ? 'grid-cols-6' : 'grid-cols-4';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-lavender-200">
                <div className="bg-gradient-to-r from-lavender-500 to-skysky-500 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <Brain className="h-8 w-8" />
                        <h2 className="text-2xl font-black uppercase tracking-tight">Memory Match: {difficulty}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex justify-center gap-12 mb-8 bg-lavender-50 p-4 rounded-2xl border-2 border-lavender-100">
                        <div className="text-center">
                            <div className="text-slate-400 text-xs font-black uppercase mb-1">Moves</div>
                            <div className="text-3xl font-black text-lavender-600">{moves}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-slate-400 text-xs font-black uppercase mb-1">Time</div>
                            <div className="text-3xl font-black text-skysky-600 flex items-center gap-2">
                                <Timer className="h-6 w-6" />
                                {formatTime(time)}
                            </div>
                        </div>
                    </div>

                    <div className={`grid ${gridCols} gap-3 max-h-[60vh] overflow-y-auto p-2`}>
                        {cards.map(card => (
                            <div
                                key={card.id}
                                onClick={() => handleCardClick(card.id)}
                                className={`
                  aspect-square rounded-xl cursor-pointer transition-all duration-300 transform
                  flex items-center justify-center text-3xl md:text-4xl
                  ${card.isMatched
                                        ? 'bg-green-100 opacity-50 scale-95'
                                        : (card.isFlipped || flippedCards.includes(card.id))
                                            ? 'bg-white border-4 border-lavender-400 rotate-y-180'
                                            : 'bg-lavender-500 hover:bg-lavender-600 border-b-4 border-lavender-700 active:translate-y-1 active:border-b-0'
                                    }
                `}
                            >
                                {(card.isMatched || card.isFlipped || flippedCards.includes(card.id)) ? card.emoji : '?'}
                            </div>
                        ))}
                    </div>

                    {isGameOver && (
                        <div className="mt-8 text-center animate-bounce">
                            <div className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-slate-900 rounded-full font-black text-xl shadow-lg">
                                <Trophy className="h-6 w-6" />
                                YOU WON!
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-center gap-4">
                        <Button variant="outline" onClick={initGame} icon={RefreshCw}>
                            Restart
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

