import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Canvas as FabricCanvas, Rect, Circle, FabricImage, FabricText } from 'fabric';

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
  terrain: number; // Terrain value from binary data
  magnitude: number; // Elevation data
  isShore: boolean;
  buildings: Building[];
}

// Terrain coloring based on game's PastelTheme
const TERRAIN_COLORS = {
  background: '#202c47', // Deep blue background
  water: '#3366bb', // Ocean blue
  shore: '#4a90e2', // Lighter shore blue
  land: {
    low: '#8fbc8f', // Dark sea green for low elevations
    medium: '#9acd32', // Yellow green for medium
    high: '#daa520', // Goldenrod for high elevations
    mountain: '#cd853f', // Peru/brown for mountains
  }
};

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
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const intervalRef = useRef<number | null>(null);
  const terrainDataRef = useRef<Uint8Array | null>(null);
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

  // Load real terrain data from game files
  useEffect(() => {
    const loadTerrainData = async () => {
      try {
        setGameState('loading');
        
        const config = mapConfigs[selectedMap];
        console.log('Loading terrain data for', selectedMap, 'with config:', config);
        
        // Try to load actual binary terrain data
        try {
          const response = await fetch(`/core/resources/maps/${selectedMap.toLowerCase()}/map.bin`);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            terrainDataRef.current = new Uint8Array(arrayBuffer);
            console.log('Loaded real terrain data:', terrainDataRef.current.length, 'bytes');
          } else {
            console.log('Real terrain data not available, generating procedural terrain');
            generateProceduralTerrain(config);
          }
        } catch (fetchError) {
          console.log('Could not fetch terrain data, generating procedural terrain');
          generateProceduralTerrain(config);
        }
        
        buildingsRef.current = [];
        
        // Setup Fabric.js canvas for realistic rendering
        setTimeout(() => {
          if (canvasRef.current) {
            setupRealisticCanvas();
          }
          setGameState('ready');
        }, 500);
        
      } catch (error) {
        console.error('Failed to load terrain data:', error);
        setGameState('error');
      }
    };

    loadTerrainData();
  }, [selectedMap]);

  const generateProceduralTerrain = (config: any) => {
    // Generate realistic terrain data that mimics Australia's shape and geography
    const width = 400; // Scaled down for display
    const height = 300;
    const terrainData = new Uint8Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        
        // Create Australia-like shape with realistic coastline
        const centerX = width * 0.5;
        const centerY = height * 0.4;
        
        // Distance from center with some randomness for coastline
        let distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        distFromCenter += (Math.random() - 0.5) * 20; // Coastline roughness
        
        // Australia-specific geographical features
        const isInMainland = distFromCenter < Math.min(width, height) * 0.35;
        const isTasmania = Math.sqrt((x - width * 0.6) ** 2 + (y - height * 0.85) ** 2) < 15;
        const isLand = isInMainland || isTasmania;
        
        if (isLand) {
          // Vary terrain elevation for realistic coloring
          const elevation = Math.random() * 255;
          const coastal = distFromCenter > Math.min(width, height) * 0.25;
          
          if (coastal) {
            terrainData[index] = Math.floor(50 + elevation * 0.3); // Coastal areas
          } else {
            terrainData[index] = Math.floor(100 + elevation * 0.6); // Inland areas
          }
        } else {
          terrainData[index] = 0; // Water
        }
      }
    }
    
    terrainDataRef.current = terrainData;
    console.log('Generated procedural Australia terrain:', terrainData.length, 'bytes');
  };

  const setupRealisticCanvas = () => {
    if (!canvasRef.current || !terrainDataRef.current) return;
    
    // Dispose of existing canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }
    
    // Create new Fabric.js canvas for high-quality rendering
    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: TERRAIN_COLORS.background,
      selection: false, // Disable object selection
      renderOnAddRemove: false, // Manual rendering control
    });
    
    fabricCanvasRef.current = fabricCanvas;
    
    renderRealisticTerrain();
    
    // Handle click events for building placement
    fabricCanvas.on('mouse:down', (event) => {
      if (event.e && terrainDataRef.current) {
        handleCanvasClick(event.e as MouseEvent);
      }
    });
  };

  const renderRealisticTerrain = () => {
    if (!fabricCanvasRef.current || !terrainDataRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const terrainData = terrainDataRef.current;
    
    // Clear existing terrain objects
    canvas.clear();
    canvas.backgroundColor = TERRAIN_COLORS.background;
    
    // Calculate dimensions based on terrain data
    const dataWidth = Math.sqrt(terrainData.length * 1.33); // Approximate width for Australia (4:3 ratio)
    const dataHeight = Math.floor(terrainData.length / dataWidth);
    
    console.log('Rendering terrain with dimensions:', dataWidth, 'x', dataHeight);
    
    // Create terrain as image data for performance
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = dataWidth;
    tempCanvas.height = dataHeight;
    
    const imageData = tempCtx.createImageData(dataWidth, dataHeight);
    
    // Process terrain data and apply realistic colors
    for (let i = 0; i < terrainData.length; i++) {
      const terrainValue = terrainData[i];
      const pixelIndex = i * 4;
      
      let color = { r: 0, g: 0, b: 0 };
      
      if (terrainValue === 0) {
        // Water
        color = { r: 51, g: 102, b: 187 }; // Ocean blue
      } else if (terrainValue < 30) {
        // Shore/shallow water
        color = { r: 74, g: 144, b: 226 }; // Shore blue
      } else if (terrainValue < 80) {
        // Low land - coastal plains
        color = { r: 143, g: 188, b: 143 }; // Dark sea green
      } else if (terrainValue < 120) {
        // Medium elevation
        color = { r: 154, g: 205, b: 50 }; // Yellow green
      } else if (terrainValue < 180) {
        // Higher elevation
        color = { r: 218, g: 165, b: 32 }; // Goldenrod
      } else {
        // Mountains/high elevation
        color = { r: 205, g: 133, b: 63 }; // Peru/brown
      }
      
      imageData.data[pixelIndex] = color.r;
      imageData.data[pixelIndex + 1] = color.g;
      imageData.data[pixelIndex + 2] = color.b;
      imageData.data[pixelIndex + 3] = 255; // Alpha
    }
    
    tempCtx.putImageData(imageData, 0, 0);
    
    // Create Fabric image from the terrain data
    const terrainImage = new Image();
    terrainImage.onload = () => {
      const fabricImage = new FabricImage(terrainImage, {
        left: 0,
        top: 0,
        scaleX: canvas.width / dataWidth,
        scaleY: canvas.height / dataHeight,
        selectable: false,
        evented: false,
      });
      
      canvas.add(fabricImage);
      renderBuildings();
      canvas.renderAll();
    };
    
    terrainImage.src = tempCanvas.toDataURL();
  };

  const renderBuildings = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const buildings = buildingsRef.current;
    
    // Remove existing building objects (remove all objects with data-type)
    const objectsToRemove = canvas.getObjects().filter(obj => 
      (obj as any).dataType && (obj as any).dataType.startsWith('building')
    );
    objectsToRemove.forEach(obj => canvas.remove(obj));
    
    buildings.forEach((building) => {
      const x = (building.x / 400) * canvas.width; // Scale coordinates
      const y = (building.y / 300) * canvas.height;
      
      // Stack offset for multiple buildings on same tile
      const buildingsOnTile = buildings.filter(b => b.x === building.x && b.y === building.y);
      const stackIndex = buildingsOnTile.findIndex(b => b.id === building.id);
      const offset = stackIndex * 5;
      
      let fabricObject;
      
      // Different shapes for different building types
      switch (building.type) {
        case UnitType.Factory:
          fabricObject = new Rect({
            left: x + offset,
            top: y + offset,
            width: 12,
            height: 12,
            fill: '#dc2626',
            stroke: '#ffffff',
            strokeWidth: 1,
            selectable: false,
            evented: false,
          });
          (fabricObject as any).dataType = `building-${building.id}`;
          break;
        case UnitType.City:
          fabricObject = new Circle({
            left: x + offset,
            top: y + offset,
            radius: 8,
            fill: '#7c3aed',
            stroke: '#ffffff',
            strokeWidth: 1,
            selectable: false,
            evented: false,
          });
          (fabricObject as any).dataType = `building-${building.id}`;
          break;
        case UnitType.Port:
          fabricObject = new Rect({
            left: x + offset,
            top: y + offset,
            width: 14,
            height: 8,
            fill: '#0891b2',
            stroke: '#ffffff',
            strokeWidth: 1,
            selectable: false,
            evented: false,
          });
          (fabricObject as any).dataType = `building-${building.id}`;
          break;
      }
      
      if (fabricObject) {
        canvas.add(fabricObject);
        
        // Add count label for stacked buildings
        if (buildingsOnTile.length > 1 && stackIndex === 0) {
          const textObj = new FabricText(buildingsOnTile.length.toString(), {
            left: x + 15,
            top: y - 5,
            fontSize: 12,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 0.5,
            selectable: false,
            evented: false,
          });
          (textObj as any).dataType = `building-count-${building.x}-${building.y}`;
          canvas.add(textObj);
        }
      }
    });
    
    // Highlight selected tile
    if (selectedTile) {
      const tileX = (selectedTile.x / 400) * canvas.width;
      const tileY = (selectedTile.y / 300) * canvas.height;
      
      const highlight = new Rect({
        left: tileX - 10,
        top: tileY - 10,
        width: 20,
        height: 20,
        fill: 'transparent',
        stroke: '#fbbf24',
        strokeWidth: 3,
        selectable: false,
        evented: false,
      });
      (highlight as any).dataType = 'tile-highlight';
      
      canvas.add(highlight);
    }
    
    canvas.renderAll();
  };

  const handleCanvasClick = (event: MouseEvent) => {
    if (!fabricCanvasRef.current || !terrainDataRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const canvasElement = canvas.getElement();
    const rect = canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert screen coordinates to terrain coordinates
    const terrainX = Math.floor((x / canvas.width) * 400);
    const terrainY = Math.floor((y / canvas.height) * 300);
    
    // Check if clicking on land (terrain value > 0)
    const terrainIndex = terrainY * 400 + terrainX;
    if (terrainIndex < terrainDataRef.current.length) {
      const terrainValue = terrainDataRef.current[terrainIndex];
      
      if (terrainValue > 0) { // Only allow building on land
        setSelectedTile({ x: terrainX, y: terrainY });
        setShowBuildMenu(true);
        renderBuildings(); // Re-render to show selection
      }
    }
  };

  const buildUnit = (unitType: UnitType) => {
    if (!selectedTile || !terrainDataRef.current) return;
    
    // Check if trying to build on land
    const terrainIndex = selectedTile.y * 400 + selectedTile.x;
    if (terrainIndex >= terrainDataRef.current.length) {
      console.log('Invalid tile coordinates');
      setShowBuildMenu(false);
      return;
    }
    
    const terrainValue = terrainDataRef.current[terrainIndex];
    if (terrainValue === 0) {
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
    renderBuildings();
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
      renderBuildings();
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