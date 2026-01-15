import { useState, useEffect } from 'react';
import './BootScreen.css';

const logLines = [
  "FETCHING WAGMI PROTOCOL...",
  "INITIALIZING MEMETIC OVERLAY...",
  "CHECKING WALLET PERMISSIONS...",
  "DOWNLOADING ALPHA JPEGS...",
  "STAKING VIRTUAL ASSETS...",
  "LOADING EMOTIONAL TURBULENCE...",
  "BYPASSING SANITY CHECK...",
  "ESTABLISHING DIAL-UP... SUCCESS.",
  "READY TO SEND IT."
];

export default function BootScreen({ onComplete }) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Typewriter log effect
  useEffect(() => {
    let lineIdx = 0;
    const typeNextLine = () => {
      if (lineIdx < logLines.length) {
        setLogs(prev => [...prev, logLines[lineIdx]]);
        lineIdx++;
        setTimeout(typeNextLine, Math.random() * 500 + 200);
      }
    };
    typeNextLine();
  }, []);

  // Progress bar effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 5);
        if (next >= 99) {
          clearInterval(interval);
          setIsReady(true);
          return 99;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const renderProgressBlocks = () => {
    const filled = Math.floor(progress / 10);
    const empty = 10 - filled;
    return '[' + '■'.repeat(filled) + '□'.repeat(empty) + ']';
  };

  return (
    <section className="boot-screen">
      <div className="boot-log">
        {logs.map((line, i) => (
          <div key={i}>&gt; {line}</div>
        ))}
      </div>
      <div className="progress-container">
        <div className="progress-bar">{renderProgressBlocks()}</div>
        <div className="progress-text">
          {isReady 
            ? "SYSTEM READY. STATUS: STALLED AT 99%" 
            : `LOADING ALPHA... ${progress}%`}
        </div>
        <button 
          className={`enter-btn ${isReady ? 'visible' : ''}`}
          onClick={onComplete}
        >
          CLICK TO ENTER
        </button>
      </div>
    </section>
  );
}
