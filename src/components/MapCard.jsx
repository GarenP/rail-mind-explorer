import React from 'react';
import { GameMapType } from '../types/game.js';

export function MapCard({ mapType, selected, onClick }) {
  // Generate map image path based on the core structure
  const getMapImagePath = (map) => {
    const mapKey = Object.keys(GameMapType).find(
      key => GameMapType[key] === map
    );
    return `/core/resources/maps/${mapKey?.toLowerCase()}/thumbnail.webp`;
  };

  return (
    <div 
      className={`map-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="map-image">
        <img 
          src={getMapImagePath(mapType)} 
          alt={mapType}
          onError={(e) => {
            // Fallback to a placeholder or colored rectangle
            const target = e.target;
            target.style.display = 'none';
            target.parentElement.style.backgroundColor = '#4a5568';
            target.parentElement.innerHTML = mapType.substring(0, 3);
          }}
        />
      </div>
      <div className="map-title">{mapType}</div>
    </div>
  );
}