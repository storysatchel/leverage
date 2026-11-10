import React, { useRef } from 'react';
import { DieShape } from './DieShape';

interface InteractiveDieProps {
    type: number;
    categoryId: string;
    dieIndex: number;
    onCycle: (categoryId: string, dieIndex: number) => void;
    onRemove: (categoryId: string, dieIndex: number) => void;
}

/**
 * A pool die as a real button. Pointer: tap cycles size, press-and-hold removes.
 * Keyboard: Enter/Space cycles size, Delete/Backspace removes.
 */
export const InteractiveDie: React.FC<InteractiveDieProps> = ({ type, categoryId, dieIndex, onCycle, onRemove }) => {
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = useRef(false);
    const isCancelled = useRef(false);

    const startPress = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent category click
        isLongPress.current = false;
        isCancelled.current = false;
        pressTimer.current = setTimeout(() => {
            if (isCancelled.current) return;
            isLongPress.current = true;
            onRemove(categoryId, dieIndex);
        }, 500); // 500ms long press to delete
    };

    const endPress = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (pressTimer.current) clearTimeout(pressTimer.current);

        // If it wasn't a long press and wasn't cancelled, it's a standard tap to cycle
        if (!isLongPress.current && !isCancelled.current) {
            onCycle(categoryId, dieIndex);
        }
    };

    const cancelPress = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        isCancelled.current = true;
        if (pressTimer.current) clearTimeout(pressTimer.current);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCycle(categoryId, dieIndex);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            onRemove(categoryId, dieIndex);
        }
    };

    return (
        <button
            type="button"
            aria-label={`d${type} die. Enter cycles size, Delete removes`}
            className="rounded-md text-leverage-cyan touch-manipulation"
            onPointerDown={startPress}
            onPointerUp={endPress}
            onPointerLeave={cancelPress}
            onKeyDown={onKeyDown}
            onContextMenu={(e) => { e.preventDefault(); return false; }} // Prevent native context menu on long press
        >
            <DieShape type={type} />
        </button>
    );
};
