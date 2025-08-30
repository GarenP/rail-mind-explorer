import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Factory {
  id: string;
  name: string;
  type: "production" | "processing" | "assembly";
  status: "running" | "idle" | "maintenance" | "error";
  efficiency: number;
  output: number;
  capacity: number;
  connectedStations: string[];
  lastMaintenance: string;
}

export const FactoryMonitor = () => {
  const [factories, setFactories] = useState<Factory[]>([
    {
      id: "F001",
      name: "Steel Mill Alpha",
      type: "production",
      status: "running",
      efficiency: 92,
      output: 340,
      capacity: 400,
      connectedStations: ["S1", "S4"],
      lastMaintenance: "2024-01-15"
    },
    {
      id: "F002", 
      name: "Coal Processing Beta",
      type: "processing",
      status: "running",
      efficiency: 87,
      output: 280,
      capacity: 350,
      connectedStations: ["S2", "S3"],
      lastMaintenance: "2024-01-20"
    },
    {
      id: "F003",
      name: "Assembly Plant Gamma",
      type: "assembly",
      status: "maintenance",
      efficiency: 0,
      output: 0,
      capacity: 500,
      connectedStations: ["S5"],
      lastMaintenance: "2024-01-25"
    },
    {
      id: "F004",
      name: "Ore Refinery Delta",
      type: "processing",
      status: "running",
      efficiency: 95,
      output: 190,
      capacity: 200,
      connectedStations: ["S6", "S7"],
      lastMaintenance: "2024-01-18"
    },
    {
      id: "F005",
      name: "Component Factory Epsilon",
      type: "production",
      status: "error",
      efficiency: 0,
      output: 0,
      capacity: 300,
      connectedStations: ["S8"],
      lastMaintenance: "2024-01-12"
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFactories(prevFactories =>
        prevFactories.map(factory => {
          if (factory.status === "running") {
            return {
              ...factory,
              efficiency: Math.max(80, Math.min(100, factory.efficiency + (Math.random() - 0.5) * 3)),
              output: Math.max(0, Math.min(factory.capacity, factory.output + (Math.random() - 0.5) * 20))
            };
          }
          return factory;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Factory["status"]) => {
    const colors = {
      running: "bg-success text-success-foreground",
      idle: "bg-muted text-muted-foreground",
      maintenance: "bg-warning text-warning-foreground",
      error: "bg-destructive text-destructive-foreground"
    };
    return colors[status];
  };

  const getTypeIcon = (type: Factory["type"]) => {
    const icons = {
      production: "⚙️",
      processing: "🔄",
      assembly: "🏗️"
    };
    return icons[type];
  };

  const totalOutput = factories.reduce((sum, factory) => sum + factory.output, 0);
  const avgEfficiency = factories.filter(f => f.status === "running").reduce((sum, factory, _, arr) => sum + factory.efficiency / arr.length, 0);
  const runningFactories = factories.filter(f => f.status === "running").length;

  return (
    <div className="space-y-6">
      {/* Factory Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{totalOutput.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">units/hour</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{Math.round(avgEfficiency)}%</div>
            <Progress value={avgEfficiency} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Factories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{runningFactories}/{factories.length}</div>
            <p className="text-xs text-muted-foreground">operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Factory List */}
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🏭 Factory Status Monitor
            </CardTitle>
            <Button variant="outline" size="sm">
              Refresh All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {factories.map((factory) => (
              <div key={factory.id} className="bg-secondary/20 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(factory.type)}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{factory.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{factory.id}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(factory.status)} capitalize`}>
                    {factory.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Efficiency</p>
                    <p className="font-semibold text-primary">{factory.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Output</p>
                    <p className="font-semibold text-accent">{factory.output}/{factory.capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Connections</p>
                    <p className="font-semibold">{factory.connectedStations.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Maintenance</p>
                    <p className="font-semibold text-sm">{factory.lastMaintenance}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Efficiency</span>
                    <span>{factory.efficiency}%</span>
                  </div>
                  <Progress value={factory.efficiency} className="h-2" />
                  
                  <div className="flex justify-between text-xs">
                    <span>Capacity Utilization</span>
                    <span>{Math.round((factory.output / factory.capacity) * 100)}%</span>
                  </div>
                  <Progress value={(factory.output / factory.capacity) * 100} className="h-2" />
                </div>

                {factory.status === "error" && (
                  <div className="mt-3 p-2 bg-destructive/20 border border-destructive/50 rounded text-sm">
                    ⚠️ Critical error detected - maintenance required immediately
                  </div>
                )}

                {factory.status === "maintenance" && (
                  <div className="mt-3 p-2 bg-warning/20 border border-warning/50 rounded text-sm">
                    🔧 Scheduled maintenance in progress - estimated completion: 2 hours
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};