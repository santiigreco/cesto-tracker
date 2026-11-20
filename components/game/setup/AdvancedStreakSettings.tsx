import React from 'react';
import { Settings } from '../../../types';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

interface AdvancedStreakSettingsProps {
    settings: Settings;
    onToggleManoCaliente: () => void;
    onToggleManoFria: () => void;
    onThresholdChange: (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => void;
}

const AdvancedStreakSettings: React.FC<AdvancedStreakSettingsProps> = ({
    settings,
    onToggleManoCaliente,
    onToggleManoFria,
    onThresholdChange,
}) => (
    <div className="space-y-4 animate-fade-in bg-surface-elevated/50 p-4 rounded-xl border border-border-subtle mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">
                    Mano Caliente
                </label>
                <div className="bg-surface-card p-3.5 rounded-xl border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink-secondary">Activar detección</span>
                        <ToggleSwitch
                            isEnabled={settings.isManoCalienteEnabled}
                            onToggle={onToggleManoCaliente}
                        />
                    </div>
                    {settings.isManoCalienteEnabled && (
                        <div className="flex items-center justify-between gap-4 animate-fade-in">
                            <span className="text-xs font-medium text-ink-muted">Umbral (goles)</span>
                            <input
                                type="number"
                                min={2}
                                max={15}
                                aria-label="Umbral de goles para Mano Caliente"
                                value={settings.manoCalienteThreshold}
                                onChange={(e) => onThresholdChange('manoCalienteThreshold', e.target.value)}
                                className="w-16 bg-surface-elevated text-center text-brand font-extrabold rounded-lg py-1 border border-border-strong focus:border-brand text-base sm:text-sm tabular-nums"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">
                    Mano Fría
                </label>
                <div className="bg-surface-card p-3.5 rounded-xl border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink-secondary">Activar detección</span>
                        <ToggleSwitch
                            isEnabled={settings.isManoFriaEnabled}
                            onToggle={onToggleManoFria}
                        />
                    </div>
                    {settings.isManoFriaEnabled && (
                        <div className="flex items-center justify-between gap-4 animate-fade-in">
                            <span className="text-xs font-medium text-ink-muted">Umbral (fallos)</span>
                            <input
                                type="number"
                                min={2}
                                max={15}
                                aria-label="Umbral de fallos para Mano Fría"
                                value={settings.manoFriaThreshold}
                                onChange={(e) => onThresholdChange('manoFriaThreshold', e.target.value)}
                                className="w-16 bg-surface-elevated text-center text-sport-triple-light font-extrabold rounded-lg py-1 border border-border-strong focus:border-sport-triple-light text-base sm:text-sm tabular-nums"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default AdvancedStreakSettings;
