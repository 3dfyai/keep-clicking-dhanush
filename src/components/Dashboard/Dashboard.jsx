import { useState, useCallback, useRef, useEffect } from 'react';
import './Dashboard.css';
import GlobalCounter from '../GlobalCounter/GlobalCounter';
import MasterButton from '../MasterButton/MasterButton';
import Shoutbox from '../Shoutbox/Shoutbox';
import GifWindow from '../GifWindow/GifWindow';
import Marquee from '../Marquee/Marquee';
import FloatingEmojis from '../FloatingEmojis/FloatingEmojis';
import GifCollage from '../GifCollage/GifCollage';
import ComboMeter from '../ComboMeter/ComboMeter';
import Leaderboard from '../Leaderboard/Leaderboard';
import { getRandomGif, prefetchGifs } from '../../services/giphyService';
import { submitScore } from '../../services/firebase';

export default function Dashboard({ username }) {
    const [clickCount, setClickCount] = useState(0);
    const [comboMultiplier, setComboMultiplier] = useState(1);
    const [isShaking, setIsShaking] = useState(false);
    const [isOverloaded, setIsOverloaded] = useState(false);
    const [windows, setWindows] = useState([]);
    const [milestoneEffect, setMilestoneEffect] = useState(null);
    const clickTimesRef = useRef([]);
    const windowIdRef = useRef(0);
    const comboTimeoutRef = useRef(null);
    const audioRef = useRef(null);
    const lastClickRef = useRef(Date.now());

    // Prefetch GIFs and start background music on mount
    useEffect(() => {
        prefetchGifs();

        // Start playing background music
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(err => {
                console.log('Auto-play blocked, user interaction needed:', err);
            });
        }
    }, []);

    // Submit score periodically and on unmount
    useEffect(() => {
        const interval = setInterval(() => {
            if (clickCount > 0) {
                submitScore(username, clickCount);
            }
        }, 10000); // Every 10 seconds

        return () => {
            clearInterval(interval);
            if (clickCount > 0) {
                submitScore(username, clickCount);
            }
        };
    }, [clickCount, username]);

    // Mouse click sound effect using noise burst
    const playClickSound = useCallback(() => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a short noise burst for click sound
            const bufferSize = audioContext.sampleRate * 0.02; // 20ms
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            // Generate click-like noise
            for (let i = 0; i < bufferSize; i++) {
                // Sharp attack, quick decay
                const envelope = Math.exp(-i / (bufferSize * 0.1));
                data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
            }

            const source = audioContext.createBufferSource();
            source.buffer = buffer;

            // Add a low-pass filter for more realistic click
            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            source.connect(filter);
            filter.connect(audioContext.destination);

            source.start();
        } catch (e) { }
    }, []);

    // Calculate click intensity
    const getClickIntensity = useCallback(() => {
        const now = Date.now();
        const recentClicks = clickTimesRef.current.filter(t => now - t < 1000);
        return Math.min(recentClicks.length / 10, 1);
    }, []);

    const spawnWindow = useCallback(async () => {
        const gif = await getRandomGif();
        const intensity = getClickIntensity();

        const baseSize = 150 + (intensity * 250);
        const size = baseSize + (Math.random() * 50 - 25);

        const newWindow = {
            id: windowIdRef.current++,
            title: gif.title || 'KEEP PUSHING!',
            x: Math.random() * (window.innerWidth - size),
            y: Math.random() * (window.innerHeight - size),
            imageUrl: gif.url,
            size: Math.round(size)
        };

        setWindows(prev => {
            const updated = [...prev, newWindow];
            if (updated.length > 25) {
                return updated.slice(-25);
            }
            return updated;
        });
    }, [getClickIntensity]);

    const triggerOverload = useCallback(() => {
        setIsOverloaded(true);

        setTimeout(() => {
            setIsOverloaded(false);
            setWindows([]);
            clickTimesRef.current = [];
        }, 3000);
    }, []);

    // Update combo multiplier based on click speed
    const updateCombo = useCallback(() => {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickRef.current;
        lastClickRef.current = now;

        // Fast clicks (< 400ms) increase combo, otherwise reset
        if (timeSinceLastClick < 400) {
            setComboMultiplier(prev => Math.min(prev + 1, 10));
        } else {
            // Too slow - reset combo
            setComboMultiplier(1);
        }

        // Reset combo timeout - 1 second of inactivity resets combo
        if (comboTimeoutRef.current) {
            clearTimeout(comboTimeoutRef.current);
        }
        comboTimeoutRef.current = setTimeout(() => {
            setComboMultiplier(1);
        }, 1000); // Combo resets after 1s of inactivity - CHALLENGING!
    }, []);

    const handleMilestone = useCallback((milestone) => {
        setMilestoneEffect(milestone.effect);
        setTimeout(() => setMilestoneEffect(null), 3000);
    }, []);

    const handleClick = useCallback((e) => {
        if (isOverloaded) return;

        // Update combo
        updateCombo();

        // Increment counter
        setClickCount(prev => prev + 1);

        // Trigger shake
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);

        // Play click sound
        playClickSound();

        // Spawn window with Giphy GIF
        spawnWindow();

        // Check for overload
        const now = Date.now();
        clickTimesRef.current.push(now);
        clickTimesRef.current = clickTimesRef.current.filter(t => now - t < 2000);

        if (clickTimesRef.current.length > 15) {
            triggerOverload();
        }
    }, [isOverloaded, updateCombo, playClickSound, spawnWindow, triggerOverload]);

    const closeWindow = useCallback((id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    }, []);

    return (
        <main className={`dashboard ${isShaking ? 'shake' : ''} ${isOverloaded ? 'overload' : ''} ${milestoneEffect ? `milestone-${milestoneEffect}` : ''}`}>
            {/* Top Bar with X Icon and Contract Address */}
            <div className="top-bar">
                <a 
                    href="https://x.com/keepclicking__" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="x-icon-link"
                    aria-label="Follow on X"
                >
                    <svg 
                        className="x-icon" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </a>
                <div className="contract-address">
                    <span className="contract-label">CA:</span>
                    <span className="contract-value">C5CUoL8u4dWHDpWcZR49bD8SEHEv8mVWkLh4jkiapump</span>
                </div>
            </div>

            {/* GIF Collage Background */}
            <GifCollage />

            <div className="tiled-bg"></div>
            <div className="emoji-layer">
                <FloatingEmojis />
            </div>

            <Shoutbox username={username} />
            <Leaderboard currentUsername={username} currentScore={clickCount} />

            {/* Background Music - loops forever */}
            <audio
                ref={audioRef}
                src="/PROTOCOL_ CLICK (1).mp3"
                loop
                preload="auto"
            />

            <div className="hero-section">
                <div className="hero-label">DON'T STOP.</div>
                <GlobalCounter count={clickCount} />
                <MasterButton onClick={handleClick} />

                {/* Combo Meter - below button */}
                <ComboMeter
                    clickCount={clickCount}
                    comboMultiplier={comboMultiplier}
                />

                <div className="hero-sublabel">JUST KEEP CLICKING.</div>
            </div>

            <div className="window-container">
                {windows.map(win => (
                    <GifWindow
                        key={win.id}
                        {...win}
                        onClose={() => closeWindow(win.id)}
                    />
                ))}
            </div>

            <Marquee />

            {/* Overload Popup */}
            <div className={`overload-popup ${isOverloaded ? 'visible' : ''}`}>
                <h1>DOSAGE CRITICAL</h1>
                <p>MAXIMUM CLICKING REACHED</p>
                <p className="subtext">SYSTEM REBOOTING...</p>
            </div>
        </main>
    );
}
