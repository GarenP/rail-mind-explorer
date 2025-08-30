import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// Simplified game types to match core mechanics
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
  Port = "Port",
  Train = "Train"
}

// Simplified building and tile interfaces
interface Building {
  id: string;
  type: UnitType;
  x: number;
  y: number;
  level: number;
  goldGeneration: number;
}

interface Tile {
  x: number;
  y: number;
  terrain: number; // 0 = water, 1 = land
  buildings: Building[];
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

// Map configurations based on actual game data
const mapConfigs = {
  [GameMapType.Australia]: {
    width: 2000,
    height: 1500,
    landTiles: 1319763,
    nations: [
      { name: "Western Australia", x: 460, y: 720 },
      { name: "Northern Territory", x: 965, y: 340 },
      { name: "South Australia", x: 920, y: 915 },
      { name: "Victoria", x: 1435, y: 1220 },
      { name: "Queensland", x: 1490, y: 555 },
      { name: "New South Wales", x: 1605, y: 1025 },
      { name: "Tasmania", x: 1595, y: 1380 }
    ]
  },
  [GameMapType.Asia]: { width: 1800, height: 1400, landTiles: 800000, nations: [] },
  [GameMapType.Europe]: { width: 1600, height: 1200, landTiles: 600000, nations: [] },
  [GameMapType.World]: { width: 2400, height: 1200, landTiles: 1800000, nations: [] },
  [GameMapType.Britannia]: { width: 800, height: 1200, landTiles: 200000, nations: [] }
};

// Economic constants based on game mechanics
const TICKS_PER_SECOND = 10;
const BASE_GOLD_PER_TICK = {
  [UnitType.Factory]: 2,
  [UnitType.City]: 1,
  [UnitType.Port]: 3
};

export const EconomicSimulator: React.FC<EconomicSimulatorProps> = ({ selectedMap, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);
  const mapDataRef = useRef<Tile[][]>([]);
  const buildingsRef = useRef<Building[]>([]);
  
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'running' | 'error'>('loading');
  const [gameSpeed, setGameSpeed] = useState(1);
  const [buildMode, setBuildMode] = useState<UnitType | null>(null);
  const [stats, setStats] = useState<EconomicStats>({
    goldPerMinute: 0,
    totalGold: 0,
    factoryCount: 0,
    cityCount: 0,
    portCount: 0,
    stackedBuildings: 0,
    ticksElapsed: 0
  });

  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [nextBuildingId, setNextBuildingId] = useState(1);

  // Initialize simulated game map
  useEffect(() => {
    const initializeGame = () => {
      try {
        setGameState('loading');
        
        const config = mapConfigs[selectedMap];
        const displayWidth = 120; // Display grid size
        const displayHeight = 80;
        
        // Create simplified map data
        const mapData: Tile[][] = [];
        for (let y = 0; y < displayHeight; y++) {
          mapData[y] = [];
          for (let x = 0; x < displayWidth; x++) {
            // Simple terrain generation - more land in center
            const centerX = displayWidth / 2;
            const centerY = displayHeight / 2;
            const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const isLand = distFromCenter < Math.min(displayWidth, displayHeight) / 3 || Math.random() > 0.3;
            
            mapData[y][x] = {
              x,
              y,
              terrain: isLand ? 1 : 0,
              buildings: []
            };
          }
        }
        
        mapDataRef.current = mapData;
        buildingsRef.current = [];
        
        // Setup canvas rendering
        setTimeout(() => {
          if (canvasRef.current) {
            setupCanvas();
          }
          setGameState('ready');
        }, 500);
        
        console.log('Simulated game initialized successfully for', selectedMap);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setGameState('error');
      }
    };

    initializeGame();
  }, [selectedMap]);

  const setupCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Set canvas display size
    canvas.width = 800;
    canvas.height = 600;
    
    renderMap();
  };

  const renderMap = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const mapData = mapDataRef.current;
    if (!mapData.length) return;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate tile sizes
    const tileWidth = canvas.width / mapData[0].length;
    const tileHeight = canvas.height / mapData.length;
    
    // Render terrain
    mapData.forEach((row, y) => {
      row.forEach((tile, x) => {
        const pixelX = x * tileWidth;
        const pixelY = y * tileHeight;
        
        // Different colors for land/water
        if (tile.terrain === 0) {
          ctx.fillStyle = '#1e3a8a'; // Water - dark blue
        } else {
          ctx.fillStyle = '#15803d'; // Land - dark green
        }
        
        ctx.fillRect(pixelX, pixelY, tileWidth, tileHeight);
      });
    });
    
    // Render buildings
    renderBuildings(ctx, tileWidth, tileHeight);
    
