import React, { useState } from 'react';
import { GameMapType, mapCategories, Difficulty, GameMode } from '../types/game.js';
import { MapCard } from './MapCard.jsx';
import { dockerGameManager } from '../utils/dockerIntegration.js';
import './SinglePlayerMenu.css';

export function SinglePlayerMenu() {
  const [selectedMap, setSelectedMap] = useState(GameMapType.World);
  const [difficulty, setDifficulty] = useState(Difficulty.Medium);
  const [gameMode, setGameMode] = useState(GameMode.FFA);
  const [isOpen, setIsOpen] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartGame = async () => {
    setIsStarting(true);
    
    const gameConfig = {
      map: selectedMap,
      difficulty: difficulty,
      gameMode: gameMode,
      timestamp: new Date().toISOString()
    };

    try {
      await dockerGameManager.startSinglePlayerGame(gameConfig);
      console.log('Game started successfully');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert(`Failed to start game: ${error.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="menu-trigger">
        <button onClick={() => setIsOpen(true)} className="open-menu-btn">
          Single Player
        </button>
      </div>
    );
  }

  return (
    <div className="single-player-modal">
      <div className="modal-header">
        <h1>Single Player</h1>
        <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
      </div>

      <div className="modal-content">
        {/* Map Selection */}
        <div className="section">
          <h2>Map</h2>
          
          {Object.entries(mapCategories).map(([categoryName, maps]) => (
            <div key={categoryName} className="map-category">
              <h3>{categoryName}</h3>
              <div className="map-grid">
                {maps.map((mapType) => (
                  <MapCard
                    key={mapType}
                    mapType={mapType}
                    selected={selectedMap === mapType}
                    onClick={() => setSelectedMap(mapType)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Difficulty Selection */}
        <div className="section">
          <h2>Difficulty</h2>
          <div className="option-grid">
            {Object.values(Difficulty).map((diff) => (
              <button
                key={diff}
                className={`option-card ${difficulty === diff ? 'selected' : ''}`}
                onClick={() => setDifficulty(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="section">
          <h2>Game Mode</h2>
          <div className="option-grid">
            {Object.values(GameMode).map((mode) => (
              <button
                key={mode}
                className={`option-card ${gameMode === mode ? 'selected' : ''}`}
                onClick={() => setGameMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button 
          onClick={handleStartGame} 
          className="start-btn"
          disabled={isStarting}
        >
          {isStarting ? 'Starting...' : 'Start Game'}
        </button>

        {/* Instructions */}
        <div className="instructions">
          <p>Make sure Docker is installed and running on your system.</p>
          <p>The game will launch in a new window once the container starts.</p>
        </div>
      </div>
    </div>
  );
}