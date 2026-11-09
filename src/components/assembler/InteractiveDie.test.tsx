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

    it('calls onRemove when long pressed', () => {
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

        const dieContainer = screen.getByText('d10').closest('div')?.parentElement as HTMLElement;
        
        fireEvent.pointerDown(dieContainer);

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(onRemove).toHaveBeenCalledWith('test-category', 2);

        fireEvent.pointerUp(dieContainer);

        expect(onCycle).not.toHaveBeenCalled();
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
