import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameAnalytics } from '@/types/GameData';
import { Users, Network, DollarSign, Factory, Clock, TrendingUp } from 'lucide-react';

interface GameMetricsOverviewProps {
  gameData: GameAnalytics;
}

export function GameMetricsOverview({ gameData }: GameMetricsOverviewProps) {
  const { players, railNetwork, economicData, factoryData } = gameData;
  
  const totalStations = railNetwork.stations.length;
  const totalRailroads = railNetwork.railroads.length;
  const totalFactories = factoryData.length;
  const networkConnectivity = totalRailroads / Math.max(totalStations - 1, 1);
  const avgFactoryEfficiency = factoryData.reduce((sum, f) => sum + f.efficiency, 0) / factoryData.length;

  const getNetworkHealthColor = () => {
    if (networkConnectivity >= 0.8) return 'text-green-600';
    if (networkConnectivity >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNetworkHealthStatus = () => {
    if (networkConnectivity >= 0.8) return 'Excellent';
    if (networkConnectivity >= 0.5) return 'Good';
    return 'Poor';
  };

  return (
    <div className="space-y-4">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
            <p className="text-xs text-muted-foreground">
              Active players
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stations</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStations}</div>
            <p className="text-xs text-muted-foreground">
              Railway stations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicData.totalGold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total gold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factories</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFactories}</div>
            <p className="text-xs text-muted-foreground">
              Production facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connectivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNetworkHealthColor()}`}>
              {Math.round(networkConnectivity * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Network density
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgFactoryEfficiency * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Avg factory efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Game Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Health</CardTitle>
            <CardDescription>Overall railway network analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge 
                variant={getNetworkHealthStatus() === 'Excellent' ? 'default' : 
                        getNetworkHealthStatus() === 'Good' ? 'secondary' : 'destructive'}
              >
                {getNetworkHealthStatus()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Railroads:</span>
                <span>{totalRailroads}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Clusters:</span>
                <span>{railNetwork.clusters.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Cluster Size:</span>
                <span>
                  {Math.round(railNetwork.clusters.reduce((sum, c) => sum + c.size, 0) / railNetwork.clusters.length)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Economic Summary</CardTitle>
            <CardDescription>Current economic performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gold per Turn:</span>
                <span className="font-medium">+{economicData.goldPerTurn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Train Revenue:</span>
                <span>{economicData.trainRevenue}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Factory Output:</span>
                <span>{economicData.factoryProduction}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trade Volume:</span>
                <span>{economicData.tradeVolume}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Player Status</CardTitle>
            <CardDescription>Current player standings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' 
                    }}
                  />
                  <span className="text-sm font-medium">{player.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{player.gold} gold</div>
                  <div className="text-xs text-muted-foreground">
                    {player.units} units, {player.territories} territories
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}