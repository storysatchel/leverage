import React from 'react';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
    mode: 'edit' | 'play';
    onChange: (mode: 'edit' | 'play') => void;
    className?: string;
}

export default function ModeSelector({ mode, onChange, className }: ModeSelectorProps) {
    const isPlay = mode === 'play';

    return (
        <div className={cn("flex items-center gap-3 bg-obsidian-950 p-2 border border-border rounded-sm", className)}>
            <Badge
                variant="outline"
                className={cn(
                    "font-mono text-xs px-3 py-1 uppercase",
                    !isPlay ? "bg-plot-brass text-obsidian-950 border-plot-brass" : "text-ink-muted border-border"
                )}
            >
                EDITING
            </Badge>

            <Switch
                aria-label="Play mode"
                checked={isPlay}
                onCheckedChange={(checked) => onChange(checked ? 'play' : 'edit')}
            />

            <Badge
                variant="outline"
                className={cn(
                    "font-mono text-xs px-3 py-1 uppercase",
                    isPlay ? "bg-leverage-cyan text-obsidian-950 border-leverage-cyan" : "text-ink-muted border-border"
                )}
            >
                PLAYING
            </Badge>
        </div>
    );
}
