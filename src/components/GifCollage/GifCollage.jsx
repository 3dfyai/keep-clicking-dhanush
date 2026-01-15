import { useState, useEffect } from 'react';
import { getCollageGifs, prefetchGifs } from '../../services/giphyService';
import './GifCollage.css';

export default function GifCollage() {
    const [gifs, setGifs] = useState([]);

    useEffect(() => {
        // Prefetch and load GIFs
        const loadGifs = async () => {
            prefetchGifs();
            const collageGifs = await getCollageGifs(16);
            setGifs(collageGifs);
        };

        loadGifs();

        // Refresh GIFs every 30 seconds for variety
        const interval = setInterval(async () => {
            const newGifs = await getCollageGifs(16);
            setGifs(newGifs);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="gif-collage">
            <div className="gif-grid">
                {gifs.map((gif, index) => (
                    <div
                        key={gif.id + index}
                        className="gif-tile"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <img
                            src={gif.smallUrl || gif.url}
                            alt={gif.title}
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
            <div className="gif-overlay"></div>
        </div>
    );
}
