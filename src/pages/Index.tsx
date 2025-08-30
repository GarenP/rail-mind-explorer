import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NetworkGraph } from "@/components/NetworkGraph";
import { MetricsPanel } from "@/components/MetricsPanel";
import { FactoryMonitor } from "@/components/FactoryMonitor";
import { EconomicOverview } from "@/components/EconomicOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  console.log('🔄 Rendering Index component');
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting");

  useEffect(() => {
    // Simulate connection to game server
    const timer = setTimeout(() => {
      setConnectionStatus("connected");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                OpenFrontIO Analytics
              </h1>
              <Badge 
                variant={connectionStatus === "connected" ? "default" : "secondary"}
                className={connectionStatus === "connected" ? "animate-pulse-glow" : ""}
              >
                {connectionStatus === "connected" && "🟢 "}
                {connectionStatus === "connecting" && "🟡 "}
                {connectionStatus === "disconnected" && "🔴 "}
                {connectionStatus}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Real-time RTS Data Mining Dashboard
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trains</CardTitle>
              <span className="text-2xl">🚂</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">24</div>
              <p className="text-xs text-muted-foreground">+2 from last hour</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Railway Network</CardTitle>
              <span className="text-2xl">🛤️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">156 km</div>
              <p className="text-xs text-muted-foreground">8 stations connected</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gold Income</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">₿ 2,340</div>
              <p className="text-xs text-muted-foreground">+12% efficiency</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Factory Output</CardTitle>
              <span className="text-2xl">🏭</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">94%</div>
              <Progress value={94} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="overview">Network Overview</TabsTrigger>
            <TabsTrigger value="economics">Economics</TabsTrigger>
            <TabsTrigger value="factories">Factories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <NetworkGraph />
              </div>
              <div>
                <MetricsPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="economics" className="mt-6">
            <EconomicOverview />
          </TabsContent>

          <TabsContent value="factories" className="mt-6">
            <FactoryMonitor />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Deep learning insights on train efficiency, network optimization, and economic patterns
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;