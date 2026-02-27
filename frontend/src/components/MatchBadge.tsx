import React from 'react';

interface MatchBadgeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
}

const MatchBadge: React.FC<MatchBadgeProps> = ({ score, size = 'md' }) => {
    let color = 'var(--error)';
    let bg = 'rgba(239, 68, 68, 0.1)';

    if (score >= 80) {
        color = 'var(--accent)';
        bg = 'rgba(16, 185, 129, 0.1)';
    } else if (score >= 50) {
        color = '#f59e0b';
        bg = 'rgba(245, 158, 11, 0.1)';
    }

    const sizes = {
        sm: { padding: '2px 8px', fontSize: '0.75rem' },
        md: { padding: '4px 12px', fontSize: '0.875rem' },
        lg: { padding: '8px 16px', fontSize: '1.25rem' }
    };

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2rem',
            fontWeight: 700,
            color,
            backgroundColor: bg,
            border: `1px solid ${color}33`,
            ...sizes[size]
        }}>
            {score}% Match
        </div>
    );
};

export default MatchBadge;
