import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { EconomicData, Player } from '@/types/GameData';
import { DollarSign, TrendingUp, Factory, Train } from 'lucide-react';

interface EconomicAnalyticsProps {
  economicData: EconomicData;
  players: Player[];
}

export function EconomicAnalytics({ economicData, players }: EconomicAnalyticsProps) {
  // Mock historical data for charts
  const goldTrendData = [
    { turn: 1, player1: 1000, player2: 1000, total: 2000 },
    { turn: 5, player1: 1200, player2: 1100, total: 2300 },
    { turn: 10, player1: 1400, player2: 1250, total: 2650 },
    { turn: 15, player1: 1500, player2: 1200, total: 2700 },
    { turn: 20, player1: 1650, player2: 1350, total: 3000 },
  ];

  const revenueBreakdown = [
    { name: 'Train Revenue', value: economicData.trainRevenue, color: '#8884d8' },
    { name: 'Factory Production', value: economicData.factoryProduction, color: '#82ca9d' },
    { name: 'Trade Volume', value: economicData.tradeVolume, color: '#ffc658' },
  ];

  const playerEconomyData = players.map(player => ({
    name: player.name,
    gold: player.gold,
    units: player.units,
    territories: player.territories,
  }));

  const totalRevenue = economicData.trainRevenue + economicData.factoryProduction + economicData.tradeVolume;

  return (
    <div className="space-y-6">
      {/* Economic Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gold</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicData.totalGold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{economicData.goldPerTurn} per turn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Train Revenue</CardTitle>
            <Train className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicData.trainRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((economicData.trainRevenue / totalRevenue) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factory Output</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicData.factoryProduction}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((economicData.factoryProduction / totalRevenue) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trade Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{economicData.tradeVolume}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((economicData.tradeVolume / totalRevenue) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gold Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Gold Accumulation Over Time</CardTitle>
            <CardDescription>
              Track gold growth for each player throughout the game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={goldTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="turn" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Game Turn', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Gold', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="player1" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Player 1"
                />
                <Line 
                  type="monotone" 
                  dataKey="player2" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Player 2"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Total Economy"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
            <CardDescription>
              Breakdown of income by source type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Player Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Player Economic Comparison</CardTitle>
          <CardDescription>
            Comparative analysis of player economic performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={playerEconomyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="gold" fill="hsl(var(--primary))" name="Gold" />
              <Bar dataKey="units" fill="hsl(var(--secondary))" name="Units" />
              <Bar dataKey="territories" fill="hsl(var(--accent))" name="Territories" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Economic Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Economic Efficiency</CardTitle>
            <CardDescription>
              Key performance indicators for economic management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Gold per Turn Efficiency</span>
                <span>{Math.round((economicData.goldPerTurn / economicData.totalGold) * 1000)}%</span>
              </div>
              <Progress value={(economicData.goldPerTurn / economicData.totalGold) * 1000} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Train Revenue Ratio</span>
                <span>{Math.round((economicData.trainRevenue / totalRevenue) * 100)}%</span>
              </div>
              <Progress value={(economicData.trainRevenue / totalRevenue) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Factory Productivity</span>
                <span>{Math.round((economicData.factoryProduction / totalRevenue) * 100)}%</span>
              </div>
              <Progress value={(economicData.factoryProduction / totalRevenue) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Distribution</CardTitle>
            <CardDescription>
              Analysis of resource allocation across players
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {players.map((player, index) => (
              <div key={player.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{player.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {player.gold} gold ({player.territories} territories)
                  </span>
                </div>
                <Progress 
                  value={(player.gold / economicData.totalGold) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}