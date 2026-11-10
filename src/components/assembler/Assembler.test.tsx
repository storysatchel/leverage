import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Assembler } from './Assembler';
import { PoolDie } from '../../App';
import { BASE_CATEGORIES, TRAIT_CATEGORIES } from './constants';

const mockCategories = [
    ...BASE_CATEGORIES,
    { id: 'ps-0', title: 'POWER SET 1', sub: '', bg: '#f58a52', textColor: 'text-black' },
    ...TRAIT_CATEGORIES
];

const TestWrapper = ({ onToast }: { onToast?: (msg: string) => void }) => {
    const [pool, setPool] = useState<Record<string, PoolDie[]>>({
        role: [], dist: [], 'ps-0': [], spec: [],
        stress: [], comp: [], asset: [], push: [], sfx: []
    });
    return <Assembler pool={pool} setPool={setPool} categories={mockCategories} onToast={onToast} />;
};

describe('Assembler', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders all categories', () => {
        render(<TestWrapper />);
        expect(screen.getByText('ROLE')).toBeInTheDocument();
        expect(screen.getByText('DISTINCTION')).toBeInTheDocument();
        expect(screen.getByText('POWER SET 1')).toBeInTheDocument();
    });

    it('adds a d6 when a category is clicked', () => {
        render(<TestWrapper />);
        const categoryPanel = screen.getByText('ROLE').closest('.comic-panel') as HTMLElement;
        
        // Ensure no dice initially
        expect(screen.queryByText('d6')).not.toBeInTheDocument();

        fireEvent.click(categoryPanel);

        // A d6 should appear
        const d6Elements = screen.getAllByText('d6');
        expect(d6Elements.length).toBeGreaterThan(0);
    });

    it('cycles a die when tapped', () => {
        render(<TestWrapper />);
        const categoryPanel = screen.getByText('ROLE').closest('.comic-panel') as HTMLElement;
        
        // Add die
        fireEvent.click(categoryPanel);
        
        // Find the d6 container and click it
        const d6Element = screen.getByText('d6').closest('div')?.parentElement as HTMLElement;
        
        fireEvent.pointerDown(d6Element);
        fireEvent.pointerUp(d6Element);

        // Should cycle to d8
        expect(screen.queryByText('d6')).not.toBeInTheDocument();
        expect(screen.getByText('d8')).toBeInTheDocument();
    });

    it('removes a die when long pressed, keeping its slot until release', () => {
        const onToast = vi.fn();
        render(<TestWrapper onToast={onToast} />);
        const categoryPanel = screen.getByText('ROLE').closest('.comic-panel') as HTMLElement;
        
        // Add two dice so a neighbour would slide into the slot
        fireEvent.click(categoryPanel);
        fireEvent.click(categoryPanel);
        expect(screen.getAllByText('d6')).toHaveLength(2);
        
        const [first] = screen.getAllByRole('button', { name: /d6 die/ });
        
        fireEvent.pointerDown(first);
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Still both there while the finger is down
        expect(screen.getAllByText('d6')).toHaveLength(2);
        expect(onToast).not.toHaveBeenCalled();

        fireEvent.pointerUp(first);

        // Removed on lift
        expect(screen.getAllByText('d6')).toHaveLength(1);
        
        // Should trigger toast
        expect(onToast).toHaveBeenCalledWith('Die removed');
    });

    it('does not add a d6 from the click that follows removing a die', () => {
        render(<TestWrapper />);
        const categoryPanel = screen.getByText('ROLE').closest('.comic-panel') as HTMLElement;
        fireEvent.click(categoryPanel);
        const [die] = screen.getAllByRole('button', { name: /d6 die/ });
        fireEvent.pointerDown(die);
        act(() => { vi.advanceTimersByTime(500); });
        fireEvent.pointerUp(die);
        expect(screen.queryByText('d6')).not.toBeInTheDocument();
        // the browser's synthesized click lands on the panel after the die is gone
        fireEvent.click(categoryPanel);
        expect(screen.queryByText('d6')).not.toBeInTheDocument();
    });

    it('clears all dice when clear button is clicked', () => {
        const onToast = vi.fn();
        render(<TestWrapper onToast={onToast} />);
        const categoryPanel = screen.getByText('ROLE').closest('.comic-panel') as HTMLElement;
        
        // Add die
        fireEvent.click(categoryPanel);
        expect(screen.getByText('d6')).toBeInTheDocument();
        
        const clearButton = screen.getByText('CLEAR POOL');
        fireEvent.click(clearButton);

        // Should be removed
        expect(screen.queryByText('d6')).not.toBeInTheDocument();
        expect(onToast).toHaveBeenCalledWith('Pool cleared');
    });

    it('renders labeled dice correctly', () => {
        const poolWithLabels = {
            role: [{ id: '1', value: 8, label: 'Buddy' }],
            dist: [], 'ps-0': [], spec: [], 
            stress: [], comp: [], asset: [], push: [], sfx: []
        };
        const setPool = vi.fn();
        render(<Assembler pool={poolWithLabels} setPool={setPool} categories={mockCategories} />);
        
        expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    it('does not let the pool panels be text-selected', () => {
        render(<TestWrapper />);
        const panel = screen.getByText('ROLE').closest('.comic-panel') as HTMLElement;
        expect(panel.parentElement).toHaveClass('select-none');
    });

    it('rolls the selected dice and displays their individual results', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const pool = { role: [{ id: '1', value: 8, label: 'Solo' }], spec: [{ id: '2', value: 6, label: 'Expert' }] };
        render(<Assembler pool={pool} setPool={vi.fn()} categories={mockCategories} />);
        fireEvent.click(screen.getByRole('button', { name: 'ROLL POOL' }));
        expect(screen.getByText('Solo: d8 = 5')).toBeInTheDocument();
        expect(screen.getByText('Expert: d6 = 4')).toBeInTheDocument();
        expect(screen.getByTestId('leverage-total')).toHaveTextContent('TOTAL: 9');
    });

    it('copies the roll command to clipboard', async () => {
        vi.useRealTimers();
        const pool = {
            role: [{ id: '1', value: 8, label: 'Solo' }],
            dist: [], 'ps-0': [], spec: [], 
            stress: [], comp: [], asset: [], push: [], sfx: []
        };
        const setPool = vi.fn();
        const onToast = vi.fn();
        
        // Mock clipboard
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });

        render(<Assembler pool={pool} setPool={setPool} categories={mockCategories} onToast={onToast} />);
        
        const copyButton = screen.getByText('COPY COMMAND');
        await act(async () => {
            fireEvent.click(copyButton);
        });

        expect(writeTextMock).toHaveBeenCalledWith('/roll dice:d8 Solo');
        
        // Should trigger success toast
        expect(onToast).toHaveBeenCalledWith('Command copied!');
        vi.useFakeTimers();
    });
});
