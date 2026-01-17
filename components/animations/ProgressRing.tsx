import React from 'react';

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showPercentage?: boolean;
    children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 120,
    strokeWidth = 10,
    color = '#7C3AED',
    backgroundColor = '#E0E7FF',
    showPercentage = false,
    children
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    // Color changes based on progress
    const getColor = () => {
        if (progress >= 70) return '#10B981'; // Green
        if (progress >= 40) return '#F59E0B'; // Orange
        if (progress >= 20) return color; // Default
        return '#EF4444'; // Red
    };

    const strokeColor = getColor();

    return (
        <div
            className="relative inline-flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease'
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
                {showPercentage ? (
                    <span
                        className="font-bold"
                        style={{
                            fontSize: size * 0.2,
                            color: strokeColor
                        }}
                    >
                        {Math.round(progress)}%
                    </span>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};
