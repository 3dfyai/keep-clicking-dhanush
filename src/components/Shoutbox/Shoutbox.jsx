import { useState, useEffect, useRef } from 'react';
import './Shoutbox.css';
import { sendMessage, subscribeToMessages } from '../../services/firebase';

// Anti-spam configuration
const MESSAGE_COOLDOWN = 2000; // 2 seconds between messages
const MAX_DUPLICATE_MESSAGES = 2; // Max consecutive duplicate messages
const DUPLICATE_WINDOW = 10000; // 10 seconds window for duplicate detection

export default function Shoutbox({ username }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [spamError, setSpamError] = useState('');
    const feedRef = useRef(null);
    const lastMessageTimeRef = useRef(0);
    const lastMessageTextRef = useRef('');
    const duplicateCountRef = useRef(0);
    const duplicateWindowStartRef = useRef(0);
    const cooldownIntervalRef = useRef(null);

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

    // Cleanup cooldown interval on unmount
    useEffect(() => {
        return () => {
            if (cooldownIntervalRef.current) {
                clearInterval(cooldownIntervalRef.current);
            }
        };
    }, []);

    // Update cooldown timer
    useEffect(() => {
        if (cooldownRemaining > 0) {
            cooldownIntervalRef.current = setInterval(() => {
                setCooldownRemaining(prev => {
                    if (prev <= 1000) {
                        clearInterval(cooldownIntervalRef.current);
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);
        } else {
            if (cooldownIntervalRef.current) {
                clearInterval(cooldownIntervalRef.current);
            }
        }
        return () => {
            if (cooldownIntervalRef.current) {
                clearInterval(cooldownIntervalRef.current);
            }
        };
    }, [cooldownRemaining]);

    const handleSend = async (e) => {
        e.preventDefault();

        const msg = inputValue.trim();
        if (!msg || isSending) return;

        const now = Date.now();
        const timeSinceLastMessage = now - lastMessageTimeRef.current;

        // Check rate limiting (cooldown)
        if (timeSinceLastMessage < MESSAGE_COOLDOWN) {
            const remaining = MESSAGE_COOLDOWN - timeSinceLastMessage;
            setCooldownRemaining(remaining);
            setSpamError(`WAIT ${Math.ceil(remaining / 1000)}S`);
            setTimeout(() => setSpamError(''), 2000);
            return;
        }

        // Check for duplicate messages
        const isDuplicate = msg.toLowerCase() === lastMessageTextRef.current.toLowerCase();
        const isInDuplicateWindow = (now - duplicateWindowStartRef.current) < DUPLICATE_WINDOW;

        if (isDuplicate && isInDuplicateWindow) {
            duplicateCountRef.current += 1;
            if (duplicateCountRef.current >= MAX_DUPLICATE_MESSAGES) {
                setSpamError('NO SPAM!');
                setTimeout(() => setSpamError(''), 2000);
                return;
            }
        } else {
            // Reset duplicate tracking if new message or window expired
            duplicateCountRef.current = isDuplicate ? 1 : 0;
            duplicateWindowStartRef.current = now;
        }

        setIsSending(true);
        setSpamError('');
        try {
            await sendMessage(username, msg);
            setInputValue('');
            
            // Update tracking
            lastMessageTimeRef.current = now;
            lastMessageTextRef.current = msg;
            setCooldownRemaining(MESSAGE_COOLDOWN);
        } catch (error) {
            console.error('Failed to send message:', error);
            setSpamError('SEND FAILED');
            setTimeout(() => setSpamError(''), 2000);
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
                {spamError && (
                    <div className="spam-error">{spamError}</div>
                )}
                <div className="shout-input-wrapper">
                    <input
                        type="text"
                        className="shout-input"
                        placeholder={cooldownRemaining > 0 ? `WAIT ${Math.ceil(cooldownRemaining / 1000)}S...` : "TYPE HERE..."}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setSpamError('');
                        }}
                        maxLength={100}
                        disabled={cooldownRemaining > 0}
                    />
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={isSending || !inputValue.trim() || cooldownRemaining > 0}
                        title={cooldownRemaining > 0 ? `Cooldown: ${Math.ceil(cooldownRemaining / 1000)}s` : 'Send message'}
                    >
                        &gt;
                    </button>
                </div>
            </form>

            <div className="shoutbox-footer">
                <span className="your-name">YOU: {username}</span>
            </div>
        </div>
    );
}
