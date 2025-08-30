import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EconomicSimulator, GameMapType } from "@/components/EconomicSimulator";

const availableMaps = [
  { key: GameMapType.Australia, name: "Australia", description: "Perfect for economic testing" },
  { key: GameMapType.Asia, name: "Asia", description: "Large landmass for expansion" },
  { key: GameMapType.Europe, name: "Europe", description: "Dense network opportunities" },
  { key: GameMapType.World, name: "World", description: "Global economic simulation" },
  { key: GameMapType.Britannia, name: "Britannia", description: "Island economic focus" },
];

export default function EconomicSimulation() {
  const [selectedMap, setSelectedMap] = useState<GameMapType | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleMapSelect = (mapKey: GameMapType) => {
    setSelectedMap(mapKey);
  };

  const startSimulation = () => {
    if (selectedMap) {
      setGameStarted(true);
    }
  };

  const handleBack = () => {
    setGameStarted(false);
    setSelectedMap(null);
  };

  if (gameStarted && selectedMap) {
    return <EconomicSimulator selectedMap={selectedMap} onBack={handleBack} />;
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