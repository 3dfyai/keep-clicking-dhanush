import './GlobalCounter.css';

export default function GlobalCounter({ count }) {
    const displayCount = count.toString().padStart(6, '0');

    return (
        <div className="global-counter">
            {displayCount}
        </div>
    );
}
