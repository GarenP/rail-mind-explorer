import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameAnalytics } from '@/types/GameData';
import { GameDataExtractor } from '@/utils/GameDataExtractor';
import { RailNetworkVisualization } from './visualizations/RailNetworkVisualization';
import { EconomicAnalytics } from './analytics/EconomicAnalytics';
import { FactoryMonitoring } from './monitoring/FactoryMonitoring';
import { GameMetricsOverview } from './overview/GameMetricsOverview';
import { Activity, Network, DollarSign, Factory } from 'lucide-react';

export function GameDataDashboard() {
  const [gameData, setGameData] = useState<GameAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading game data
    const loadGameData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would connect to the game server
        // or read from archived game data
        const mockGameState = {}; // This would be actual game state
        const analytics = GameDataExtractor.extractGameAnalytics(mockGameState);
        setGameData(analytics);
      } catch (error) {
        console.error('Failed to load game data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>No Game Data Available</CardTitle>
            <CardDescription>
              Unable to load game analytics data. Please check your connection to the game server.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OpenFrontIO Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive data mining dashboard for RTS game analysis
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Game ID: {gameData.id} | Last Updated: {new Date(gameData.timestamp).toLocaleTimeString()}
        </div>
      </div>

      <GameMetricsOverview gameData={gameData} />

      <Tabs defaultValue="network" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Railway Network
          </TabsTrigger>
          <TabsTrigger value="economics" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Economics
          </TabsTrigger>
          <TabsTrigger value="factories" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Factories
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <RailNetworkVisualization railNetwork={gameData.railNetwork} />
        </TabsContent>

        <TabsContent value="economics" className="space-y-4">
          <EconomicAnalytics 
            economicData={gameData.economicData} 
            players={gameData.players}
          />
        </TabsContent>

        <TabsContent value="factories" className="space-y-4">
          <FactoryMonitoring 
            factories={gameData.factoryData}
            railNetwork={gameData.railNetwork}
          />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Game Events</CardTitle>
              <CardDescription>
                Live monitoring of game events and player actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Real-time monitoring will be implemented in Phase 5
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}