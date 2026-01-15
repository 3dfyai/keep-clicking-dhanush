import './ComboMeter.css';

// Milestone thresholds
const MILESTONES = [
    { clicks: 10, name: 'WARMED UP', color: '#00ff00' },
    { clicks: 25, name: 'GETTING STARTED', color: '#00ffff' },
    { clicks: 50, name: 'ON FIRE!', color: '#ffff00' },
    { clicks: 100, name: 'UNSTOPPABLE', color: '#ff8800' },
    { clicks: 200, name: 'LEGENDARY', color: '#ff00ff' },
    { clicks: 500, name: 'GODLIKE', color: '#ff0000' },
    { clicks: 1000, name: 'TRANSCENDENT', color: '#ffffff' },
];

export default function ComboMeter({ clickCount, comboMultiplier }) {
    // Get current milestone
    const currentMilestone = [...MILESTONES].reverse().find(m => clickCount >= m.clicks);

    // Calculate combo tier based on multiplier
    const getComboTier = () => {
        if (comboMultiplier >= 10) return { name: 'INSANE!!!', color: '#ff00ff' };
        if (comboMultiplier >= 8) return { name: 'AMAZING!', color: '#ff4400' };
        if (comboMultiplier >= 6) return { name: 'GREAT!', color: '#ffff00' };
        if (comboMultiplier >= 4) return { name: 'GOOD', color: '#00ffff' };
        if (comboMultiplier >= 2) return { name: 'NICE', color: '#00ff00' };
        return null;
    };

    const comboTier = getComboTier();

    return (
        <div className="combo-overlay">
            {/* Combo Display - shown below button */}
            {comboMultiplier > 1 && (
                <div
                    className="combo-display"
                    style={{
                        '--combo-color': comboTier?.color || '#00ff00',
                        '--combo-level': comboMultiplier
                    }}
                >
                    <div className="combo-multiplier">x{comboMultiplier}</div>
                    {comboTier && <div className="combo-tier">{comboTier.name}</div>}
                    <div className="combo-timer-bar">
                        <div className="combo-timer-fill" />
                    </div>
                </div>
            )}

            {/* Milestone Badge - shows current achievement */}
            {currentMilestone && (
                <div
                    className="milestone-badge"
                    style={{ '--milestone-color': currentMilestone.color }}
                >
                    ⚡ {currentMilestone.name} ⚡
                </div>
            )}
        </div>
    );
}
