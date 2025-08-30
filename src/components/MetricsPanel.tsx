import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface TrainMetric {
  id: string;
  route: string;
  status: "moving" | "loading" | "unloading" | "idle";
  cargo: number;
  efficiency: number;
}

export const MetricsPanel = () => {
  const [trains, setTrains] = useState<TrainMetric[]>([
    { id: "T001", route: "S1→S2", status: "moving", cargo: 85, efficiency: 92 },
    { id: "T002", route: "F1→S1", status: "loading", cargo: 45, efficiency: 87 },
    { id: "T003", route: "S2→S3", status: "moving", cargo: 100, efficiency: 95 },
    { id: "T004", route: "S3→F2", status: "unloading", cargo: 30, efficiency: 78 },
  ]);

  const [networkStats, setNetworkStats] = useState({
    totalTrains: 24,
    activeRoutes: 8,
    averageEfficiency: 88,
    totalCargo: 1240,
    goldPerHour: 2340
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrains(prevTrains => 
        prevTrains.map(train => ({
          ...train,
          efficiency: Math.max(70, Math.min(100, train.efficiency + (Math.random() - 0.5) * 4)),
          cargo: train.status === "loading" 
            ? Math.min(100, train.cargo + Math.random() * 5)
            : train.status === "unloading"
            ? Math.max(0, train.cargo - Math.random() * 8)
            : train.cargo
        }))
      );

      setNetworkStats(prev => ({
        ...prev,
        averageEfficiency: Math.max(80, Math.min(95, prev.averageEfficiency + (Math.random() - 0.5) * 2)),
        goldPerHour: Math.max(2000, Math.min(3000, prev.goldPerHour + (Math.random() - 0.5) * 100))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: TrainMetric["status"]) => {
    const colors = {
      moving: "bg-primary text-primary-foreground",
      loading: "bg-warning text-warning-foreground", 
      unloading: "bg-accent text-accent-foreground",
      idle: "bg-muted text-muted-foreground"
    };
    return colors[status];
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-success";
    if (efficiency >= 75) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            📊 Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Network Efficiency</span>
              <span className={`font-semibold ${getEfficiencyColor(networkStats.averageEfficiency)}`}>
                {networkStats.averageEfficiency}%
              </span>
            </div>
            <Progress value={networkStats.averageEfficiency} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Active Routes</span>
                <div className="font-semibold text-primary">{networkStats.activeRoutes}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Cargo</span>
                <div className="font-semibold text-accent">{networkStats.totalCargo}t</div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-3 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Gold Income Rate</div>
              <div className="text-xl font-bold text-warning">
                ₿ {networkStats.goldPerHour.toLocaleString()}/hr
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Trains */}
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            🚂 Active Trains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trains.map((train) => (
              <div key={train.id} className="bg-secondary/20 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {train.id}
                    </span>
                    <Badge className={`text-xs ${getStatusColor(train.status)}`}>
                      {train.status}
                    </Badge>
                  </div>
                  <span className={`text-sm font-semibold ${getEfficiencyColor(train.efficiency)}`}>
                    {train.efficiency}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Route: {train.route}</span>
                  <span>Cargo: {train.cargo}%</span>
                </div>
                
                <div className="flex gap-2">
                  <Progress value={train.cargo} className="flex-1 h-1" />
                  <Progress value={train.efficiency} className="flex-1 h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            ⚡ Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Avg. Load Time</span>
              <span className="font-semibold text-accent">2.4 min</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Network Uptime</span>
              <span className="font-semibold text-success">99.7%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Maintenance Due</span>
              <span className="font-semibold text-warning">3 stations</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Peak Hours</span>
              <span className="font-semibold text-primary">14:00-18:00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};