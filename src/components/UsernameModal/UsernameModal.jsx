import { useState } from 'react';
import './UsernameModal.css';

export default function UsernameModal({ onSubmit }) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmed = username.trim();
        if (!trimmed) {
            setError('ENTER A NAME, ANON!');
            return;
        }
        if (trimmed.length < 2) {
            setError('NAME TOO SHORT!');
            return;
        }
        if (trimmed.length > 15) {
            setError('NAME TOO LONG (MAX 15)');
            return;
        }

        // Save to localStorage
        localStorage.setItem('hyper-clicker-username', trimmed);
        onSubmit(trimmed);
    };

    return (
        <div className="username-modal-overlay">
            <div className="username-modal">
                <div className="modal-title-bar">
                    <span>ENTER THE GRID</span>
                    <span className="modal-icon">🎮</span>
                </div>
                <div className="modal-content">
                    <div className="modal-text">
                        <p className="main-text">IDENTIFY YOURSELF</p>
                        <p className="sub-text">Choose your handle for the chatroom</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="username-input"
                            placeholder="TYPE YOUR NAME..."
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            maxLength={15}
                            autoFocus
                        />
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="submit-btn">
                            [ ENTER ]
                        </button>
                    </form>

                    <div className="modal-footer">
                        <span className="blink">●</span> SECURE CONNECTION
                    </div>
                </div>
            </div>
        </div>
    );
}
