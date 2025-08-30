import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { FactoryData, RailNetworkData } from '@/types/GameData';
import { Factory, TrendingUp, Network, AlertTriangle } from 'lucide-react';

interface FactoryMonitoringProps {
  factories: FactoryData[];
  railNetwork: RailNetworkData;
}

export function FactoryMonitoring({ factories, railNetwork }: FactoryMonitoringProps) {
  const totalProduction = factories.reduce((sum, factory) => sum + factory.productionRate, 0);
  const averageEfficiency = factories.reduce((sum, factory) => sum + factory.efficiency, 0) / factories.length;
  const totalConnectedStations = factories.reduce((sum, factory) => sum + factory.connectedStations, 0);

  // Factory performance data for charts
  const factoryPerformanceData = factories.map((factory, index) => ({
    name: `Factory ${index + 1}`,
    id: factory.id,
    production: factory.productionRate,
    efficiency: factory.efficiency * 100,
    level: factory.level,
    connections: factory.connectedStations,
  }));

  // Efficiency vs Production scatter plot data
  const efficiencyProductionData = factories.map((factory, index) => ({
    x: factory.efficiency * 100,
    y: factory.productionRate,
    name: `Factory ${index + 1}`,
    level: factory.level,
  }));

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.8) return 'text-green-600';
    if (efficiency >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyStatus = (efficiency: number) => {
    if (efficiency >= 0.8) return 'optimal';
    if (efficiency >= 0.6) return 'moderate';
    return 'poor';
  };

  return (
    <div className="space-y-6">
      {/* Factory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Factories</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{factories.length}</div>
            <p className="text-xs text-muted-foreground">
              Active production facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProduction}</div>
            <p className="text-xs text-muted-foreground">
              Units per turn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageEfficiency * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rail Connections</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConnectedStations}</div>
            <p className="text-xs text-muted-foreground">
              Total station links
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Factory Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Factory Production Rates</CardTitle>
            <CardDescription>
              Production output comparison across all factories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={factoryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Production Rate', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="production" 
                  fill="hsl(var(--primary))" 
                  name="Production Rate"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency vs Production</CardTitle>
            <CardDescription>
              Relationship between efficiency and production output
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={efficiencyProductionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  stroke="hsl(var(--muted-foreground))"
                  domain={[0, 100]}
                  label={{ value: 'Efficiency (%)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Production Rate', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'y' ? `${value} units/turn` : `${value}%`,
                    name === 'y' ? 'Production' : 'Efficiency'
                  ]}
                />
                <Scatter 
                  dataKey="y" 
                  fill="hsl(var(--primary))"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Factory Details */}
      <Card>
        <CardHeader>
          <CardTitle>Factory Performance Details</CardTitle>
          <CardDescription>
            Detailed analysis of each factory's performance and connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {factories.map((factory, index) => (
              <div key={factory.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Factory className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Factory {index + 1}</h4>
                      <p className="text-sm text-muted-foreground">
                        Position: ({factory.position.x}, {factory.position.y})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Level {factory.level}</Badge>
                    <Badge 
                      variant={getEfficiencyStatus(factory.efficiency) === 'optimal' ? 'default' : 
                              getEfficiencyStatus(factory.efficiency) === 'moderate' ? 'secondary' : 'destructive'}
                    >
                      {Math.round(factory.efficiency * 100)}% Efficiency
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Production Rate</div>
                    <div className="text-lg font-medium">{factory.productionRate} units/turn</div>
                    <Progress 
                      value={(factory.productionRate / Math.max(...factories.map(f => f.productionRate))) * 100} 
                      className="h-2 mt-1"
                    />
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Efficiency</div>
                    <div className={`text-lg font-medium ${getEfficiencyColor(factory.efficiency)}`}>
                      {Math.round(factory.efficiency * 100)}%
                    </div>
                    <Progress 
                      value={factory.efficiency * 100} 
                      className="h-2 mt-1"
                    />
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Connected Stations</div>
                    <div className="text-lg font-medium">{factory.connectedStations}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Railway connections
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Owner: <span className="font-medium">{factory.owner}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <span className={`font-medium ${getEfficiencyColor(factory.efficiency)}`}>
                      {getEfficiencyStatus(factory.efficiency).charAt(0).toUpperCase() + 
                       getEfficiencyStatus(factory.efficiency).slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Factory Network Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Analysis</CardTitle>
          <CardDescription>
            Factory connectivity and supply chain efficiency metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Connectivity Distribution</h4>
              {[1, 2, 3, 4, 5].map(connectionCount => {
                const factoriesWithConnections = factories.filter(
                  f => f.connectedStations === connectionCount
                ).length;
                const percentage = (factoriesWithConnections / factories.length) * 100;
                
                return (
                  <div key={connectionCount} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{connectionCount} connection{connectionCount > 1 ? 's' : ''}</span>
                      <span>{factoriesWithConnections} factories ({Math.round(percentage)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Highest Production:</span>
                  <span className="font-medium">{Math.max(...factories.map(f => f.productionRate))} units/turn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lowest Production:</span>
                  <span className="font-medium">{Math.min(...factories.map(f => f.productionRate))} units/turn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Best Efficiency:</span>
                  <span className="font-medium">{Math.round(Math.max(...factories.map(f => f.efficiency)) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Production Variance:</span>
                  <span className="font-medium">
                    {Math.round(Math.max(...factories.map(f => f.productionRate)) - 
                                Math.min(...factories.map(f => f.productionRate)))} units
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}