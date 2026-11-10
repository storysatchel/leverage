import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DieIcon from './DieIcon';
import TraitItem from './TraitItem';

describe('DieIcon', () => {
    it('renders correctly with given value', () => {
        render(<DieIcon value="8" onChange={vi.fn()} />);
        expect(screen.getByText('d8')).toBeInTheDocument();
    });

    it('defaults to d8 if value is empty or invalid when cycling', () => {
        const onChange = vi.fn();
        const { container, rerender } = render(<DieIcon value="" onChange={onChange} />);

        fireEvent.click(container.firstChild as HTMLElement);
        expect(onChange).toHaveBeenCalledWith('10'); // Because default is index 2 ('8'), next is index 3 ('10')

        onChange.mockClear();
        rerender(<DieIcon value="invalid" onChange={onChange} />);
        fireEvent.click(container.firstChild as HTMLElement);
        expect(onChange).toHaveBeenCalledWith('10');
    });

    it('renders different die types', () => {
        const { rerender } = render(<DieIcon value="4" onChange={vi.fn()} />);
        expect(screen.getByText('d4')).toBeInTheDocument();

        rerender(<DieIcon value="6" onChange={vi.fn()} />);
        expect(screen.getByText('d6')).toBeInTheDocument();

        rerender(<DieIcon value="10" onChange={vi.fn()} />);
        expect(screen.getByText('d10')).toBeInTheDocument();

        rerender(<DieIcon value="12" onChange={vi.fn()} />);
        expect(screen.getByText('d12')).toBeInTheDocument();
    });

    it('calls onChange when clicked', () => {
        const onChange = vi.fn();
        render(<DieIcon value="8" onChange={onChange} />);

        fireEvent.click(screen.getByText('d8').closest('div') as HTMLElement);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onTraitClick when clicked in read-only mode', () => {
        const onTraitClick = vi.fn();
        const onChange = vi.fn();
        render(<DieIcon value="10" isReadOnly={true} onTraitClick={onTraitClick} onChange={onChange} />);

        fireEvent.click(screen.getByText('d10').closest('div') as HTMLElement);
        
        expect(onTraitClick).toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('bounces on tap and cannot be text-selected', () => {
        const animate = vi.fn();
        HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate'];
        render(<DieIcon value="10" isReadOnly onTraitClick={vi.fn()} />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('select-none');
        fireEvent.click(button);
        expect(animate).toHaveBeenCalledTimes(1);
        // @ts-expect-error cleanup of the jsdom stub
        delete HTMLElement.prototype.animate;
    });

    it('bounces the die when a trait name is tapped in play mode', () => {
        const animate = vi.fn();
        HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate'];
        const onTraitClick = vi.fn();
        render(<TraitItem die="8" name="Lockpicking" onNameChange={vi.fn()} placeholder="Trait" isReadOnly onTraitClick={onTraitClick} />);
        const name = screen.getByText('Lockpicking');
        expect(name).toHaveClass('select-none');
        fireEvent.click(name);
        expect(onTraitClick).toHaveBeenCalledTimes(1);
        expect(animate).toHaveBeenCalledTimes(1);
        // @ts-expect-error cleanup of the jsdom stub
        delete HTMLElement.prototype.animate;
    });
});
