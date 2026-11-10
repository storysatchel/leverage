import React from 'react';
import { Die } from './Dice';
import { cn } from '@/lib/utils';
import { StepDie } from '@/lib/validation';
import { bounceElement } from '@/lib/bounce';

const diceTypes: StepDie[] = ['4', '6', '8', '10', '12'];

interface DieIconProps {
    value: StepDie | string;
    onChange?: (val: StepDie) => void;
    className?: string;
    size?: string;
    isReadOnly?: boolean;
    onTraitClick?: () => void;
    /** Accessible name for the button, e.g. the trait name. */
    label?: string;
}

/**
 * A die that is a real button: in edit mode it cycles the die size,
 * in play mode it adds the trait's die to the pool.
 */
export default function DieIcon({
    value,
    onChange,
    className = '',
    size = "w-14 h-14",
    isReadOnly = false,
    onTraitClick,
    label,
}: DieIconProps) {
    const cycleDie = (e: React.MouseEvent<HTMLButtonElement>) => {
        bounceElement(e.currentTarget);
        if (isReadOnly) {
            if (onTraitClick) onTraitClick();
            return;
        }
        let currentIndex = diceTypes.indexOf(value as StepDie);
        if (currentIndex === -1) currentIndex = 2; // Default to '8'
        const nextIndex = (currentIndex + 1) % diceTypes.length;
        if (onChange) onChange(diceTypes[nextIndex]);
    };

    const action = isReadOnly ? 'add to pool' : 'change die size';
    return (
        <button
            type="button"
            data-die-button=""
            aria-label={`${label ? `${label}, ` : ''}d${value}: ${action}`}
            className={cn(
                "print-keep select-none touch-manipulation rounded-full text-leverage-cyan",
                isReadOnly ? "playable-trait" : "cursor-pointer",
                className
            )}
            onClick={cycleDie}
        >
            <Die type={value} size={size} />
        </button>
    );
}