    // Highlight selected tile
    if (selectedTile) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectedTile.x * tileWidth, 
        selectedTile.y * tileHeight, 
        tileWidth, 
        tileHeight
      );
    }
  };

  const renderBuildings = (ctx: CanvasRenderingContext2D, tileWidth: number, tileHeight: number) => {
    const buildings = buildingsRef.current;
    
    buildings.forEach((building, index) => {
      const x = building.x * tileWidth;
      const y = building.y * tileHeight;
      
      // Stack offset for multiple buildings on same tile
      const buildingsOnTile = buildings.filter(b => b.x === building.x && b.y === building.y);
      const stackIndex = buildingsOnTile.findIndex(b => b.id === building.id);
      const offset = stackIndex * 3;
      
      // Different colors/shapes for different building types
      switch (building.type) {
        case UnitType.Factory:
          ctx.fillStyle = '#dc2626'; // Red
          ctx.fillRect(x + 2 + offset, y + 2 + offset, tileWidth - 4, tileHeight - 4);
          break;
        case UnitType.City:
          ctx.fillStyle = '#7c3aed'; // Purple
          ctx.beginPath();
          ctx.arc(x + tileWidth/2 + offset, y + tileHeight/2 + offset, Math.min(tileWidth, tileHeight)/3, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case UnitType.Port:
          ctx.fillStyle = '#0891b2'; // Cyan
          ctx.fillRect(x + 1 + offset, y + 1 + offset, tileWidth - 2, tileHeight - 2);
          break;
      }
      
      // Show building level/count for stacked buildings
      if (buildingsOnTile.length > 1) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(buildingsOnTile.length.toString(), x + 2, y + 15);
      }
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const mapData = mapDataRef.current;
    if (!mapData.length) return;
    
    const tileWidth = canvas.width / mapData[0].length;
    const tileHeight = canvas.height / mapData.length;
    
    const tileX = Math.floor(x / tileWidth);
    const tileY = Math.floor(y / tileHeight);
    
    if (tileX >= 0 && tileX < mapData[0].length && tileY >= 0 && tileY < mapData.length) {
      setSelectedTile({ x: tileX, y: tileY });
      setShowBuildMenu(true);
    }
  };

  const buildUnit = (unitType: UnitType) => {
    if (!selectedTile) return;
    
    const mapData = mapDataRef.current;
    if (!mapData.length) return;
    
    const tile = mapData[selectedTile.y]?.[selectedTile.x];
    if (!tile || tile.terrain === 0) {
      console.log(`Cannot build ${unitType} on water`);
      setShowBuildMenu(false);
      return;
    }
    
    // Create new building
    const newBuilding: Building = {
      id: `${nextBuildingId}`,
      type: unitType,
      x: selectedTile.x,
      y: selectedTile.y,
      level: 1,
      goldGeneration: BASE_GOLD_PER_TICK[unitType]
    };
    
    buildingsRef.current.push(newBuilding);
    setNextBuildingId(prev => prev + 1);
    
    console.log(`Built ${unitType} at (${selectedTile.x}, ${selectedTile.y})`);
    
    updateStats();
    renderMap();
    setShowBuildMenu(false);
  };

  const updateStats = () => {
    const buildings = buildingsRef.current;
    
    const factories = buildings.filter(b => b.type === UnitType.Factory);
    const cities = buildings.filter(b => b.type === UnitType.City);
    const ports = buildings.filter(b => b.type === UnitType.Port);
    
    // Calculate stacked buildings (multiple buildings on same tile)
    const tileUnitCount = new Map<string, number>();
    buildings.forEach(building => {
      const tileKey = `${building.x},${building.y}`;
      tileUnitCount.set(tileKey, (tileUnitCount.get(tileKey) || 0) + 1);
    });
    
    const stackedBuildings = Array.from(tileUnitCount.values())
      .filter(count => count > 1)
      .reduce((sum, count) => sum + count - 1, 0);
    
    // Calculate total gold generation per minute
    const totalGoldPerTick = buildings.reduce((sum, building) => {
      // Stacking bonus: each additional building on same tile gets 50% efficiency
      const buildingsOnSameTile = buildings.filter(b => b.x === building.x && b.y === building.y);
      const stackPosition = buildingsOnSameTile.findIndex(b => b.id === building.id);
      const efficiency = stackPosition === 0 ? 1.0 : 0.5;
      return sum + (building.goldGeneration * efficiency);
    }, 0);
    
    const goldPerMinute = totalGoldPerTick * TICKS_PER_SECOND * 60;
    const totalGold = stats.totalGold + (totalGoldPerTick * stats.ticksElapsed);
    
    setStats(prev => ({
      goldPerMinute,
      totalGold,
      factoryCount: factories.length,
      cityCount: cities.length,
      portCount: ports.length,
      stackedBuildings,
      ticksElapsed: prev.ticksElapsed
    }));
  };

  const startSimulation = () => {
    if (gameState !== 'ready' && gameState !== 'running') return;
    
    setGameState('running');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      // Simulate game tick
      setStats(prev => ({
        ...prev,
        ticksElapsed: prev.ticksElapsed + 1,
        totalGold: prev.totalGold + (prev.goldPerMinute / (60 * TICKS_PER_SECOND))
      }));
      
      updateStats();
      renderMap();
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

  if (gameState === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-destructive">Failed to load game</h2>
          <Button onClick={onBack}>Back to Map Selection</Button>
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
                    onClick={handleCanvasClick}
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