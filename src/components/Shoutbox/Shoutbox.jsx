import { useState, useEffect, useRef } from 'react';
import './Shoutbox.css';
import { sendMessage, subscribeToMessages } from '../../services/firebase';

export default function Shoutbox({ username }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const feedRef = useRef(null);

    useEffect(() => {
        // Subscribe to real-time messages
        const unsubscribe = subscribeToMessages((newMessages) => {
            setMessages(newMessages.reverse()); // Most recent at top
            setIsConnected(true);
        });

        return () => unsubscribe();
    }, []);

    // Auto-scroll to top on new messages
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = 0;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();

        const msg = inputValue.trim();
        if (!msg || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(username, msg);
            setInputValue('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
        setIsSending(false);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="shoutbox">
            <div className="shoutbox-header">
                <span>#CLICK-SQUAD</span>
                <span className={`status-dot ${isConnected ? 'connected' : ''}`}></span>
            </div>

            <div className="shout-feed" ref={feedRef}>
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>BE THE FIRST TO SHOUT!</p>
                    </div>
                ) : (
                    messages.map(item => (
                        <div key={item.id} className="shout-message">
                            <span className="username">{item.username}:</span>
                            <span className="msg-text">{item.message}</span>
                            <span className="timestamp">{formatTime(item.timestamp)}</span>
                        </div>
                    ))
                )}
            </div>

            <form className="shout-input-container" onSubmit={handleSend}>
                <input
                    type="text"
                    className="shout-input"
                    placeholder="TYPE HERE..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    maxLength={100}
                />
                <button
                    type="submit"
                    className="send-btn"
                    disabled={isSending || !inputValue.trim()}
                >
                    &gt;
                </button>
            </form>

            <div className="shoutbox-footer">
                <span className="your-name">YOU: {username}</span>
            </div>
        </div>
    );
}
