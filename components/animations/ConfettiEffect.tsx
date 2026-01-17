import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
    active: boolean;
    duration?: number;
    particleCount?: number;
    colors?: string[];
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    color: string;
    size: number;
    opacity: number;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
    active,
    duration = 3000,
    particleCount = 50,
    colors = ['#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6']
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            opacity: 1
        }));

        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;

            if (elapsed > duration) {
                // Clean up
                cancelAnimationFrame(animationFrameRef.current!);
                particlesRef.current = [];
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.15; // Gravity
                particle.rotation += particle.rotationSpeed;

                // Fade out in last 500ms
                if (elapsed > duration - 500) {
                    particle.opacity = Math.max(0, 1 - (elapsed - (duration - 500)) / 500);
                }

                // Draw particle
                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.fillStyle = particle.color;

                // Draw confetti shape (rectangle)
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);

                ctx.restore();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [active, duration, particleCount, colors]);

    if (!active) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: '100%', height: '100%' }}
        />
    );
};
