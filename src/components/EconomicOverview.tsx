import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface EconomicData {
  goldReserves: number;
  goldIncome: number;
  goldExpenses: number;
  profitMargin: number;
  stationRevenue: { [key: string]: number };
  operationalCosts: {
    maintenance: number;
    fuel: number;
    wages: number;
    infrastructure: number;
  };
  marketTrends: {
    cargoPrice: number;
    demandLevel: "low" | "medium" | "high";
    competitionIndex: number;
  };
}

export const EconomicOverview = () => {
  const [economicData, setEconomicData] = useState<EconomicData>({
    goldReserves: 45680,
    goldIncome: 2340,
    goldExpenses: 1890,
    profitMargin: 19.2,
    stationRevenue: {
      "S1": 450,
      "S2": 680,
      "S3": 520,
      "S4": 290,
      "S5": 400
    },
    operationalCosts: {
      maintenance: 540,
      fuel: 720,
      wages: 380,
      infrastructure: 250
    },
    marketTrends: {
      cargoPrice: 125,
      demandLevel: "high",
      competitionIndex: 67
    }
  });

  const [revenueHistory, setRevenueHistory] = useState([
    { hour: "00", income: 2100 },
    { hour: "04", income: 1800 },
    { hour: "08", income: 2400 },
    { hour: "12", income: 2800 },
    { hour: "16", income: 3200 },
    { hour: "20", income: 2600 }
  ]);

  // Simulate real-time economic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEconomicData(prev => ({
        ...prev,
        goldReserves: prev.goldReserves + Math.floor((prev.goldIncome - prev.goldExpenses) / 12),
        goldIncome: Math.max(1500, Math.min(3500, prev.goldIncome + (Math.random() - 0.5) * 200)),
        goldExpenses: Math.max(1000, Math.min(2500, prev.goldExpenses + (Math.random() - 0.5) * 150)),
        marketTrends: {
          ...prev.marketTrends,
          cargoPrice: Math.max(100, Math.min(200, prev.marketTrends.cargoPrice + (Math.random() - 0.5) * 10)),
          competitionIndex: Math.max(30, Math.min(100, prev.marketTrends.competitionIndex + (Math.random() - 0.5) * 5))
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const netProfit = economicData.goldIncome - economicData.goldExpenses;
  const totalCosts = Object.values(economicData.operationalCosts).reduce((sum, cost) => sum + cost, 0);
  const totalStationRevenue = Object.values(economicData.stationRevenue).reduce((sum, revenue) => sum + revenue, 0);

  const getDemandColor = (level: string) => {
    const colors = {
      low: "text-destructive",
      medium: "text-warning",
      high: "text-success"
    };
    return colors[level as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gold Reserves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              ₿ {economicData.goldReserves.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total treasury</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hourly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₿ {economicData.goldIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Revenue per hour</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operating Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ₿ {economicData.goldExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Expenses per hour</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₿ {netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Station Revenue Breakdown */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Station Revenue Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(economicData.stationRevenue).map(([station, revenue]) => (
                <div key={station} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {station}
                    </Badge>
                    <span className="text-sm">Station {station.slice(1)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-success">₿ {revenue}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((revenue / totalStationRevenue) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-border pt-3 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total Station Revenue</span>
                  <span className="text-success">₿ {totalStationRevenue}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Costs Breakdown */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💸 Operating Costs Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(economicData.operationalCosts).map(([category, cost]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="font-semibold">₿ {cost}</span>
                  </div>
                  <Progress value={(cost / totalCosts) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {Math.round((cost / totalCosts) * 100)}% of total costs
                  </div>
                </div>
              ))}
              <div className="border-t border-border pt-3 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total Operating Costs</span>
                  <span className="text-destructive">₿ {totalCosts}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends */}
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Market Analysis & Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-secondary/20 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-2">Cargo Price Index</div>
              <div className="text-2xl font-bold text-primary mb-2">
                ₿ {economicData.marketTrends.cargoPrice}
              </div>
              <div className="text-xs">per unit</div>
            </div>

            <div className="text-center p-4 bg-secondary/20 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-2">Market Demand</div>
              <div className={`text-2xl font-bold capitalize mb-2 ${getDemandColor(economicData.marketTrends.demandLevel)}`}>
                {economicData.marketTrends.demandLevel}
              </div>
              <div className="text-xs">current level</div>
            </div>

            <div className="text-center p-4 bg-secondary/20 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-2">Competition Index</div>
              <div className="text-2xl font-bold text-warning mb-2">
                {economicData.marketTrends.competitionIndex}%
              </div>
              <div className="text-xs">market saturation</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <h4 className="font-semibold text-accent mb-2">💡 Economic Insights</h4>
            <div className="space-y-2 text-sm">
              <p>• Station S2 generating highest revenue - consider expanding capacity</p>
              <p>• Fuel costs trending upward - optimize train routes for efficiency</p>
              <p>• High market demand detected - good time to increase production</p>
              <p>• Competition index moderate - market share growth opportunity available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};