import React from 'react';
import { DieShape } from '../assembler/DieShape';

interface BaseDieProps {
    /** Optional CSS colour for the die (sets currentColor). */
    fill?: string;
    size?: string;
    showLabel?: boolean;
    className?: string;
}

export const D4: React.FC<BaseDieProps> = (props) => <DieShape type={4} {...props} />;
export const D6: React.FC<BaseDieProps> = (props) => <DieShape type={6} {...props} />;
export const D8: React.FC<BaseDieProps> = (props) => <DieShape type={8} {...props} />;
export const D10: React.FC<BaseDieProps> = (props) => <DieShape type={10} {...props} />;
export const D12: React.FC<BaseDieProps> = (props) => <DieShape type={12} {...props} />;

export const Die = ({ type, ...props }: { type: number | string } & BaseDieProps) => {
    const numericType = typeof type === 'string' ? parseInt(type) : type;
    switch (numericType) {
        case 4: return <D4 {...props} />;
        case 6: return <D6 {...props} />;
        case 8: return <D8 {...props} />;
        case 10: return <D10 {...props} />;
        case 12: return <D12 {...props} />;
        default: return null;
    }
};
