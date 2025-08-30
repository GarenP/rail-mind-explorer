import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Removed core game imports to avoid build errors - will integrate later

const availableMaps = [
  { key: "Australia", name: "Australia", description: "Perfect for economic testing" },
  { key: "Asia", name: "Asia", description: "Large landmass for expansion" },
  { key: "Europe", name: "Europe", description: "Dense network opportunities" },
  { key: "World", name: "World", description: "Global economic simulation" },
  { key: "Britannia", name: "Britannia", description: "Island economic focus" },
];

export default function EconomicSimulation() {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleMapSelect = (mapKey: string) => {
    setSelectedMap(mapKey);
  };

  const startSimulation = () => {
    if (selectedMap) {
      setGameStarted(true);
    }
  };

  if (gameStarted && selectedMap) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Economic Simulation - {selectedMap}
            </h1>
            <Button 
              variant="outline" 
              onClick={() => {
                setGameStarted(false);
                setSelectedMap(null);
              }}
            >
              Change Map
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Area */}
            <Card>
              <CardHeader>
                <CardTitle>Map View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                  <p className="text-muted-foreground">Map rendering will go here</p>
                </div>
              </CardContent>
            </Card>

            {/* Economic Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Economic Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Factory Stacking Test</h3>
                  <div className="flex gap-2">
                    <Button size="sm">Place Factory</Button>
                    <Button size="sm">Stack +1</Button>
                    <Button size="sm">Stack +5</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Money Per Minute</h3>
                  <div className="p-4 bg-muted/50 rounded">
                    <p className="text-2xl font-mono">$0.00/min</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Factory Status</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Individual Factories:</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Stacked Factories:</span>
                      <Badge variant="outline">0</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            OpenFrontIO Economic Simulation
          </h1>
          <p className="text-muted-foreground">
            Select a map to test factory stacking and economic strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {availableMaps.map((map) => (
            <Card 
              key={map.key}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedMap === map.key 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => handleMapSelect(map.key)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{map.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {map.description}
                </p>
                <div className="h-24 bg-muted/30 rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Map Preview</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={startSimulation}
            disabled={!selectedMap}
          >
            Start Economic Simulation
          </Button>
        </div>
      </div>
    </div>
  );
}