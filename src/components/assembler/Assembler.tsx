import React, { useState } from 'react';
import { DIE_SEQUENCE, Category } from './constants';
import { InteractiveDie } from './InteractiveDie';
import { PoolDie } from '../../App';
import { ComicButton } from '../ui/ComicButton';
import { generateRollCommand } from '../../lib/cortexPal';
import { leverageTotal } from '../../lib/leverage';
import { RollResultPanel, type RolledDie } from './RollResultPanel';

interface AssemblerProps {
    pool: Record<string, PoolDie[]>;
    setPool: React.Dispatch<React.SetStateAction<Record<string, PoolDie[]>>>;
    categories: Category[];
    onToast?: (message: string) => void;
    /** Plot Points available to spend on including extra dice. */
    plotPoints?: number;
    onPlotPointsChange?: (pp: number) => void;
    /** Player accepted the Fixer's Complication offered for a rolled 1 (+1 Plot Point). */
    onAcceptComplication?: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const FIXER_DIE_SIZES = [4, 6, 8, 10, 12];

export const Assembler: React.FC<AssemblerProps> = ({
    pool,
    setPool,
    categories,
    onToast,
    plotPoints,
    onPlotPointsChange,
    onAcceptComplication,
}) => {
    const [results, setResults] = useState<RolledDie[]>([]);
    const [extraIncluded, setExtraIncluded] = useState(0);
    const [stakes, setStakes] = useState<number | null>(null);
    const [fixerOnes, setFixerOnes] = useState(0);
    const [fixerDiceCount, setFixerDiceCount] = useState(2);
    const [fixerDieSize, setFixerDieSize] = useState(6);
    const triggerToast = (message: string) => {
        if (onToast) onToast(message);
    };

    // Handler: Add a d6 to the category
    const handleAddDie = (categoryId: string) => {
        setPool(prev => ({
            ...prev,
            [categoryId]: [...(prev[categoryId] || []), { id: generateId(), value: 6 }]
        }));
        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(15);
    };

    // Handler: Cycle the die value
    const handleCycleDie = (categoryId: string, dieIndex: number) => {
        setPool(prev => {
            const newPool = { ...prev };
            const currentDie = newPool[categoryId][dieIndex];
            const currentVal = currentDie.value;
            const currentIndex = DIE_SEQUENCE.indexOf(currentVal);
            // Cycle logic: d6-d8-d10-d12-d4-d6
            const nextVal = DIE_SEQUENCE[(currentIndex + 1) % DIE_SEQUENCE.length];

            const newDiceArray = [...newPool[categoryId]];
            newDiceArray[dieIndex] = { ...currentDie, value: nextVal };
            newPool[categoryId] = newDiceArray;

            return newPool;
        });
        if (navigator.vibrate) navigator.vibrate(10);
    };

    // Handler: Remove a die entirely (long press or Delete key)
    const handleRemoveDie = (categoryId: string, dieIndex: number) => {
        setPool(prev => {
            const newPool = { ...prev };
            const newDiceArray = [...newPool[categoryId]];
            newDiceArray.splice(dieIndex, 1);
            newPool[categoryId] = newDiceArray;
            return newPool;
        });
        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

        // Show a quick visual confirmation
        triggerToast('Die removed');
    };

    // Clear the entire pool
    const handleClearPool = () => {
        const initialPool: Record<string, PoolDie[]> = {};
        categories.forEach(cat => initialPool[cat.id] = []);
        setPool(initialPool);
        setResults([]);
        setExtraIncluded(0);
        if (navigator.vibrate) navigator.vibrate(50);
        triggerToast('Pool cleared');
    };

    const handleCopyCommand = () => {
        const command = generateRollCommand(pool);
        if (!command) {
            triggerToast('Pool is empty');
            return;
        }

        navigator.clipboard.writeText(command).then(() => {
            triggerToast('Command copied!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            triggerToast('Failed to copy');
        });
    };

    const handleRoll = () => {
        const dice = Object.values(pool).flat();
        if (!dice.length) { triggerToast('Pool is empty'); return; }
        setExtraIncluded(0);
        setResults(dice.map(die => ({ ...die, result: Math.floor(Math.random() * die.value) + 1 })));
    };

    // The Fixer rolls at least two dice and adds the two highest, like the Crew (core p.12).
    const handleFixerRoll = () => {
        const rolls = Array.from({ length: Math.max(2, fixerDiceCount) }, () =>
            Math.floor(Math.random() * fixerDieSize) + 1);
        const t = leverageTotal(rolls);
        setStakes(t.total);
        setFixerOnes(t.ones);
        triggerToast(`Fixer rolled ${rolls.join(', ')}: stakes ${t.total}`);
    };

    const handleIncludeDie = () => {
        if (onPlotPointsChange && (plotPoints ?? 0) > 0) {
            onPlotPointsChange((plotPoints ?? 0) - 1);
            setExtraIncluded(n => n + 1);
        }
    };

    return (
        <div className="assembler-wrapper font-sans h-full w-full relative comic-panel overflow-hidden chamfer-card">
            <div className="mx-auto p-4 flex flex-col items-center">
                <div className="text-center mb-4 w-full flex flex-col items-center border-b border-(--role-accent) pb-3">
                    <h2 className="font-display font-bold text-2xl uppercase tracking-wider">Dice Pool</h2>
                    <p className="font-mono text-xs uppercase text-ink-muted">Assemble, roll, raise the stakes</p>
                </div>

                {/* Category List */}
                <div className="w-full flex flex-col gap-3 pb-4">
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            className="comic-panel w-full min-h-24 p-2 grid grid-cols-3 relative overflow-hidden"
                            style={{ borderLeft: `4px solid ${cat.bg}` }}
                            onClick={() => handleAddDie(cat.id)}
                        >
                            <div className="col-span-1 flex flex-col justify-center gap-1 pr-1">
                                <h3 className="font-display font-bold text-base leading-none tracking-wide" style={{ wordBreak: 'break-word' }}>
                                    {cat.title}
                                </h3>
                                {cat.sub && (
                                    <p className="font-mono text-xs leading-tight text-ink-muted">
                                        {cat.sub}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    aria-label={`Add a d6 to ${cat.title}`}
                                    className="no-print mt-1 self-start rounded-sm border border-border-hover px-2 py-0.5 font-mono text-xs hover:bg-white/10"
                                    onClick={(e) => { e.stopPropagation(); handleAddDie(cat.id); }}
                                >
                                    + d6
                                </button>
                            </div>

                            <div className="col-span-2 flex items-center gap-1 pl-2 flex-wrap">
                                {(pool[cat.id] || []).map((die, index) => (
                                    <div
                                        key={die.id}
                                        className="flex flex-col items-center justify-center min-w-[60px]"
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onPointerUp={(e) => e.stopPropagation()}
                                    >
                                        <InteractiveDie
                                            type={die.value}
                                            categoryId={cat.id}
                                            dieIndex={index}
                                            onCycle={handleCycleDie}
                                            onRemove={handleRemoveDie}
                                        />
                                        {die.label && (
                                            <span className="font-mono text-[0.7rem] leading-tight text-center bg-obsidian-950 px-1 border border-border rounded-sm truncate w-full max-w-[72px]">
                                                {die.label}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-ink-muted text-sm">
                    Click a panel or its + d6 to add a d6. Click a die (or press Enter) to cycle its size.
                    Press and hold, or press Delete, to remove it.
                </p>

                {/* Fixer stakes */}
                <fieldset className="no-print mt-4 w-full rounded-sm border border-border p-3">
                    <legend className="px-1 font-display text-sm font-bold uppercase tracking-wider text-leverage-cyan">
                        Fixer stakes
                    </legend>
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="field-label" htmlFor="fixer-stakes">Stakes</label>
                            <input
                                id="fixer-stakes"
                                type="number"
                                min={0}
                                className="field w-20 font-mono"
                                value={stakes ?? ''}
                                placeholder="none"
                                onChange={(e) => {
                                    setFixerOnes(0);
                                    setStakes(e.target.value === '' ? null : Math.max(0, Math.floor(Number(e.target.value))));
                                }}
                            />
                        </div>
                        <div>
                            <label className="field-label" htmlFor="fixer-count">Fixer dice</label>
                            <input
                                id="fixer-count"
                                type="number"
                                min={2}
                                max={12}
                                className="field w-16 font-mono"
                                value={fixerDiceCount}
                                onChange={(e) => setFixerDiceCount(Math.max(2, Math.floor(Number(e.target.value)) || 2))}
                            />
                        </div>
                        <div>
                            <label className="field-label" htmlFor="fixer-size">Die size</label>
                            <select
                                id="fixer-size"
                                className="field w-auto font-mono"
                                value={fixerDieSize}
                                onChange={(e) => setFixerDieSize(Number(e.target.value))}
                            >
                                {FIXER_DIE_SIZES.map(n => <option key={n} value={n}>{n} sides</option>)}
                            </select>
                        </div>
                        <ComicButton variant="cyan" size="xs" onClick={handleFixerRoll}>Roll for Fixer</ComicButton>
                    </div>
                </fieldset>

                {results.length > 0 && (
                    <div className="mt-4 w-full">
                        <RollResultPanel
                            results={results}
                            extraIncluded={extraIncluded}
                            stakes={stakes}
                            fixerOnes={fixerOnes}
                            plotPoints={plotPoints}
                            onIncludeDie={handleIncludeDie}
                            onAcceptComplication={onAcceptComplication}
                        />
                    </div>
                )}

                <div className="sticky bottom-0 w-full p-3 bg-obsidian-950/95 backdrop-blur border-t border-border flex flex-wrap justify-center gap-3 z-40 mt-4">
                    <ComicButton variant="green" size="lg" onClick={handleRoll}>ROLL POOL</ComicButton>
                    <ComicButton onClick={handleCopyCommand} variant="blue" size="lg">
                        COPY COMMAND
                    </ComicButton>
                    <ComicButton onClick={handleClearPool} variant="red" size="lg">
                        CLEAR POOL
                    </ComicButton>
                </div>
            </div>
        </div>
    );
};
