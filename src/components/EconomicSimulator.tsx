import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// Game mechanics enums
export enum GameMapType {
  Australia = "Australia",
  Asia = "Asia", 
  Europe = "Europe",
  World = "World",
  Britannia = "Britannia"
}

export enum UnitType {
  Factory = "Factory",
  City = "City", 
  Port = "Port"
}

// Game state interfaces
interface Building {
  id: number;
  type: UnitType;
  x: number;
  y: number;
  goldPerTick: number;
  ownerId: number;
}

interface GameTile {
  isLand: boolean;
  elevation: number;
  buildings: Building[];
}

interface Player {
  id: number;
  name: string;
  gold: number;
  buildings: Building[];
}

// Game world representation
class GameWorld {
  width: number;
  height: number;
  tiles: GameTile[][];
  players: Player[];
  currentTick: number;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.currentTick = 0;
    this.players = [{ id: 1, name: "Player", gold: 1000, buildings: [] }];
    this.generateAustraliaMap();
  }
  
  generateAustraliaMap() {
    this.tiles = [];
    const centerX = this.width * 0.5;
    const centerY = this.height * 0.4;
    
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        // Create Australia-like landmass
        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Main continent
        const inMainland = distFromCenter < Math.min(this.width, this.height) * 0.25;
        // Tasmania
        const tasX = this.width * 0.6;
        const tasY = this.height * 0.8;
        const tasDist = Math.sqrt((x - tasX) ** 2 + (y - tasY) ** 2);
        const inTasmania = tasDist < 15;
        
        const isLand = inMainland || inTasmania;
        
        // Add coastal variation
        let elevation = 0;
        if (isLand) {
          const coastalDistance = Math.min(distFromCenter, tasDist);
          elevation = Math.max(0, 100 - coastalDistance * 2 + Math.random() * 50);
        }
        
        this.tiles[y][x] = {
          isLand,
          elevation,
          buildings: []
        };
      }
    }
  }
  
  getTile(x: number, y: number): GameTile | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.tiles[y][x];
  }
  
  canBuildAt(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile ? tile.isLand : false;
  }
  
  buildStructure(playerId: number, type: UnitType, x: number, y: number): Building | null {
    if (!this.canBuildAt(x, y)) return null;
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;
    
    const cost = this.getBuildCost(type);
    if (player.gold < cost) return null;
    
    const building: Building = {
      id: Date.now() + Math.random(),
      type,
      x,
      y,
      goldPerTick: this.getGoldPerTick(type),
      ownerId: playerId
    };
    
    player.gold -= cost;
    player.buildings.push(building);
    this.tiles[y][x].buildings.push(building);
    
    return building;
  }
  
  getBuildCost(type: UnitType): number {
    switch (type) {
      case UnitType.Factory: return 100;
      case UnitType.City: return 150;
      case UnitType.Port: return 200;
      default: return 100;
    }
  }
  
  getGoldPerTick(type: UnitType): number {
    switch (type) {
      case UnitType.Factory: return 3;
      case UnitType.City: return 2;
      case UnitType.Port: return 5;
      default: return 1;
    }
  }
  
  tick() {
    this.currentTick++;
    
    // Generate gold for all players
    this.players.forEach(player => {
      let goldGained = 0;
      
      // Calculate base income from buildings
      player.buildings.forEach(building => {
        goldGained += building.goldPerTick;
      });
      
      // Apply stacking bonuses/penalties
      const buildingsByTile = new Map<string, Building[]>();
      player.buildings.forEach(building => {
        const key = `${building.x},${building.y}`;
        if (!buildingsByTile.has(key)) buildingsByTile.set(key, []);
        buildingsByTile.get(key)!.push(building);
      });
      
      // Calculate stacking efficiency
      let totalEfficiency = 0;
      buildingsByTile.forEach(buildings => {
        buildings.forEach((building, index) => {
          const efficiency = index === 0 ? 1.0 : 0.7; // 70% efficiency for stacked buildings
          totalEfficiency += building.goldPerTick * efficiency;
        });
      });
      
      player.gold += Math.floor(totalEfficiency);
    });
  }
}

interface EconomicSimulatorProps {
  selectedMap: GameMapType;
  onBack: () => void;
}

interface EconomicStats {
  goldPerMinute: number;
  totalGold: number;
  factoryCount: number;
  cityCount: number;
  portCount: number;
  stackedBuildings: number;
  ticksElapsed: number;
}

