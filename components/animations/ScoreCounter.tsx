import React, { useEffect, useState, useRef } from 'react';

interface ScoreCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

export const ScoreCounter: React.FC<ScoreCounterProps> = ({
    value,
    duration = 1500,
    className = '',
    prefix = '',
    suffix = '',
    decimals = 0
}) => {
    const [count, setCount] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        startTimeRef.current = null;

        const animate = (currentTime: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = currentTime;
            }

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const current = Math.floor(easeOut * value);
            setCount(current);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(value); // Ensure we end at exact value
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [value, duration]);

    const displayValue = decimals > 0 ? count.toFixed(decimals) : count;

    return (
        <span className={className}>
            {prefix}
            {displayValue}
            {suffix}
        </span>
    );
};
