import React from 'react';

interface SkillIconProps {
    name: string;
    className?: string;
}

const SkillIcon: React.FC<SkillIconProps> = ({ name, className = "w-6 h-6" }) => {
    const skill = name.toLowerCase().trim();

    // Mapping specific names to devicon slugs
    const mapping: Record<string, string> = {
        'js': 'javascript',
        'javascript': 'javascript',
        'typescript': 'typescript',
        'ts': 'typescript',
        'react': 'react',
        'reactjs': 'react',
        'node': 'nodejs',
        'node.js': 'nodejs',
        'nodejs': 'nodejs',
        'express': 'express',
        'mongodb': 'mongodb',
        'mongo': 'mongodb',
        'python': 'python',
        'java': 'java',
        'c++': 'cplusplus',
        'cpp': 'cplusplus',
        'c#': 'csharp',
        'csharp': 'csharp',
        'html': 'html5',
        'css': 'css3',
        'sql': 'mysql',
        'mysql': 'mysql',
        'postgresql': 'postgresql',
        'aws': 'amazonwebservices',
        'docker': 'docker',
        'git': 'git',
        'github': 'github',
        'linux': 'linux',
        'flutter': 'flutter',
        'firebase': 'firebase',
        'bootstrap': 'bootstrap',
        'tailwind': 'tailwindcss',
        'nextjs': 'nextjs',
        'next.js': 'nextjs',
        'redux': 'redux',
        'graphql': 'graphql',
        'django': 'django',
        'flask': 'flask',
        'spring': 'spring',
        'kotlin': 'kotlin',
        'swift': 'swift',
        'dart': 'dart',
        'figma': 'figma'
    };

    const slug = mapping[skill] || null;

    if (!slug) {
        return (
            <div className={`${className} bg-primary-500/20 rounded flex items-center justify-center text-[10px] font-bold text-primary-400`}>
                {name.slice(0, 2).toUpperCase()}
            </div>
        );
    }

    // Use the devicon CDN
    // We prefer the original-wordmark or plain version
    const iconUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;

    return (
        <img
            src={iconUrl}
            alt={name}
            className={className}
            onError={(e) => {
                // Fallback to text if image fails
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="${className} bg-primary-500/20 rounded flex items-center justify-center text-[10px] font-bold text-primary-400">${name.slice(0, 2).toUpperCase()}</div>`;
            }}
        />
    );
};

export default SkillIcon;