export const EconomicSimulator: React.FC<EconomicSimulatorProps> = ({ selectedMap, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWorldRef = useRef<GameWorld | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'running'>('loading');
  const [gameSpeed, setGameSpeed] = useState(1);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [stats, setStats] = useState<EconomicStats>({
    goldPerMinute: 0,
    totalGold: 0,
    factoryCount: 0,
    cityCount: 0,
    portCount: 0,
    stackedBuildings: 0,
    ticksElapsed: 0
  });

  // Initialize game world
  useEffect(() => {
    setGameState('loading');
    
    // Create game world based on selected map
    const mapSize = selectedMap === GameMapType.Australia ? { width: 200, height: 150 } : { width: 200, height: 150 };
    gameWorldRef.current = new GameWorld(mapSize.width, mapSize.height);
    
    console.log('Game world initialized for', selectedMap);
    
    setTimeout(() => {
      setupCanvas();
      updateStats();
      setGameState('ready');
    }, 100);
  }, [selectedMap]);

  const setupCanvas = () => {
    if (!canvasRef.current || !gameWorldRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    
    renderWorld();
    
    // Add click handler
    canvas.addEventListener('click', handleCanvasClick);
  };

  const renderWorld = () => {
    if (!canvasRef.current || !gameWorldRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const world = gameWorldRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#1e3a5f'; // Ocean background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale
    const scaleX = canvas.width / world.width;
    const scaleY = canvas.height / world.height;
    
    // Render terrain
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const tile = world.getTile(x, y);
        if (!tile) continue;
        
        const screenX = x * scaleX;
        const screenY = y * scaleY;
        
        if (tile.isLand) {
          // Color based on elevation
          if (tile.elevation < 30) {
            ctx.fillStyle = '#8fbc8f'; // Dark sea green - coastal
          } else if (tile.elevation < 60) {
            ctx.fillStyle = '#9acd32'; // Yellow green - plains
          } else if (tile.elevation < 90) {
            ctx.fillStyle = '#daa520'; // Goldenrod - hills
          } else {
            ctx.fillStyle = '#cd853f'; // Peru - mountains
          }
        } else {
          ctx.fillStyle = '#4682b4'; // Steel blue - water
        }
        
        ctx.fillRect(screenX, screenY, scaleX + 1, scaleY + 1);
      }
    }
    
    // Render buildings
    const player = world.players[0];
    player.buildings.forEach(building => {
      const screenX = building.x * scaleX;
      const screenY = building.y * scaleY;
      
      // Building colors
      switch (building.type) {
        case UnitType.Factory:
          ctx.fillStyle = '#dc2626'; // Red
          break;
        case UnitType.City:
          ctx.fillStyle = '#7c3aed'; // Purple
          break;
        case UnitType.Port:
          ctx.fillStyle = '#0891b2'; // Cyan
          break;
      }
      
      const size = Math.max(4, Math.min(scaleX, scaleY) * 0.8);
      ctx.fillRect(screenX + 1, screenY + 1, size, size);
      
      // White border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX + 1, screenY + 1, size, size);
    });
    
    // Render buildings count for stacked buildings
    const buildingsByTile = new Map<string, Building[]>();
    player.buildings.forEach(building => {
      const key = `${building.x},${building.y}`;
      if (!buildingsByTile.has(key)) buildingsByTile.set(key, []);
      buildingsByTile.get(key)!.push(building);
    });
    
    buildingsByTile.forEach((buildings, key) => {
      if (buildings.length > 1) {
        const [x, y] = key.split(',').map(Number);
        const screenX = x * scaleX;
        const screenY = y * scaleY;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(buildings.length.toString(), screenX + 2, screenY + 12);
      }
    });
    
    // Highlight selected tile
    if (selectedTile) {
      const screenX = selectedTile.x * scaleX;
      const screenY = selectedTile.y * scaleY;
      
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.strokeRect(screenX, screenY, scaleX, scaleY);
    }
  };

  const updateStats = () => {
    if (!gameWorldRef.current) return;
    
    const world = gameWorldRef.current;
    const player = world.players[0];
    
    const factories = player.buildings.filter(b => b.type === UnitType.Factory);
    const cities = player.buildings.filter(b => b.type === UnitType.City);
    const ports = player.buildings.filter(b => b.type === UnitType.Port);
    
    // Calculate stacked buildings
    const buildingsByTile = new Map<string, Building[]>();
    player.buildings.forEach(building => {
      const key = `${building.x},${building.y}`;
      if (!buildingsByTile.has(key)) buildingsByTile.set(key, []);
      buildingsByTile.get(key)!.push(building);
    });
    
    const stackedBuildings = Array.from(buildingsByTile.values())
      .filter(buildings => buildings.length > 1)
      .reduce((sum, buildings) => sum + buildings.length - 1, 0);
    
    // Calculate gold per minute (10 ticks per second)
    let goldPerTick = 0;
    buildingsByTile.forEach(buildings => {
      buildings.forEach((building, index) => {
        const efficiency = index === 0 ? 1.0 : 0.7;
        goldPerTick += building.goldPerTick * efficiency;
      });
    });
    
    const goldPerMinute = goldPerTick * 10 * 60;
    
    setStats({
      goldPerMinute,
      totalGold: player.gold,
      factoryCount: factories.length,
      cityCount: cities.length,
      portCount: ports.length,
      stackedBuildings,
      ticksElapsed: world.currentTick
    });
  };

  const handleCanvasClick = (event: MouseEvent) => {
    if (!canvasRef.current || !gameWorldRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const world = gameWorldRef.current;
    
    // Convert screen coordinates to world coordinates
    const worldX = Math.floor((x / canvas.width) * world.width);
    const worldY = Math.floor((y / canvas.height) * world.height);
    
    if (world.canBuildAt(worldX, worldY)) {
      setSelectedTile({ x: worldX, y: worldY });
      setShowBuildMenu(true);
      renderWorld();
    }
  };

  const buildUnit = (unitType: UnitType) => {
    if (!selectedTile || !gameWorldRef.current) return;
    
    const world = gameWorldRef.current;
    const building = world.buildStructure(1, unitType, selectedTile.x, selectedTile.y);
    
    if (building) {
      console.log(`Built ${unitType} at (${selectedTile.x}, ${selectedTile.y}) for ${world.getBuildCost(unitType)} gold`);
      updateStats();
      renderWorld();
    } else {
      console.log(`Cannot build ${unitType} - insufficient gold or invalid location`);
    }
    
    setShowBuildMenu(false);
  };


  const startSimulation = () => {
    if (gameState !== 'ready' && gameState !== 'running') return;
    
    setGameState('running');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      if (gameWorldRef.current) {
        gameWorldRef.current.tick();
        updateStats();
        renderWorld();
      }
    }, Math.max(100, 1000 / gameSpeed));
  };

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setGameState('ready');
  };

  useEffect(() => {
    if (gameState === 'running') {
      startSimulation();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameSpeed, gameState]);

  const resetSimulation = () => {
    stopSimulation();
    // Reinitialize game
    window.location.reload();
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading {selectedMap} Map...</h2>
          <div className="animate-pulse bg-muted h-2 w-64 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Economic Simulation - {selectedMap}</h1>
          <Button variant="outline" onClick={onBack}>
            Back to Map Selection
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Map View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="border border-muted-foreground/20 rounded cursor-crosshair"
                    style={{ width: '100%', height: 'auto' }}
                  />
                  
                  {showBuildMenu && selectedTile && (
                    <div className="absolute top-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
                      <h3 className="font-semibold mb-2">
                        Build at ({selectedTile.x}, {selectedTile.y})
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          size="sm"
                          onClick={() => buildUnit(UnitType.Factory)}
                          className="justify-start"
                        >
                          🏭 Factory
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => buildUnit(UnitType.City)}
                          className="justify-start"
                        >
                          🏙️ City
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => buildUnit(UnitType.Port)}
                          className="justify-start"
                        >
                          ⚓ Port
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowBuildMenu(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={gameState === 'running' ? stopSimulation : startSimulation}
                    variant={gameState === 'running' ? 'destructive' : 'default'}
                  >
                    {gameState === 'running' ? 'Pause' : 'Start'} Simulation
                  </Button>
                  <Button variant="outline" onClick={resetSimulation}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls & Stats */}
          <div className="space-y-6">
            {/* Game Speed */}
            <Card>
              <CardHeader>
                <CardTitle>Simulation Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Speed: {gameSpeed}x</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.ticksElapsed} ticks
                    </span>
                  </div>
                  <Slider
                    value={[gameSpeed]}
                    onValueChange={([value]) => setGameSpeed(value)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Economic Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Economic Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Gold per Minute:</span>
                    <span className="text-2xl font-mono text-primary">
                      ${stats.goldPerMinute.toFixed(2)}/min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Gold:</span>
                    <span className="font-mono">${stats.totalGold.toString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Building Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Building Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Factories:</span>
                  <Badge variant="secondary">{stats.factoryCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cities:</span>
                  <Badge variant="secondary">{stats.cityCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Ports:</span>
                  <Badge variant="secondary">{stats.portCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Stacked Buildings:</span>
                  <Badge variant="outline">{stats.stackedBuildings}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Click on the map to select a tile</p>
                <p>• Use the build menu to place factories, cities, and ports</p>
                <p>• Stack multiple buildings on the same tile to test efficiency</p>
                <p>• Monitor gold per minute to optimize your strategy</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};