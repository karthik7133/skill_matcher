import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
    const [mounted, setMounted] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-950">
            {/* Base Mesh Gradient Layer */}
            <div className="mesh-gradient absolute inset-0 opacity-60" />

            {/* Interactive Mouse Glow */}
            <motion.div
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                className="absolute w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[100px]"
            />

            {/* Floating Blobs with Complex Movement */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -100, 50, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[10%] left-[10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"
                />

                <motion.div
                    animate={{
                        x: [0, -150, 100, 0],
                        y: [0, 150, -100, 0],
                        scale: [1, 0.8, 1.1, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[140px]"
                />

                <motion.div
                    animate={{
                        x: [0, 200, -200, 0],
                        y: [0, -50, 150, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[40%] right-[30%] w-[25rem] h-[25rem] bg-indigo-500/10 rounded-full blur-[100px]"
                />

                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary-500/5 rounded-full blur-[150px]"
                />
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

export default AnimatedBackground;
