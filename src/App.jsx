import { useState, useEffect } from 'react';
import LandingScreen from './components/LandingScreen/LandingScreen';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import Dashboard from './components/Dashboard/Dashboard';
import UsernameModal from './components/UsernameModal/UsernameModal';
import './App.css';

// App states
const STATES = {
  LANDING: 'landing',
  VIDEO: 'video',
  USERNAME: 'username',
  DASHBOARD: 'dashboard'
};

function App() {
  const [appState, setAppState] = useState(STATES.LANDING);
  const [username, setUsername] = useState(null);

  // Check for saved username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('hyper-clicker-username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogoClick = () => {
    setAppState(STATES.VIDEO);
  };

  const handleVideoComplete = () => {
    if (username) {
      setAppState(STATES.DASHBOARD);
    } else {
      setAppState(STATES.USERNAME);
    }
  };

  const handleUsernameSubmit = (name) => {
    setUsername(name);
    setAppState(STATES.DASHBOARD);
  };

  // Render based on current state
  switch (appState) {
    case STATES.LANDING:
      return <LandingScreen onStart={handleLogoClick} />;

    case STATES.VIDEO:
      return <VideoPlayer onComplete={handleVideoComplete} />;

    case STATES.USERNAME:
      return <UsernameModal onSubmit={handleUsernameSubmit} />;

    case STATES.DASHBOARD:
      return <Dashboard username={username} />;

    default:
      return <LandingScreen onStart={handleLogoClick} />;
  }
}

export default App;
