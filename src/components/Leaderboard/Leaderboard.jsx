import { useState, useEffect } from 'react';
import './Leaderboard.css';
import { subscribeToLeaderboard } from '../../services/firebase';

export default function Leaderboard({ currentUsername, currentScore }) {
    const [scores, setScores] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToLeaderboard((newScores) => {
            setScores(newScores);
        });
        return () => unsubscribe();
    }, []);

    const getUserRank = () => {
        const index = scores.findIndex(s =>
            s.username.toLowerCase() === currentUsername.toLowerCase()
        );
        return index >= 0 ? index + 1 : null;
    };

    const userRank = getUserRank();

    return (
        <div className={`leaderboard ${isExpanded ? 'expanded' : ''}`}>
            <div
                className="leaderboard-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>🏆 LEADERBOARD</span>
                <span className="toggle-icon">{isExpanded ? '▼' : '▲'}</span>
            </div>

            {isExpanded && (
                <div className="leaderboard-content">
                    <div className="score-list">
                        {scores.length === 0 ? (
                            <div className="no-scores">NO SCORES YET!</div>
                        ) : (
                            scores.map((entry, index) => (
                                <div
                                    key={entry.id}
                                    className={`score-entry ${entry.username.toLowerCase() === currentUsername.toLowerCase() ? 'current-user' : ''}`}
                                >
                                    <span className="rank">
                                        {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                    </span>
                                    <span className="name">{entry.username}</span>
                                    <span className="score">{entry.score.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {userRank && (
                        <div className="your-rank">
                            YOUR RANK: #{userRank}
                        </div>
                    )}

                    <div className="current-session">
                        <span>SESSION:</span>
                        <span className="session-score">{currentScore.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
