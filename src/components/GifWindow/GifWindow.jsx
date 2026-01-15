import { useState, useRef, useCallback } from 'react';
import './GifWindow.css';

export default function GifWindow({ id, title, x, y, imageUrl, size = 250, onClose }) {
    const [position, setPosition] = useState({ x, y });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const posStartRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        posStartRef.current = { ...position };

        const handleMouseMove = (moveE) => {
            const deltaX = moveE.clientX - dragStartRef.current.x;
            const deltaY = moveE.clientY - dragStartRef.current.y;
            setPosition({
                x: posStartRef.current.x + deltaX,
                y: posStartRef.current.y + deltaY
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [position]);

    return (
        <div
            className={`gif-window ${isDragging ? 'dragging' : ''}`}
            style={{
                left: position.x,
                top: position.y,
                width: size,
                height: size * 0.85
            }}
        >
            <div className="window-title" onMouseDown={handleMouseDown}>
                <span>{title}</span>
                <button className="window-close" onClick={onClose}>[X]</button>
            </div>
            <div className="window-content">
                <img src={imageUrl} alt="alpha" loading="lazy" />
            </div>
        </div>
    );
}
