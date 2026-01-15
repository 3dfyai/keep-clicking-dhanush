import { useState, useEffect, useRef, useCallback } from 'react';
import './MusicPlayer.css';

// Songs are loaded from /public/music/ folder
// Add your .mp3 files there and list them here
const PLAYLIST = [
    // Example format - user will add their own songs:
    // { title: "SONG NAME", artist: "ARTIST", file: "song.mp3" },
    { title: "ADD YOUR SONGS", artist: "to /public/music/", file: "" }
];

export default function MusicPlayer() {
    const [tracks, setTracks] = useState(PLAYLIST);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [barHeights, setBarHeights] = useState(Array(20).fill(10));
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    const currentTrack = tracks[currentTrackIndex];

    // Load playlist from JSON file if it exists
    useEffect(() => {
        fetch('/music/playlist.json')
            .then(res => res.json())
            .then(data => {
                if (data.songs && data.songs.length > 0) {
                    setTracks(data.songs);
                    // Start at random track
                    setCurrentTrackIndex(Math.floor(Math.random() * data.songs.length));
                }
            })
            .catch(() => {
                console.log('No playlist.json found. Add your songs to /public/music/');
            });
    }, []);

    // Visualizer animation
    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setBarHeights(Array(20).fill(0).map(() =>
                    20 + Math.random() * 80
                ));
            }, 100);
            return () => clearInterval(interval);
        } else {
            setBarHeights(Array(20).fill(10));
        }
    }, [isPlaying]);

    // Update progress
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        return () => audio.removeEventListener('timeupdate', updateProgress);
    }, []);

    const handlePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack.file) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(err => console.log('Playback error:', err));
            setIsPlaying(true);
        }
    }, [isPlaying, currentTrack]);

    const handleStop = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
    }, []);

    const handleNext = useCallback(() => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        setProgress(0);
        if (isPlaying) {
            setTimeout(() => {
                audioRef.current?.play().catch(err => console.log('Playback error:', err));
            }, 100);
        }
    }, [isPlaying, tracks.length]);

    const handlePrev = useCallback(() => {
        setCurrentTrackIndex((prev) =>
            prev === 0 ? tracks.length - 1 : prev - 1
        );
        setProgress(0);
        if (isPlaying) {
            setTimeout(() => {
                audioRef.current?.play().catch(err => console.log('Playback error:', err));
            }, 100);
        }
    }, [isPlaying, tracks.length]);

    const handleTrackEnd = () => {
        handleNext();
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <div className="music-player">
            <audio
                ref={audioRef}
                src={currentTrack.file ? `/music/${currentTrack.file}` : ''}
                onEnded={handleTrackEnd}
                preload="metadata"
            />

            <div className="winamp-header">
                <span className="header-dots">● ● ●</span>
                <span className="header-title">WINAMP 98</span>
            </div>

            <div className="track-info">
                <div className="track-title">{currentTrack.title}</div>
                <div className="track-artist">{currentTrack.artist}</div>
            </div>

            <div className="winamp-vis">
                {barHeights.map((height, i) => (
                    <div
                        key={i}
                        className="vis-bar"
                        style={{
                            height: `${height}%`,
                            background: `linear-gradient(to top, 
                                var(--neon-green) 0%, 
                                var(--safety-yellow) 70%, 
                                var(--hot-pink) 100%)`
                        }}
                    />
                ))}
            </div>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="winamp-controls">
                <button onClick={handlePrev} title="Previous">⏮</button>
                <button onClick={handlePlay} title={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={handleStop} title="Stop">⏹</button>
                <button onClick={handleNext} title="Next">⏭</button>
            </div>

            <div className="volume-control">
                <span className="volume-icon">🔊</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                />
            </div>

            <div className="track-counter">
                TRACK {currentTrackIndex + 1} / {tracks.length}
            </div>
        </div>
    );
}
