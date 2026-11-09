import React from 'react';
import DieIcon from './DieIcon';
import EditableTextarea from './EditableTextarea';
import { StepDie } from '@/lib/validation';
import { X } from 'lucide-react';

interface TraitItemProps {
    die: StepDie;
    onDieChange?: (val: StepDie) => void;
    name: string;
    onNameChange: (val: string) => void;
    placeholder: string;
    isReadOnly?: boolean;
    onTraitClick?: () => void;
    onRemove?: () => void;
}

export default function TraitItem({
    die,
    onDieChange,
    name,
    onNameChange,
    placeholder,
    isReadOnly = false,
    onTraitClick,
    onRemove,
}: TraitItemProps) {
    return (
        <div className="flex items-center group relative">
            <DieIcon
                value={die}
                label={name || placeholder}
                onChange={onDieChange}
                isReadOnly={isReadOnly}
                onTraitClick={onTraitClick}
            />
            <EditableTextarea
                className="font-display text-lg font-semibold text-foreground uppercase ml-2 w-32"
                value={name}
                onChange={onNameChange}
                placeholder={placeholder}
                isReadOnly={isReadOnly}
                onTraitClick={onTraitClick}
            />
            {!isReadOnly && onRemove && (
                <button
                    type="button"
                    aria-label={`Remove ${name || placeholder}`}
                    className="ml-1 p-1 text-hitch-text hover:bg-hitch-crimson/20 rounded-sm no-print"
                    onClick={onRemove}
                ><X size={16} aria-hidden="true" /></button>
            )}
        </div>
    );
}
