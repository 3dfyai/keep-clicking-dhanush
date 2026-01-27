import { useState, useEffect, useCallback, useRef } from 'react';
import './LandingScreen.css';
import { getAggressiveGif, prefetchAggressiveGifs } from '../../services/giphyService';

// 5x4 grid = 20 tiles to fill screen
const GRID_COLS = 5;
const GRID_ROWS = 4;
const TOTAL_TILES = GRID_COLS * GRID_ROWS;

export default function LandingScreen({ onStart }) {
    const [isHovered, setIsHovered] = useState(false);
    const [tiles, setTiles] = useState(
        // Initialize with placeholder tiles
        Array.from({ length: TOTAL_TILES }, (_, i) => ({
            id: i,
            url: null,
            row: Math.floor(i / GRID_COLS),
            col: i % GRID_COLS,
            animating: false
        }))
    );
    const tileIdRef = useRef(TOTAL_TILES);

    // Prefetch AGGRESSIVE GIFs on mount
    useEffect(() => {
        prefetchAggressiveGifs();
    }, []);

    // Replace a random tile with a new AGGRESSIVE GIF
    const replaceTile = useCallback(async () => {
        const gif = await getAggressiveGif();
        if (!gif?.url) return;

        const randomIndex = Math.floor(Math.random() * TOTAL_TILES);
        const newId = tileIdRef.current++;

        setTiles(prev => prev.map((tile, i) =>
            i === randomIndex
                ? {
                    id: newId,
                    url: gif.url,
                    row: tile.row,
                    col: tile.col,
                    animating: true
                }
                : tile
        ));
    }, []);

    // Initial fill and continuous replacement
    useEffect(() => {
        // Fill all tiles initially
        const fillAll = async () => {
            for (let i = 0; i < TOTAL_TILES; i++) {
                setTimeout(() => replaceTile(), i * 100);
            }
        };
        fillAll();

        // Replace random tiles every 200ms for constant movement
        const interval = setInterval(replaceTile, 200);
        return () => clearInterval(interval);
    }, [replaceTile]);

    return (
        <div className="landing-screen" onClick={onStart}>
            {/* GIF Grid Background - fills entire screen */}
            <div className="gif-grid">
                {tiles.map(tile => (
                    <div
                        key={tile.id}
                        className="gif-cell"
                        style={{
                            gridRow: tile.row + 1,
                            gridColumn: tile.col + 1,
                        }}
                    >
                        {tile.url && (
                            <img
                                src={tile.url}
                                alt=""
                                loading="eager"
                                className="gif-image"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Dimming overlay */}
            <div className="dim-overlay"></div>

            <div className="stars-bg"></div>
            <div className="landing-content">
                <button
                    className={`logo-button ${isHovered ? 'hovered' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onStart();
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    aria-label="Start Experience"
                >
                    <div className="logo-glow"></div>
                    <img
                        src="/logo.png"
                        alt="Keep Clicking"
                        className="logo-image"
                    />
                </button>
                <div className="click-hint">
                    <span className="hint-arrow">▼</span>
                    <span className="hint-text">CLICK TO BEGIN</span>
                    <span className="hint-arrow">▼</span>
                </div>
            </div>
        </div>
    );
}
