import React, { useRef, useState } from 'react';
import { DieShape } from './DieShape';
import { bounceElement } from '@/lib/bounce';

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
 *
 * Hold-to-remove only *marks* the die while the finger is down and keeps its slot;
 * the removal happens on release. Removing it mid-hold would slide the next die under
 * the finger, which would then receive the tap.
 */
export const InteractiveDie: React.FC<InteractiveDieProps> = ({ type, categoryId, dieIndex, onCycle, onRemove }) => {
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isPressed = useRef(false);
    const isCancelled = useRef(false);
    const [pendingRemoval, setPendingRemoval] = useState(false);
    const pendingRef = useRef(false);

    const setPending = (value: boolean) => {
        pendingRef.current = value;
        setPendingRemoval(value);
    };

    const startPress = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent category click
        isPressed.current = true;
        isCancelled.current = false;
        setPending(false);
        pressTimer.current = setTimeout(() => {
            if (isCancelled.current) return;
            setPending(true); // marked for removal; slot stays until the pointer is lifted
            if (navigator.vibrate) navigator.vibrate(15);
        }, 500); // 500ms long press to delete
    };

    const endPress = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (pressTimer.current) clearTimeout(pressTimer.current);

        // A pointer-up that did not start here (e.g. a neighbour slid under the finger) does nothing.
        if (!isPressed.current) return;
        isPressed.current = false;

        if (pendingRef.current) {
            setPending(false);
            onRemove(categoryId, dieIndex);
        } else if (!isCancelled.current) {
            // If it wasn't a long press and wasn't cancelled, it's a standard tap to cycle
            bounceElement(e.currentTarget);
            onCycle(categoryId, dieIndex);
        }
    };

    const cancelPress = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        isCancelled.current = true;
        isPressed.current = false;
        setPending(false);
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
            data-pending-removal={pendingRemoval ? 'true' : undefined}
            className={`rounded-md text-leverage-cyan touch-manipulation select-none transition-[opacity,transform] duration-150 ${pendingRemoval ? 'scale-90 opacity-40' : ''}`}
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
