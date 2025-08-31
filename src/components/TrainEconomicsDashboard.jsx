import React, { useState, useEffect } from 'react';
import { gameEngine } from '../game/GameEngine.js';

export function TrainEconomicsDashboard() {
  const [economicsData, setEconomicsData] = useState({
    goldPerMinute: 0,
    activeFactories: 0,
    connectedCities: 0,
    connectedPorts: 0,
    activeTrains: 0,
    totalStations: 0,
    averageStationLevel: 1,
    largestCluster: 0,
    revenueBreakdown: {
      baseIncome: 60000, // 100 gold/tick * 600 ticks/minute
      trainIncome: 0,
      tradeShipIncome: 0
    }
  });

  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Listen for game state updates
    const updateEconomics = () => {
      if (gameEngine.gameState && gameEngine.gameState.game) {
        const game = gameEngine.gameState.game;
        setGameState(game);
        
        // Calculate economics from game state
        calculateEconomics(game);
      }
    };

    // Update every second
    const interval = setInterval(updateEconomics, 1000);
    
    // Initial update
    updateEconomics();

    return () => clearInterval(interval);
  }, []);

  const calculateEconomics = (game) => {
    if (!game || !game.players || !game.players[0]) return;

    const player = game.players[0]; // Assuming first player is human
    const units = player.units || [];
    const railNetwork = game.railNetwork;
    
    // Count different unit types
    const factories = units.filter(unit => unit.type === 'Factory' && unit.isActive);
    const cities = units.filter(unit => unit.type === 'City' && unit.isActive);
    const ports = units.filter(unit => unit.type === 'Port' && unit.isActive);
    const trains = units.filter(unit => unit.type === 'Train' && unit.isActive);

    // Calculate station levels
    const allStations = [...cities, ...ports, ...factories];
    const avgLevel = allStations.length > 0 
      ? allStations.reduce((sum, station) => sum + (station.level || 1), 0) / allStations.length
      : 1;

    // Estimate cluster sizes (simplified)
    let largestCluster = 0;
    if (railNetwork && railNetwork.stationManager) {
      const stations = railNetwork.stationManager.getAll();
      // Find largest connected component
      largestCluster = Math.max(stations.size, largestCluster);
    }

    // Calculate train income potential
    // Formula: factories * spawn_rate * gold_per_station * average_level
    const trainSpawnRate = Math.min(1400, Math.round(40 * Math.pow(allStations.length, 0.5)));
    const trainsPerMinute = factories.length * (600 / Math.max(trainSpawnRate, 10)); // Convert ticks to minutes
    const goldPerTrain = 10000; // Base gold (non-friendly)
    const estimatedTrainIncome = trainsPerMinute * goldPerTrain * avgLevel * 0.6; // Efficiency factor

    setEconomicsData({
      goldPerMinute: 60000 + estimatedTrainIncome, // Base + train income
      activeFactories: factories.length,
      connectedCities: cities.length,
      connectedPorts: ports.length,
      activeTrains: trains.length,
      totalStations: allStations.length,
      averageStationLevel: avgLevel,
      largestCluster,
      revenueBreakdown: {
        baseIncome: 60000,
        trainIncome: estimatedTrainIncome,
        tradeShipIncome: 0 // TODO: Calculate from ports
      }
    });
  };

  const formatGold = (amount) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return Math.round(amount).toLocaleString();
  };

  const formatNumber = (num) => {
    return typeof num === 'number' ? num.toFixed(1) : '0';
  };

  if (!gameState) {
    return (
      <div className="glass-card p-6 m-4">
        <h2 className="text-xl font-bold text-foreground mb-4">Train Economics Dashboard</h2>
        <p className="text-muted-foreground">Waiting for game to start...</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 space-y-4 z-40">
      {/* Main Income Display */}
      <div className="stat-card text-center">
        <div className="metric-label mb-2">Total Income</div>
        <div className="income-counter text-3xl mb-2">
          {formatGold(economicsData.goldPerMinute)}/min
        </div>
        <div className="text-xs text-muted-foreground">
          Gold per minute
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-3">Income Sources</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Workers:</span>
            <span className="text-success">{formatGold(economicsData.revenueBreakdown.baseIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Train Revenue:</span>
            <span className="text-primary">{formatGold(economicsData.revenueBreakdown.trainIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trade Ships:</span>
            <span className="text-accent">{formatGold(economicsData.revenueBreakdown.tradeShipIncome)}</span>
          </div>
        </div>
      </div>

      {/* Station Stats */}
      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-3">Network Stats</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center">
            <div className="metric-value text-warning">{economicsData.activeFactories}</div>
            <div className="metric-label">Factories</div>
          </div>
          <div className="text-center">
            <div className="metric-value text-primary">{economicsData.connectedCities}</div>
            <div className="metric-label">Cities</div>
          </div>
          <div className="text-center">
            <div className="metric-value text-accent">{economicsData.connectedPorts}</div>
            <div className="metric-label">Ports</div>
          </div>
          <div className="text-center">
            <div className="metric-value text-success">{economicsData.activeTrains}</div>
            <div className="metric-label">Active Trains</div>
          </div>
        </div>
      </div>

      {/* Network Efficiency */}
      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-3">Efficiency Metrics</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Station Level:</span>
            <span className="text-foreground">{formatNumber(economicsData.averageStationLevel)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Largest Cluster:</span>
            <span className="text-foreground">{economicsData.largestCluster}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Stations:</span>
            <span className="text-foreground">{economicsData.totalStations}</span>
          </div>
        </div>
      </div>
    </div>
  );
}