import { useState, useEffect } from 'react';
import LandingScreen from './components/LandingScreen/LandingScreen';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

// App states
const STATES = {
  LANDING: 'landing',
  VIDEO: 'video',
  DASHBOARD: 'dashboard'
};

// Generate a random username
const generateRandomUsername = () => {
  const adjectives = ['Epic', 'Mega', 'Ultra', 'Super', 'Hyper', 'Turbo', 'Alpha', 'Beta', 'Pro', 'Elite', 'Legend', 'Beast', 'Ninja', 'Ghost', 'Shadow', 'Neon', 'Cyber', 'Pixel', 'Glitch', 'Void'];
  const nouns = ['Clicker', 'Gamer', 'Player', 'Master', 'Champ', 'Hero', 'Warrior', 'Hunter', 'Slayer', 'Killer', 'Destroyer', 'Legend', 'Beast', 'Ninja', 'Ghost', 'Shadow', 'Hacker', 'Coder', 'Dev', 'Pro'];
  const numbers = Math.floor(Math.random() * 9999) + 1;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}`;
};

function App() {
  const [appState, setAppState] = useState(STATES.LANDING);
  const [username, setUsername] = useState(null);

  // Check for saved username on mount, or generate one
  useEffect(() => {
    const savedUsername = localStorage.getItem('hyper-clicker-username');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      const randomUsername = generateRandomUsername();
      setUsername(randomUsername);
      localStorage.setItem('hyper-clicker-username', randomUsername);
    }
  }, []);

  const handleLogoClick = () => {
    setAppState(STATES.VIDEO);
  };

  const handleVideoComplete = () => {
    // Ensure username is set (generate if somehow missing)
    if (!username) {
      const randomUsername = generateRandomUsername();
      setUsername(randomUsername);
      localStorage.setItem('hyper-clicker-username', randomUsername);
    }
    setAppState(STATES.DASHBOARD);
  };

  // Render based on current state
  switch (appState) {
    case STATES.LANDING:
      return <LandingScreen onStart={handleLogoClick} />;

    case STATES.VIDEO:
      return <VideoPlayer onComplete={handleVideoComplete} />;

    case STATES.DASHBOARD:
      return <Dashboard username={username} />;

    default:
      return <LandingScreen onStart={handleLogoClick} />;
  }
}

export default App;
