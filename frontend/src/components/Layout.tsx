import React from 'react';
import AnimatedBackground from './AnimatedBackground';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="relative min-h-screen selection:bg-primary-500/30 selection:text-white">
            <AnimatedBackground />
            <main className="relative z-10 w-full pt-28 pb-12">
                {children}
            </main>
        </div>
    );
};

export default Layout;
