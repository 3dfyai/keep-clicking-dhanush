// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, query, limitToLast, set, get, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAhg3yihrCiU-2uESRhRRPM9jgwpo9ovIQ",
    authDomain: "keep-clicking.firebaseapp.com",
    databaseURL: "https://keep-clicking-default-rtdb.firebaseio.com",
    projectId: "keep-clicking",
    storageBucket: "keep-clicking.firebasestorage.app",
    messagingSenderId: "9700014401",
    appId: "1:9700014401:web:f3f7cb4c45df0eb69389c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ========== CHAT FUNCTIONS ==========

const chatRef = ref(database, 'chat');

// Send a message
export function sendMessage(username, message) {
    const messageRef = ref(database, 'chat');
    return push(messageRef, {
        username,
        message,
        timestamp: serverTimestamp()
    });
}

// Subscribe to messages (returns unsubscribe function)
export function subscribeToMessages(callback, limit = 50) {
    const messagesQuery = query(chatRef, limitToLast(limit));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
        const messages = [];
        snapshot.forEach((child) => {
            messages.push({
                id: child.key,
                ...child.val()
            });
        });
        callback(messages);
    });

    return unsubscribe;
}

// ========== LEADERBOARD FUNCTIONS ==========

const leaderboardRef = ref(database, 'leaderboard');

// Submit or update high score
export async function submitScore(username, score) {
    try {
        const userScoreRef = ref(database, `leaderboard/${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);

        // Get existing score
        const snapshot = await get(userScoreRef);
        const existingData = snapshot.val();

        // Only update if new score is higher
        if (!existingData || score > existingData.score) {
            await set(userScoreRef, {
                username,
                score,
                timestamp: Date.now()
            });
            return true; // New high score!
        }
        return false;
    } catch (error) {
        console.error('Failed to submit score:', error);
        return false;
    }
}

// Subscribe to leaderboard (top 10)
export function subscribeToLeaderboard(callback) {
    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
        const scores = [];
        snapshot.forEach((child) => {
            scores.push({
                id: child.key,
                ...child.val()
            });
        });
        // Sort by score descending and take top 10
        scores.sort((a, b) => b.score - a.score);
        callback(scores.slice(0, 10));
    });

    return unsubscribe;
}

// Get user's personal best
export async function getPersonalBest(username) {
    try {
        const userScoreRef = ref(database, `leaderboard/${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
        const snapshot = await get(userScoreRef);
        const data = snapshot.val();
        return data ? data.score : 0;
    } catch (error) {
        return 0;
    }
}

export { database };
