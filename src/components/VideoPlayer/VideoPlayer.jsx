import { useRef, useEffect } from 'react';
import './VideoPlayer.css';

export default function VideoPlayer({ onComplete }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // Play video with audio
            video.play().catch(err => {
                console.error('Video autoplay failed:', err);
                // If autoplay fails, still allow skipping
            });

            // Handle video end
            const handleEnded = () => {
                onComplete();
            };

            video.addEventListener('ended', handleEnded);
            return () => video.removeEventListener('ended', handleEnded);
        }
    }, [onComplete]);

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="video-player">
            <video
                ref={videoRef}
                className="intro-video"
                src="/keep clicking website loading screen.mp4"
                playsInline
            />
            <button className="skip-btn" onClick={handleSkip}>
                SKIP ▸▸
            </button>
        </div>
    );
}
