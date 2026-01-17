import React from 'react';

interface FloatingShapesProps {
    count?: number;
    colors?: string[];
}

export const FloatingShapes: React.FC<FloatingShapesProps> = ({
    count = 8,
    colors = ['#7C3AED', '#F59E0B', '#10B981', '#3B82F6', '#EC4899']
}) => {
    const shapes = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 60 + 40,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
        rotation: Math.random() * 360
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {shapes.map((shape) => {
                const shapeStyle: React.CSSProperties = {
                    position: 'absolute',
                    left: `${shape.left}%`,
                    top: `${shape.top}%`,
                    width: `${shape.size}px`,
                    height: `${shape.size}px`,
                    opacity: 0.08,
                    animation: `float-slow ${shape.duration}s ease-in-out infinite`,
                    animationDelay: `${shape.delay}s`,
                    transform: `rotate(${shape.rotation}deg)`
                };

                if (shape.shape === 'circle') {
                    return (
                        <div
                            key={shape.id}
                            style={{
                                ...shapeStyle,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${shape.color}, ${adjustColor(shape.color, -20)})`
                            }}
                        />
                    );
                } else if (shape.shape === 'square') {
                    return (
                        <div
                            key={shape.id}
                            style={{
                                ...shapeStyle,
                                borderRadius: '20%',
                                background: `linear-gradient(135deg, ${shape.color}, ${adjustColor(shape.color, -20)})`
                            }}
                        />
                    );
                } else {
                    // Triangle
                    return (
                        <div
                            key={shape.id}
                            style={{
                                ...shapeStyle,
                                width: 0,
                                height: 0,
                                borderLeft: `${shape.size / 2}px solid transparent`,
                                borderRight: `${shape.size / 2}px solid transparent`,
                                borderBottom: `${shape.size}px solid ${shape.color}`
                            }}
                        />
                    );
                }
            })}
        </div>
    );
};

// Helper function to darken/lighten color
function adjustColor(color: string, amount: number): string {
    // Simple color adjustment for hex colors
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
