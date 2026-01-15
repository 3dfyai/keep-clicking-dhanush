import { useState, useEffect, useRef } from 'react';
import './FloatingEmojis.css';

const emojis = ['🚀', '💎', '📈', '🐸', '🔥', '💰', '✨'];

export default function FloatingEmojis() {
    const [floaters, setFloaters] = useState([]);
    const idRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const newEmoji = {
                id: idRef.current++,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                left: Math.random() * 100
            };

            setFloaters(prev => [...prev, newEmoji]);

            // Remove after animation completes
            setTimeout(() => {
                setFloaters(prev => prev.filter(f => f.id !== newEmoji.id));
            }, 15000);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {floaters.map(f => (
                <div
                    key={f.id}
                    className="floating-emoji"
                    style={{ left: `${f.left}vw` }}
                >
                    {f.emoji}
                </div>
            ))}
        </>
    );
}
