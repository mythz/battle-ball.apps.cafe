import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './store/GameContext';
import MainMenu from './components/MainMenu';
import Game from './components/Game';
import Shop from './components/Shop';
import Settings from './components/Settings';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/game" element={<Game />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;
