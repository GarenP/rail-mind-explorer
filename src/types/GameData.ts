// Game data types extracted from the core game code
export interface GameAnalytics {
  id: string;
  timestamp: number;
  players: Player[];
  railNetwork: RailNetworkData;
  economicData: EconomicData;
  factoryData: FactoryData[];
}

export interface Player {
  id: string;
  name: string;
  gold: number;
  units: number;
  territories: number;
}

export interface RailNetworkData {
  stations: StationData[];
  railroads: RailroadData[];
  clusters: ClusterData[];
}

export interface StationData {
  id: string;
  type: 'City' | 'Port' | 'Factory';
  position: { x: number; y: number };
  level: number;
  owner: string;
  connections: string[];
  clusterId?: string;
  goldGenerated: number;
  trafficVolume: number;
}

export interface RailroadData {
  id: string;
  from: string;
  to: string;
  length: number;
  usage: number;
  efficiency: number;
}

export interface ClusterData {
  id: string;
  stationIds: string[];
  size: number;
  tradingVolume: number;
  efficiency: number;
}

export interface EconomicData {
  totalGold: number;
  goldPerTurn: number;
  tradeVolume: number;
  factoryProduction: number;
  trainRevenue: number;
}

export interface FactoryData {
  id: string;
  position: { x: number; y: number };
  level: number;
  owner: string;
  productionRate: number;
  efficiency: number;
  connectedStations: number;
}

export interface GameMetrics {
  averageGameLength: number;
  mostPopularStrategies: Strategy[];
  economicTrends: EconomicTrend[];
  networkEfficiency: NetworkMetric[];
}

export interface Strategy {
  name: string;
  frequency: number;
  winRate: number;
  description: string;
}

export interface EconomicTrend {
  period: string;
  goldGrowth: number;
  tradeGrowth: number;
  factoryGrowth: number;
}

export interface NetworkMetric {
  connectivity: number;
  efficiency: number;
  clusterDistribution: number;
  avgPathLength: number;
}