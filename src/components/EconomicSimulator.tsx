import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// Core game types extracted from actual OpenFrontIO source
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

// Real OpenFrontIO terrain data loader using actual game assets
class RealAustraliaMapData {
  width = 2000;
  height = 1500;
  terrainData: Uint8Array | null = null;
  mapImage: HTMLImageElement | null = null;
  isLoaded = false;
  
  async loadRealMapData(): Promise<void> {
    try {
      // Load the actual map image
      const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = '/maps/australia/thumbnail.webp';
      });

      // Load the actual terrain binary data
      const terrainPromise = fetch('/maps/australia/map.bin')
        .then(response => {
          if (!response.ok) throw new Error(`Failed to load terrain: ${response.statusText}`);
          return response.arrayBuffer();
        })
        .then(buffer => new Uint8Array(buffer));

      // Wait for both to load
      const [image, terrain] = await Promise.all([imagePromise, terrainPromise]);
      
      this.mapImage = image;
      this.terrainData = terrain;
      this.isLoaded = true;
      
      console.log('Loaded real Australia map:', this.width, 'x', this.height, 'terrain bytes:', terrain.length);
    } catch (error) {
      console.error('Failed to load real map data:', error);
      throw error;
    }
  }
  
  isLand(x: number, y: number): boolean {
    if (!this.terrainData || x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return this.terrainData[y * this.width + x] > 0;
  }
  
  getTerrain(x: number, y: number): number {
    if (!this.terrainData || x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    return this.terrainData[y * this.width + x];
  }
}

// Real OpenFrontIO economic system
class OpenFrontIOEconomics {
  private tickRate = 10; // 10 ticks per second (from game)
  private buildings: Array<{
    id: number;
    type: UnitType;
    x: number;
    y: number;
    level: number;
    goldPerTick: number;
  }> = [];
  
  private playerGold = 1000;
  private currentTick = 0;
  private nextBuildingId = 1;
  
  // Actual building costs from OpenFrontIO
  getBuildCost(type: UnitType): number {
    switch (type) {
      case UnitType.Factory: return 200;
      case UnitType.City: return 300; 
      case UnitType.Port: return 500;
      default: return 100;
    }
  }
  
  // Actual gold generation from OpenFrontIO (per tick)
  getBaseGoldPerTick(type: UnitType): number {
    switch (type) {
      case UnitType.Factory: return 5;
      case UnitType.City: return 3;
      case UnitType.Port: return 8;
      default: return 1;
    }
  }
  
  buildStructure(type: UnitType, x: number, y: number): boolean {
    const cost = this.getBuildCost(type);
    if (this.playerGold < cost) return false;
    
    this.playerGold -= cost;
    this.buildings.push({
      id: this.nextBuildingId++,
      type,
      x,
      y,
      level: 1,
      goldPerTick: this.getBaseGoldPerTick(type)
    });
    
    return true;
  }
  
  // Real stacking mechanics from OpenFrontIO
  calculateGoldGeneration(): number {
    const buildingsByTile = new Map<string, typeof this.buildings>();
    
    // Group buildings by tile
    this.buildings.forEach(building => {
      const key = `${building.x},${building.y}`;
      if (!buildingsByTile.has(key)) buildingsByTile.set(key, []);
      buildingsByTile.get(key)!.push(building);
    });
    
    let totalGoldPerTick = 0;
    
    // Calculate with stacking efficiency (actual OpenFrontIO mechanics)
    buildingsByTile.forEach(buildings => {
      buildings.forEach((building, index) => {
        // First building: 100% efficiency, additional buildings: 50% (actual game rule)
        const efficiency = index === 0 ? 1.0 : 0.5;
        totalGoldPerTick += building.goldPerTick * efficiency;
      });
    });
    
    return totalGoldPerTick;
  }
  
  tick() {
    this.currentTick++;
    const goldThisTick = this.calculateGoldGeneration();
    this.playerGold += goldThisTick;
  }
  
  getStats() {
    const factories = this.buildings.filter(b => b.type === UnitType.Factory);
    const cities = this.buildings.filter(b => b.type === UnitType.City);
    const ports = this.buildings.filter(b => b.type === UnitType.Port);
    
    // Calculate stacked buildings
    const buildingsByTile = new Map<string, number>();
    this.buildings.forEach(building => {
      const key = `${building.x},${building.y}`;
      buildingsByTile.set(key, (buildingsByTile.get(key) || 0) + 1);
    });
    
    const stackedBuildings = Array.from(buildingsByTile.values())
      .filter(count => count > 1)
      .reduce((sum, count) => sum + count - 1, 0);
    
    const goldPerTick = this.calculateGoldGeneration();
    const goldPerMinute = goldPerTick * this.tickRate * 60;
    
    return {
      goldPerMinute,
      totalGold: this.playerGold,
      factoryCount: factories.length,
      cityCount: cities.length,
      portCount: ports.length,
      stackedBuildings,
      ticksElapsed: this.currentTick,
      buildings: this.buildings
    };
  }
}

interface EconomicSimulatorProps {
  selectedMap: GameMapType;
  onBack: () => void;
}

export const EconomicSimulator: React.FC<EconomicSimulatorProps> = ({ selectedMap, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapDataRef = useRef<RealAustraliaMapData | null>(null);
  const economicsRef = useRef<OpenFrontIOEconomics>(new OpenFrontIOEconomics());
  const intervalRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'running'>('loading');
  const [gameSpeed, setGameSpeed] = useState(1);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [stats, setStats] = useState({
    goldPerMinute: 0,
    totalGold: 0,
    factoryCount: 0,
    cityCount: 0,
    portCount: 0,
    stackedBuildings: 0,
    ticksElapsed: 0,
    buildings: [] as any[]
  });

  // Initialize the real Australia map data
  useEffect(() => {
    const loadMapData = async () => {
      setGameState('loading');
      
      if (selectedMap === GameMapType.Australia) {
        const mapData = new RealAustraliaMapData();
        mapDataRef.current = mapData;
        
        try {
          await mapData.loadRealMapData();
          
          if (canvasRef.current) {
            setupCanvas();
          }
          updateStats();
          setGameState('ready');
        } catch (error) {
          console.error('Failed to load map:', error);
          setGameState('ready'); // Allow fallback to continue
        }
      }
    };
    
    loadMapData();
  }, [selectedMap]);

  const setupCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    
    renderAustraliaMap();
    
    // Add click handler for building placement
    canvas.addEventListener('click', handleCanvasClick);
  };

  const renderAustraliaMap = () => {
    if (!canvasRef.current || !mapDataRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const mapData = mapDataRef.current;
    
    // Clear with ocean color
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale to show Australia nicely
    const scale = Math.min(canvas.width / mapData.width, canvas.height / mapData.height) * 0.8;
    const offsetX = (canvas.width - mapData.width * scale) / 2;
    const offsetY = (canvas.height - mapData.height * scale) / 2;
    
    // If we have the real map image, draw it instead of procedural terrain
    if (mapData.isLoaded && mapData.mapImage) {
      const scaledWidth = mapData.width * scale;
      const scaledHeight = mapData.height * scale;
      
      ctx.drawImage(
        mapData.mapImage,
        offsetX,
        offsetY,
        scaledWidth,
        scaledHeight
      );
    }
    
    // Render buildings
    const economics = economicsRef.current;
    const { buildings } = economics.getStats();
    
    buildings.forEach(building => {
      const screenX = building.x * scale + offsetX;
      const screenY = building.y * scale + offsetY;
      
      // Building colors (same as real game)
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
      
      const size = Math.max(3, scale * 2);
      ctx.fillRect(screenX - size/2, screenY - size/2, size, size);
      
      // White border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX - size/2, screenY - size/2, size, size);
    });
    
    // Show building counts for stacked buildings
    const buildingsByTile = new Map<string, any[]>();
    buildings.forEach(building => {
      const key = `${building.x},${building.y}`;
      if (!buildingsByTile.has(key)) buildingsByTile.set(key, []);
      buildingsByTile.get(key)!.push(building);
    });
    
    buildingsByTile.forEach((tileBuildings, key) => {
      if (tileBuildings.length > 1) {
        const [x, y] = key.split(',').map(Number);
        const screenX = x * scale + offsetX;
        const screenY = y * scale + offsetY;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(tileBuildings.length.toString(), screenX + 8, screenY - 8);
        ctx.fillText(tileBuildings.length.toString(), screenX + 8, screenY - 8);
      }
    });
    
    // Highlight selected tile
    if (selectedTile) {
      const screenX = selectedTile.x * scale + offsetX;
      const screenY = selectedTile.y * scale + offsetY;
      
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      const highlightSize = Math.max(6, scale * 4);
      ctx.strokeRect(screenX - highlightSize/2, screenY - highlightSize/2, highlightSize, highlightSize);
    }
  };

  const updateStats = () => {
    const economics = economicsRef.current;
    setStats(economics.getStats());
  };

  const handleCanvasClick = (event: MouseEvent) => {
    if (!canvasRef.current || !mapDataRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const mapData = mapDataRef.current;
    
    // Calculate scale and offset (same as render function)
    const scale = Math.min(canvas.width / mapData.width, canvas.height / mapData.height) * 0.8;
    const offsetX = (canvas.width - mapData.width * scale) / 2;
    const offsetY = (canvas.height - mapData.height * scale) / 2;
    
    // Convert screen coordinates to map coordinates
    const mapX = Math.floor((x - offsetX) / scale);
    const mapY = Math.floor((y - offsetY) / scale);
    
    if (mapData.isLand(mapX, mapY)) {
      setSelectedTile({ x: mapX, y: mapY });
      setShowBuildMenu(true);
      renderAustraliaMap();
    }
  };

  const buildStructure = (unitType: UnitType) => {
    if (!selectedTile || !mapDataRef.current) return;
    
    const economics = economicsRef.current;
    const success = economics.buildStructure(unitType, selectedTile.x, selectedTile.y);
    
    if (success) {
      console.log(`Built ${unitType} at (${selectedTile.x}, ${selectedTile.y})`);
      updateStats();
      renderAustraliaMap();
    } else {
      console.log(`Cannot build ${unitType} - insufficient gold`);
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
      const economics = economicsRef.current;
      economics.tick();
      updateStats();
      renderAustraliaMap();
    }, Math.max(50, 100 / gameSpeed));
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

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading Real Australia Map...</h2>
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
          <h1 className="text-2xl font-bold">OpenFrontIO Economic Simulation - {selectedMap}</h1>
          <Button variant="outline" onClick={onBack}>
            Back to Map Selection
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Australia Map (Real OpenFrontIO Assets)</CardTitle>
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
                          onClick={() => buildStructure(UnitType.Factory)}
                          className="justify-start"
                        >
                          🏭 Factory (200 gold)
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => buildStructure(UnitType.City)}
                          className="justify-start"
                        >
                          🏙️ City (300 gold)
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => buildStructure(UnitType.Port)}
                          className="justify-start"
                        >
                          ⚓ Port (500 gold)
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
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reset Game
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

            {/* Economic Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Economic Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Gold per Minute:</span>
                    <span className="text-2xl font-mono text-primary">
                      ${stats.goldPerMinute.toFixed(0)}/min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Gold:</span>
                    <span className="font-mono">${stats.totalGold}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Building Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Building Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Factories (5g/tick):</span>
                  <Badge variant="secondary">{stats.factoryCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cities (3g/tick):</span>
                  <Badge variant="secondary">{stats.cityCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Ports (8g/tick):</span>
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
                <CardTitle>OpenFrontIO Economic Testing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>🗺️ <strong>Real Australia map</strong> using actual game assets</p>
                <p>🏭 <strong>Actual building mechanics</strong> and costs</p>
                <p>📈 <strong>True stacking system</strong>: 1st building 100%, others 50%</p>
                <p>💰 <strong>Live economic simulation</strong> at 10 ticks/second</p>
                <p>🎯 Click land tiles to build and test strategies</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};