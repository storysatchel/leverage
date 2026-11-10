import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** Terminal-style button. (Name kept from the original comic theme so call sites don't churn.) */
const comicButtonVariants = cva(
    "font-display font-semibold uppercase tracking-wider border transition-colors cursor-pointer inline-flex items-center justify-center gap-2 rounded-sm active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                red: "bg-hitch-deep border-hitch-crimson text-white hover:bg-hitch-crimson",
                blue: "bg-leverage-deep border-leverage-cyan text-white hover:bg-leverage-cyan hover:text-obsidian-950",
                green: "bg-emerald-800 border-emerald-500 text-white hover:bg-emerald-600",
                white: "bg-gunmetal-700 border-border-hover text-foreground hover:bg-gunmetal-600",
                cyan: "bg-obsidian-950 border-leverage-neon text-leverage-neon hover:bg-leverage-neon hover:text-obsidian-950",
                gold: "bg-obsidian-950 border-plot-gold text-plot-gold hover:bg-plot-gold hover:text-obsidian-950",
            },
            size: {
                xs: "text-xs py-1 px-3",
                md: "text-base px-5 py-2",
                lg: "text-lg px-6 py-2",
            }
        },
        defaultVariants: {
            variant: "white",
            size: "md",
        }
    }
);

export interface ComicButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof comicButtonVariants> { }

export const ComicButton: React.FC<ComicButtonProps> = ({
    className,
    variant,
    size,
    type = 'button',
    ...props
}) => {
    return (
        <button
            type={type}
            className={cn(comicButtonVariants({ variant, size, className }))}
            {...props}
        />
    );
};
