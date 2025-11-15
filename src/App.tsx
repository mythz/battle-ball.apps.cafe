import React, { useState } from 'react';
import { GameProvider } from './store/GameContext';
import MainMenu from './components/MainMenu';
import Game from './components/Game';
import Shop from './components/Shop';
import Settings from './components/Settings';
import './App.css';

type Screen = 'menu' | 'game' | 'shop' | 'settings';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <GameProvider>
      <div className="app">
        {currentScreen === 'menu' && <MainMenu navigate={navigate} />}
        {currentScreen === 'game' && <Game navigate={navigate} />}
        {currentScreen === 'shop' && <Shop navigate={navigate} />}
        {currentScreen === 'settings' && <Settings navigate={navigate} />}
      </div>
    </GameProvider>
  );
};

export default App;
