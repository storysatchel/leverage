import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InteractiveDie } from './InteractiveDie';

describe('InteractiveDie', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the correct die type', () => {
        render(
            <InteractiveDie
                type={6}
                categoryId="test-category"
                dieIndex={0}
                onCycle={vi.fn()}
                onRemove={vi.fn()}
            />
        );
        expect(screen.getByText('d6')).toBeInTheDocument();
    });

    it('calls onCycle when tapped (pointer down and up quickly)', () => {
        const onCycle = vi.fn();
        const onRemove = vi.fn();

        render(
            <InteractiveDie
                type={8}
                categoryId="test-category"
                dieIndex={1}
                onCycle={onCycle}
                onRemove={onRemove}
            />
        );

        const dieContainer = screen.getByText('d8').closest('div')?.parentElement as HTMLElement;
        
        fireEvent.pointerDown(dieContainer);
        fireEvent.pointerUp(dieContainer);

        expect(onCycle).toHaveBeenCalledWith('test-category', 1);
        expect(onRemove).not.toHaveBeenCalled();
    });

    it('keeps the slot until the press is released, then removes without cycling', () => {
        const onCycle = vi.fn();
        const onRemove = vi.fn();

        render(
            <InteractiveDie
                type={10}
                categoryId="test-category"
                dieIndex={2}
                onCycle={onCycle}
                onRemove={onRemove}
            />
        );

        const button = screen.getByRole('button', { name: /d10 die/ });

        fireEvent.pointerDown(button);

        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Held: marked for removal, but nothing has moved yet.
        expect(onRemove).not.toHaveBeenCalled();
        expect(button).toHaveAttribute('data-pending-removal', 'true');

        fireEvent.pointerUp(button);

        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(onRemove).toHaveBeenCalledWith('test-category', 2);
        expect(onCycle).not.toHaveBeenCalled();
    });

    it('cancels the pending removal if the pointer slides off while held', () => {
        const onRemove = vi.fn();
        render(<InteractiveDie type={8} categoryId="c" dieIndex={0} onCycle={vi.fn()} onRemove={onRemove} />);
        const button = screen.getByRole('button', { name: /d8 die/ });
        fireEvent.pointerDown(button);
        act(() => { vi.advanceTimersByTime(500); });
        fireEvent.pointerLeave(button);
        expect(button).not.toHaveAttribute('data-pending-removal');
        fireEvent.pointerUp(button);
        expect(onRemove).not.toHaveBeenCalled();
    });

    it('ignores a pointer-up that did not start on this die (a neighbour sliding under the finger)', () => {
        const onCycle = vi.fn();
        const onRemove = vi.fn();
        render(<InteractiveDie type={6} categoryId="c" dieIndex={0} onCycle={onCycle} onRemove={onRemove} />);
        fireEvent.pointerUp(screen.getByRole('button', { name: /d6 die/ }));
        expect(onCycle).not.toHaveBeenCalled();
        expect(onRemove).not.toHaveBeenCalled();
    });

    it('cancels action when pointer leaves', () => {
        const onCycle = vi.fn();
        const onRemove = vi.fn();

        render(
            <InteractiveDie
                type={4}
                categoryId="test-category"
                dieIndex={3}
                onCycle={onCycle}
                onRemove={onRemove}
            />
        );

        const dieContainer = screen.getByText('d4').closest('div')?.parentElement as HTMLElement;
        
        fireEvent.pointerDown(dieContainer);
        fireEvent.pointerLeave(dieContainer);

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(onRemove).not.toHaveBeenCalled();

        fireEvent.pointerUp(dieContainer);
        expect(onCycle).not.toHaveBeenCalled();
    });

    it('is a button operable from the keyboard: Enter cycles, Delete removes', () => {
        const onCycle = vi.fn();
        const onRemove = vi.fn();
        render(
            <InteractiveDie type={6} categoryId="c" dieIndex={0} onCycle={onCycle} onRemove={onRemove} />
        );
        const button = screen.getByRole('button', { name: /d6 die/ });
        fireEvent.keyDown(button, { key: 'Enter' });
        expect(onCycle).toHaveBeenCalledWith('c', 0);
        fireEvent.keyDown(button, { key: 'Delete' });
        expect(onRemove).toHaveBeenCalledWith('c', 0);
    });
});
