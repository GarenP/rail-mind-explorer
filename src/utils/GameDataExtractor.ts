import { GameAnalytics, RailNetworkData, StationData, RailroadData, ClusterData, EconomicData, FactoryData, Player } from '@/types/GameData';

/**
 * Utility class to extract and analyze data from the OpenFrontIO game core
 */
export class GameDataExtractor {
  
  /**
   * Extract game analytics from raw game state
   */
  static extractGameAnalytics(gameState: any): GameAnalytics {
    return {
      id: gameState.id || 'unknown',
      timestamp: Date.now(),
      players: this.extractPlayers(gameState),
      railNetwork: this.extractRailNetworkData(gameState),
      economicData: this.extractEconomicData(gameState),
      factoryData: this.extractFactoryData(gameState)
    };
  }

  /**
   * Extract player information
   */
  private static extractPlayers(gameState: any): Player[] {
    // Mock implementation - would extract from actual game state
    return [
      {
        id: 'player1',
        name: 'Player 1',
        gold: 1500,
        units: 25,
        territories: 8
      },
      {
        id: 'player2', 
        name: 'Player 2',
        gold: 1200,
        units: 22,
        territories: 6
      }
    ];
  }

  /**
   * Extract rail network topology and metrics
   */
  private static extractRailNetworkData(gameState: any): RailNetworkData {
    // Analyze TrainStation and RailNetwork classes
    const stations = this.mockStations();
    const railroads = this.mockRailroads();
    const clusters = this.mockClusters();

    return {
      stations,
      railroads,
      clusters
    };
  }

  /**
   * Extract economic metrics
   */
  private static extractEconomicData(gameState: any): EconomicData {
    return {
      totalGold: 5400,
      goldPerTurn: 120,
      tradeVolume: 850,
      factoryProduction: 340,
      trainRevenue: 280
    };
  }

  /**
   * Extract factory data
   */
  private static extractFactoryData(gameState: any): FactoryData[] {
    return [
      {
        id: 'factory1',
        position: { x: 100, y: 150 },
        level: 2,
        owner: 'player1',
        productionRate: 45,
        efficiency: 0.85,
        connectedStations: 3
      },
      {
        id: 'factory2',
        position: { x: 300, y: 200 },
        level: 1,
        owner: 'player2',
        productionRate: 28,
        efficiency: 0.72,
        connectedStations: 2
      }
    ];
  }

  // Mock data generators for development
  private static mockStations(): StationData[] {
    return [
      {
        id: 'station1',
        type: 'City',
        position: { x: 150, y: 100 },
        level: 3,
        owner: 'player1',
        connections: ['station2', 'station3'],
        clusterId: 'cluster1',
        goldGenerated: 180,
        trafficVolume: 25
      },
      {
        id: 'station2', 
        type: 'Port',
        position: { x: 250, y: 180 },
        level: 2,
        owner: 'player1',
        connections: ['station1', 'station4'],
        clusterId: 'cluster1',
        goldGenerated: 140,
        trafficVolume: 18
      },
      {
        id: 'station3',
        type: 'Factory',
        position: { x: 80, y: 220 },
        level: 1,
        owner: 'player2',
        connections: ['station1'],
        clusterId: 'cluster2',
        goldGenerated: 90,
        trafficVolume: 12
      }
    ];
  }

  private static mockRailroads(): RailroadData[] {
    return [
      {
        id: 'rail1',
        from: 'station1',
        to: 'station2',
        length: 85,
        usage: 22,
        efficiency: 0.88
      },
      {
        id: 'rail2',
        from: 'station1', 
        to: 'station3',
        length: 120,
        usage: 15,
        efficiency: 0.75
      }
    ];
  }

  private static mockClusters(): ClusterData[] {
    return [
      {
        id: 'cluster1',
        stationIds: ['station1', 'station2'],
        size: 2,
        tradingVolume: 450,
        efficiency: 0.85
      },
      {
        id: 'cluster2',
        stationIds: ['station3'],
        size: 1,
        tradingVolume: 180,
        efficiency: 0.65
      }
    ];
  }

  /**
   * Parse game configuration and extract settings
   */
  static parseGameConfig(config: any) {
    return {
      bots: config.bots || 0,
      difficulty: config.difficulty || 'Medium',
      gameMode: config.gameMode || 'FFA',
      gameType: config.gameType || 'Private',
      maxPlayers: config.maxPlayers || 4,
      mapType: config.gameMap || 'World'
    };
  }

  /**
   * Calculate network efficiency metrics
   */
  static calculateNetworkMetrics(railNetwork: RailNetworkData) {
    const { stations, railroads, clusters } = railNetwork;
    
    return {
      connectivity: railroads.length / Math.max(stations.length - 1, 1),
      avgRailroadLength: railroads.reduce((sum, r) => sum + r.length, 0) / railroads.length,
      totalClusters: clusters.length,
      avgClusterSize: clusters.reduce((sum, c) => sum + c.size, 0) / clusters.length,
      networkEfficiency: railroads.reduce((sum, r) => sum + r.efficiency, 0) / railroads.length
    };
  }
}