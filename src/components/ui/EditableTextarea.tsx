import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EditableTextareaProps {
    value: string;
    onChange?: (val: string) => void;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    rows?: number;
    isReadOnly?: boolean;
    onTraitClick?: () => void;
}

export default function EditableTextarea({ 
    value, 
    onChange, 
    className = '', 
    style,
    placeholder = '', 
    rows = 1,
    isReadOnly = false,
    onTraitClick
}: EditableTextareaProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            autoResize();
        }
    }, [isEditing]);

    const autoResize = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (tempValue !== value && onChange) {
            onChange(tempValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && rows === 1) {
            handleBlur();
        }
        if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    };

    if (isReadOnly) {
        return (
            <div 
                className={cn(
                    "playable-trait select-none touch-manipulation p-1 rounded-sm",
                    className
                )}
                style={style}
                onClick={onTraitClick}
            >
                {value || placeholder}
            </div>
        );
    }

    if (isEditing) {
        return (
            <textarea
                ref={textareaRef}
                className={cn(
                    "bg-obsidian-950 text-foreground border-b border-solid border-primary w-full p-0 m-0 block resize-none overflow-hidden",
                    className
                )}
                style={style}
                rows={rows}
                value={tempValue}
                onChange={(e) => {
                    setTempValue(e.target.value);
                    autoResize();
                }}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        );
    }

    return (
        <div 
            role="button"
            tabIndex={0}
            aria-label={`Edit ${value || placeholder}`}
            className={cn(
                "mhr-edit-view p-0 m-0 min-h-6",
                className
            )}
            style={style}
            onClick={() => setIsEditing(true)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsEditing(true);
                }
            }}
        >
            {value || <span className="text-muted-foreground italic">{placeholder}</span>}
        </div>
    );
}
