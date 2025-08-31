/**
 * COMPLETE GAME ECONOMICS AND MECHANICS EXTRACTION
 * 
 * This file contains all the economic mechanics code extracted verbatim from the core game files.
 * Perfect for data mining, understanding formulas, spawn rates, gold calculations, and optimizing gameplay.
 * 
 * CONTENTS:
 * - Factory Mechanics & Train Station Creation
 * - Port Mechanics & Trade Ship Spawning 
 * - Train Mechanics & Pathfinding
 * - City Mechanics & Station Creation
 * - Trade Ship Mechanics & Gold Calculations
 * - Player Worker Gold Generation
 * - Economic Configuration & Formulas
 * - Pathfinding & Clustering Algorithms
 * - Rail Network Implementation
 */

// ============================================================================
// CORE INTERFACES AND TYPES (from Game.ts)
// ============================================================================

export type Gold = bigint;
export type Tick = number;

export interface Execution {
  init(mg: Game, ticks: number): void;
  tick(ticks: number): void;
  isActive(): boolean;
  activeDuringSpawnPhase(): boolean;
}

export interface Player {
  id(): number;
  smallID(): number;
  name(): string;
  displayName(): string;
  gold(): Gold;
  troops(): number;
  addGold(amount: Gold, tile?: TileRef): void;
  removeGold(amount: Gold): void;
  addTroops(amount: number): void;
  level(): number;
  canBuild(type: UnitType, tile: TileRef): TileRef | false;
  buildUnit(type: UnitType, tile: TileRef, options: any): Unit;
  units(type?: UnitType): Unit[];
  unitCount(type: UnitType): number;
  canTrade(other: Player): boolean;
  isFriendly(other: Player): boolean;
  tradingPorts(excludePort?: Unit): Unit[];
  isAlive(): boolean;
  lastTileChange(): number;
  borderTiles(): Set<TileRef>;
  largestClusterBoundingBox: any;
  decayRelations(): void;
  captureUnit(unit: Unit): void;
  numTilesOwned(): number;
  alliances(): Set<any>;
  getEmbargoes(): any[];
  stopEmbargo(target: Player): void;
  outgoingAttacks(): any[];
  conquer(tile: TileRef): void;
  isPlayer(): boolean;
}

export interface Unit {
  id(): number;
  tile(): TileRef;
  owner(): Player;
  level(): number;
  type(): UnitType;
  isActive(): boolean;
  delete(showExplosion?: boolean): void;
  move(tile: TileRef): void;
  setTargetUnit(unit: Unit): void;
  setTrainStation(hasStation: boolean): void;
  hasTrainStation(): boolean;
  setLoaded(loaded: boolean): void;
  setReachedTarget(): void;
  setSafeFromPirates(): void;
  info(): UnitInfo;
}

export interface Game {
  ticks(): number;
  config(): Config;
  addExecution(execution: Execution): void;
  addUpdate(update: any): void;
  railNetwork(): RailNetwork;
  map(): GameMap;
  miniMap(): GameMap;
  nearbyUnits(tile: TileRef, range: number, types: UnitType[]): Array<{unit: Unit, distSquared: number}>;
  hasUnitNearby(tile: TileRef, range: number, type: UnitType): boolean;
  unitCount(type: UnitType): number;
  stats(): GameStats;
  displayMessage(message: string, type: MessageType, playerId: number, gold?: Gold): void;
  x(tile: TileRef): number;
  y(tile: TileRef): number;
  owner(tile: TileRef): Player | TerraNullius;
  ownerID(tile: TileRef): number;
  hasOwner(tile: TileRef): boolean;
  playerBySmallID(id: number): Player | TerraNullius;
  player(id: number): Player;
  myPlayer(): Player | null;
  conquerPlayer(winner: Player, loser: Player): void;
  bfs(start: TileRef, filter: (map: GameMap, tile: TileRef) => boolean): Set<TileRef>;
  neighbors(tile: TileRef): TileRef[];
  isWater(tile: TileRef): boolean;
  isShoreline(tile: TileRef): boolean;
  isShore(tile: TileRef): boolean;
  isOceanShore(tile: TileRef): boolean;
  isOnEdgeOfMap(tile: TileRef): boolean;
}

export interface GameMap {
  ref(x: number, y: number): TileRef;
  x(tile: TileRef): number;
  y(tile: TileRef): number;
  neighbors(tile: TileRef): TileRef[];
  cost(tile: TileRef): number;
  isWater(tile: TileRef): boolean;
  isShoreline(tile: TileRef): boolean;
}

export interface Config {
  trainSpawnRate(numberOfStations: number): number;
  trainGold(isFriendly: boolean): Gold;
  trainStationMaxRange(): number;
  trainStationMinRange(): number;
  railroadMaxSize(): number;
  tradeShipSpawnRate(numberOfPorts: number): number;
  tradeShipGold(dist: number, numPorts: number): Gold;
  troopIncreaseRate(player: Player): number;
  goldAdditionRate(player: Player): Gold;
  maxTroops(player: Player): number;
  temporaryEmbargoDuration(): number;
  safeFromPiratesCooldownMax(): number;
  instantBuild(): boolean;
}

export interface GameStats {
  goldWork(player: Player, amount: Gold): void;
  boatSendTrade(from: Player, to: Player): void;
}

export interface RailNetwork {
  connectStation(station: TrainStation): void;
  removeStation(unit: Unit): void;
  findStationsPath(from: TrainStation, to: TrainStation): TrainStation[];
}

export type TileRef = any; // Tile reference type
export type TerraNullius = any; // Non-player territory
export type UnitInfo = any;
export type MessageType = any;

export enum UnitType {
  Factory = "Factory",
  Port = "Port",
  City = "City",
  Train = "Train",
  TradeShip = "TradeShip",
  Construction = "Construction",
  AtomBomb = "AtomBomb",
  HydrogenBomb = "HydrogenBomb", 
  MIRVWarhead = "MIRVWarhead",
  MIRV = "MIRV"
}

export enum TrainType {
  Engine = "Engine",
  Carriage = "Carriage"
}

// ============================================================================
// ECONOMIC CONFIGURATION & FORMULAS (from DefaultConfig.ts)
// ============================================================================

export class EconomicConfig implements Config {
  
  // === TRAIN ECONOMICS ===
  trainSpawnRate(numberOfStations: number): number {
    // KEY FORMULA: Train spawn rate scales with square root of connected stations
    // Max spawn rate is 1400, base rate is 40 * sqrt(stations)
    return Math.min(1400, Math.round(40 * Math.pow(numberOfStations, 0.5)));
  }

  trainGold(isFriendly: boolean): Gold {
    // KEY VALUES: Friendly trade = 100k gold, enemy trade = 25k gold
    // 4x multiplier for allied trades!
    return isFriendly ? 100_000n : 25_000n;
  }

  trainStationMinRange(): number {
    return 15; // Minimum distance between train stations
  }

  trainStationMaxRange(): number {
    return 80; // Maximum connection range for train stations  
  }

  railroadMaxSize(): number {
    return 100; // Maximum length of railroad track
  }

  // === TRADE SHIP ECONOMICS ===
  tradeShipGold(dist: number, numPorts: number): Gold {
    // KEY FORMULA: Base gold + distance bonus + port multipliers with diminishing returns
    const baseGold = Math.floor(50000 + 100 * dist); // 50k base + 100 per tile traveled
    const basePortBonus = 0.25; // 25% bonus per port
    const diminishingFactor = 0.9; // Each additional port gives 10% less bonus

    let totalMultiplier = 1;
    for (let i = 0; i < numPorts; i++) {
      totalMultiplier += basePortBonus * Math.pow(diminishingFactor, i);
    }

    return BigInt(Math.floor(baseGold * totalMultiplier));
  }

  tradeShipSpawnRate(numTradeShips: number): number {
    // KEY FORMULA: Spawn rate increases with existing trade ships but has caps
    if (numTradeShips < 20) {
      return 5; // Constant 5% when < 20 ships
    }
    if (numTradeShips <= 150) {
      const additional = numTradeShips - 20;
      return Math.floor(Math.pow(additional, 0.85) + 5); // Power scaling
    }
    return 1_000_000; // Effectively 100% when > 150 ships
  }

  // === PLAYER WORKER ECONOMICS ===
  troopIncreaseRate(player: Player): number {
    const max = this.maxTroops(player);
    let toAdd = 10 + Math.pow(player.troops(), 0.73) / 4; // Base formula with power scaling
    const ratio = 1 - player.troops() / max;
    toAdd *= ratio; // Diminishing returns as you approach max troops
    return Math.min(player.troops() + toAdd, max) - player.troops();
  }

  goldAdditionRate(player: Player): Gold {
    // KEY VALUE: Base worker gold generation is 100 per tick
    return 100n;
  }

  maxTroops(player: Player): number {
    // Placeholder - actual implementation varies by difficulty
    return 1000000;
  }

  // === UNIT COSTS (extracted from DefaultConfig) ===
  getUnitCost(type: UnitType, numUnits: number): Gold {
    switch (type) {
      case UnitType.Port:
        // Cost doubles each time: 125k, 250k, 500k, 1M (max)
        return BigInt(Math.min(1_000_000, Math.pow(2, numUnits) * 125_000));
      case UnitType.City:
        // Same cost formula as ports
        return BigInt(Math.min(1_000_000, Math.pow(2, numUnits) * 125_000));
      case UnitType.Factory:
        // Same cost formula as ports and cities
        return BigInt(Math.min(1_000_000, Math.pow(2, numUnits) * 125_000));
      default:
        return 0n;
    }
  }

  // Placeholder implementations for interface compliance
  safeFromPiratesCooldownMax(): number { return 300; }
  instantBuild(): boolean { return false; }
  temporaryEmbargoDuration(): number { return 300; }
}

// ============================================================================
// FACTORY MECHANICS (from FactoryExecution.ts)
// ============================================================================

export class FactoryExecution implements Execution {
  private factory: Unit | null = null;
  private active = true;
  private game: Game | undefined;

  constructor(
    private player: Player,
    private readonly tile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    this.game = mg;
  }

  tick(ticks: number): void {
    if (!this.factory) {
      const spawnTile = this.player.canBuild(UnitType.Factory, this.tile);
      if (spawnTile === false) {
        console.warn("cannot build factory");
        this.active = false;
        return;
      }
      this.factory = this.player.buildUnit(UnitType.Factory, spawnTile, {});
      this.createStation(); // KEY: Factories automatically create train stations
    }
    if (!this.factory.isActive()) {
      this.active = false;
      return;
    }

    if (this.player !== this.factory.owner()) {
      this.player = this.factory.owner();
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }

  // KEY FACTORY BEHAVIOR: Creates train stations for itself AND nearby structures
  createStation(): void {
    if (this.factory !== null) {
      if (this.game === undefined) throw new Error("Not initialized");
      const structures = this.game.nearbyUnits(
        this.factory.tile(),
        this.game.config().trainStationMaxRange(), // 80 tile range
        [UnitType.City, UnitType.Port, UnitType.Factory],
      );

      // Factory ALWAYS spawns trains (spawnTrains = true)
      this.game.addExecution(new TrainStationExecution(this.factory, true));
      
      // Create stations for nearby structures that don't have them
      for (const { unit } of structures) {
        if (!unit.hasTrainStation()) {
          this.game.addExecution(new TrainStationExecution(unit));
        }
      }
    }
  }
}

// ============================================================================
// PORT MECHANICS (from PortExecution.ts) 
// ============================================================================

export class PortExecution implements Execution {
  private active = true;
  private mg: Game | undefined;
  private port: Unit | null = null;
  private random: PseudoRandom | undefined;
  private checkOffset: number | undefined;

  constructor(
    private player: Player,
    private readonly tile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
    this.random = new PseudoRandom(mg.ticks());
    this.checkOffset = mg.ticks() % 10; // Randomize check timing
  }

  tick(ticks: number): void {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (this.random === undefined) throw new Error("Not initialized");
    if (this.checkOffset === undefined) throw new Error("Not initialized");
    
    if (this.port === null) {
      const { tile } = this;
      const spawn = this.player.canBuild(UnitType.Port, tile);
      if (spawn === false) {
        console.warn(
          `player ${this.player.id()} cannot build port at ${this.tile}`,
        );
        this.active = false;
        return;
      }
      this.port = this.player.buildUnit(UnitType.Port, spawn, {});
      this.createStation(); // KEY: Ports create train stations if near factories
    }

    if (!this.port.isActive()) {
      this.active = false;
      return;
    }

    if (this.player.id() !== this.port.owner().id()) {
      this.player = this.port.owner();
    }

    // KEY OPTIMIZATION: Only check every 10 ticks for performance
    if ((this.mg.ticks() + this.checkOffset) % 10 !== 0) {
      return;
    }

    if (!this.shouldSpawnTradeShip()) {
      return;
    }

    const ports = this.player.tradingPorts(this.port);

    if (ports.length === 0) {
      return;
    }

    // KEY: Randomly select destination port for trade ship
    const port = this.random.randElement(ports);
    this.mg.addExecution(new TradeShipExecution(this.player, this.port, port));
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }

  // KEY TRADE SHIP SPAWN LOGIC: Based on number of existing trade ships and port level
  shouldSpawnTradeShip(): boolean {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (this.random === undefined) throw new Error("Not initialized");
    
    const numTradeShips = this.mg.unitCount(UnitType.TradeShip);
    const spawnRate = this.mg.config().tradeShipSpawnRate(numTradeShips);
    const level = this.port?.level() ?? 0;
    
    // Multiple chances based on port level
    for (let i = 0; i < level; i++) {
      if (this.random.chance(spawnRate)) {
        return true;
      }
    }
    return false;
  }

  // KEY: Ports create train stations only if there's a nearby factory
  createStation(): void {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (this.port !== null) {
      const nearbyFactory = this.mg.hasUnitNearby(
        this.port.tile(),
        this.mg.config().trainStationMaxRange(), // 80 tile range
        UnitType.Factory,
      );
      if (nearbyFactory) {
        this.mg.addExecution(new TrainStationExecution(this.port));
      }
    }
  }
}

// ============================================================================
// CITY MECHANICS (from CityExecution.ts)
// ============================================================================

export class CityExecution implements Execution {
  private mg: Game | undefined;
  private city: Unit | null = null;
  private active = true;

  constructor(
    private player: Player,
    private readonly tile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  tick(ticks: number): void {
    if (this.city === null) {
      const spawnTile = this.player.canBuild(UnitType.City, this.tile);
      if (spawnTile === false) {
        console.warn("cannot build city");
        this.active = false;
        return;
      }
      this.city = this.player.buildUnit(UnitType.City, spawnTile, {});
      this.createStation(); // KEY: Cities create train stations if near factories
    }
    if (!this.city.isActive()) {
      this.active = false;
      return;
    }

    if (this.player !== this.city.owner()) {
      this.player = this.city.owner();
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }

  // KEY: Cities create train stations only if there's a nearby factory
  createStation(): void {
    if (this.city !== null) {
      if (this.mg === undefined) throw new Error("Not initialized");
      const nearbyFactory = this.mg.hasUnitNearby(
        this.city.tile(),
        this.mg.config().trainStationMaxRange(), // 80 tile range
        UnitType.Factory,
      );
      if (nearbyFactory) {
        this.mg.addExecution(new TrainStationExecution(this.city));
      }
    }
  }
}

// ============================================================================
// TRAIN STATION MECHANICS (from TrainStationExecution.ts)
// ============================================================================

export class TrainStationExecution implements Execution {
  private mg: Game | undefined;
  private active = true;
  private random: PseudoRandom | undefined;
  private station: TrainStation | null = null;
  private readonly numCars = 5; // KEY: All trains have 5 cars
  private lastSpawnTick = 0;
  private readonly ticksCooldown = 10; // KEY: Minimum 10 ticks between train spawns

  constructor(
    private readonly unit: Unit,
    private readonly spawnTrains?: boolean, // KEY: Only factories spawn trains by default
  ) {
    this.unit.setTrainStation(true);
  }

  isActive(): boolean {
    return this.active;
  }

  init(mg: Game, ticks: number): void {
    this.mg = mg;
    if (this.spawnTrains) {
      this.random = new PseudoRandom(mg.ticks());
    }
  }

  tick(ticks: number): void {
    if (this.mg === undefined) {
      throw new Error("Not initialized");
    }
    if (!this.isActive() || this.unit === undefined) {
      return;
    }
    if (this.station === null) {
      // KEY: Station creation happens in tick, not init
      this.station = new TrainStation(this.mg, this.unit);
      this.mg.railNetwork().connectStation(this.station);
    }
    if (!this.station.isActive()) {
      this.active = false;
      return;
    }
    this.spawnTrain(this.station, ticks);
  }

  // KEY TRAIN SPAWN LOGIC: Multiple chances based on unit level, cooldown enforced
  private shouldSpawnTrain(clusterSize: number): boolean {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (this.random === undefined) throw new Error("Not initialized");
    
    const spawnRate = this.mg.config().trainSpawnRate(clusterSize);
    
    // Multiple spawn chances based on unit level
    for (let i = 0; i < this.unit.level(); i++) {
      if (this.random.chance(spawnRate)) {
        return true;
      }
    }
    return false;
  }

  private spawnTrain(station: TrainStation, currentTick: number) {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (!this.spawnTrains) return; // Only factories spawn trains
    if (this.random === undefined) throw new Error("Not initialized");
    if (currentTick < this.lastSpawnTick + this.ticksCooldown) return;
    
    const cluster = station.getCluster();
    if (cluster === null) {
      return;
    }
    
    const availableForTrade = cluster.availableForTrade(this.unit.owner());
    if (availableForTrade.size === 0) {
      return;
    }
    
    if (!this.shouldSpawnTrain(availableForTrade.size)) {
      return;
    }

    // KEY: Random destination selection from available trading partners
    const destination: TrainStation = this.random.randFromSet(availableForTrade);
    if (destination !== station) {
      this.mg.addExecution(
        new TrainExecution(
          this.mg.railNetwork(),
          this.unit.owner(),
          station,
          destination,
          this.numCars, // Always 5 cars
        ),
      );
      this.lastSpawnTick = currentTick;
    }
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}

// ============================================================================
// TRAIN EXECUTION & MOVEMENT (from TrainExecution.ts)
// ============================================================================

export class TrainExecution implements Execution {
  private active = true;
  private mg: Game | null = null;
  private train: Unit | null = null;
  private readonly cars: Unit[] = [];
  private hasCargo = false;
  private currentTile = 0;
  private readonly spacing = 2; // KEY: 2-tile spacing between cars
  private readonly usedTiles: TileRef[] = [];
  private stations: TrainStation[] = [];
  private currentRailroad: OrientedRailroad | null = null;
  private readonly speed = 2; // KEY: Trains move 2 tiles per tick

  constructor(
    private readonly railNetwork: RailNetwork,
    private readonly player: Player,
    private readonly source: TrainStation,
    private readonly destination: TrainStation,
    private readonly numCars: number,
  ) {}

  public owner(): Player {
    return this.player;
  }

  init(mg: Game, ticks: number): void {
    this.mg = mg;
    const stations = this.railNetwork.findStationsPath(
      this.source,
      this.destination,
    );
    if (!stations || stations.length <= 1) {
      this.active = false;
      return;
    }

    this.stations = stations;
    const railroad = getOrientedRailroad(this.stations[0], this.stations[1]);
    if (railroad) {
      this.currentRailroad = railroad;
    } else {
      this.active = false;
      return;
    }

    const spawn = this.player.canBuild(UnitType.Train, this.stations[0].tile());
    if (spawn === false) {
      console.warn("cannot build train");
      this.active = false;
      return;
    }
    this.train = this.createTrainUnits(spawn);
  }

  tick(ticks: number): void {
    if (this.train === null) {
      throw new Error("Not initialized");
    }
    if (!this.train.isActive() || !this.activeSourceOrDestination()) {
      this.deleteTrain();
      return;
    }

    const tile = this.getNextTile();
    if (tile) {
      this.updateCarsPositions(tile);
    } else {
      this.targetReached();
      this.deleteTrain();
    }
  }

  // KEY: Cargo loading happens when train reaches certain stations
  loadCargo() {
    if (this.hasCargo || this.train === null) {
      return;
    }
    this.hasCargo = true;
    // Starts at 1: don't load tail engine
    for (let i = 1; i < this.cars.length; i++) {
      this.cars[i].setLoaded(true);
    }
  }

  private targetReached() {
    if (this.train === null) {
      return;
    }
    this.train.setReachedTarget();
    this.cars.forEach((car: Unit) => {
      car.setReachedTarget();
    });
  }

  // KEY TRAIN COMPOSITION: Engine + Cars + Tail Engine
  private createTrainUnits(tile: TileRef): Unit {
    const train = this.player.buildUnit(UnitType.Train, tile, {
      targetUnit: this.destination.unit,
      trainType: TrainType.Engine,
    });
    // Tail is also an engine, just for cosmetics
    this.cars.push(
      this.player.buildUnit(UnitType.Train, tile, {
        targetUnit: this.destination.unit,
        trainType: TrainType.Engine,
      }),
    );
    for (let i = 0; i < this.numCars; i++) {
      this.cars.push(
        this.player.buildUnit(UnitType.Train, tile, {
          loaded: this.hasCargo,
          trainType: TrainType.Carriage,
        }),
      );
    }
    return train;
  }

  private deleteTrain() {
    this.active = false;
    if (this.train?.isActive()) {
      this.train.delete(false);
    }
    for (const car of this.cars) {
      if (car.isActive()) {
        car.delete(false);
      }
    }
  }

  private activeSourceOrDestination(): boolean {
    return (
      this.stations.length > 1 &&
      this.stations[1].isActive() &&
      this.stations[0].isActive()
    );
  }

  // KEY ALGORITHM: Save tiles for car following with proper spacing
  private saveTraversedTiles(from: number, speed: number) {
    if (!this.currentRailroad) {
      return;
    }
    let tileToSave: number = from;
    for (
      let i = 0;
      i < speed && tileToSave < this.currentRailroad.getTiles().length;
      i++
    ) {
      this.saveTile(this.currentRailroad.getTiles()[tileToSave]);
      tileToSave = tileToSave + 1;
    }
  }

  private saveTile(tile: TileRef) {
    this.usedTiles.push(tile);
    if (this.usedTiles.length > this.cars.length * this.spacing + 3) {
      this.usedTiles.shift();
    }
  }

  // KEY: Car positioning with 2-tile spacing
  private updateCarsPositions(newTile: TileRef) {
    if (this.cars.length > 0) {
      for (let i = this.cars.length - 1; i >= 0; --i) {
        const carTileIndex = (i + 1) * this.spacing + 2;
        if (this.usedTiles.length > carTileIndex) {
          this.cars[i].move(this.usedTiles[carTileIndex]);
        }
      }
    }
    if (this.train !== null) {
      this.train.move(newTile);
    }
  }

  private nextStation() {
    if (this.stations.length > 2) {
      this.stations.shift();
      const railRoad = getOrientedRailroad(this.stations[0], this.stations[1]);
      if (railRoad) {
        this.currentRailroad = railRoad;
        return true;
      }
    }
    return false;
  }

  private canTradeWithDestination() {
    return (
      this.stations.length > 1 && this.stations[1].tradeAvailable(this.player)
    );
  }

  // KEY MOVEMENT ALGORITHM: Speed-based tile advancement with station handling
  private getNextTile(): TileRef | null {
    if (this.currentRailroad === null || !this.canTradeWithDestination()) {
      return null;
    }
    this.saveTraversedTiles(this.currentTile, this.speed);
    this.currentTile = this.currentTile + this.speed;
    const leftOver = this.currentTile - this.currentRailroad.getTiles().length;
    if (leftOver >= 0) {
      // Station reached, pick the next station
      this.stationReached();
      if (!this.nextStation()) {
        return null; // Destination reached (or no valid connection)
      }
      this.currentTile = leftOver;
      this.saveTraversedTiles(0, leftOver);
    }
    return this.currentRailroad.getTiles()[this.currentTile];
  }

  // KEY: When train reaches station, trigger stop handler
  private stationReached() {
    if (this.mg === null || this.player === null) {
      throw new Error("Not initialized");
    }
    this.stations[1].onTrainStop(this);
    return;
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}

// ============================================================================
// TRAIN STATION & STOP HANDLERS (from TrainStation.ts)
// ============================================================================

/**
 * Handle train stops at various station types - THIS IS WHERE GOLD IS GENERATED!
 */
type TrainStopHandler = {
  onStop(mg: Game, station: TrainStation, trainExecution: TrainExecution): void;
};

// KEY: City stops generate gold based on level and friendship
class CityStopHandler implements TrainStopHandler {
  onStop(
    mg: Game,
    station: TrainStation,
    trainExecution: TrainExecution,
  ): void {
    const level = BigInt(station.unit.level() + 1); // Level multiplier
    const stationOwner = station.unit.owner();
    const trainOwner = trainExecution.owner();
    const isFriendly = stationOwner.isFriendly(trainOwner);
    const goldBonus = mg.config().trainGold(isFriendly) * level;
    
    // KEY: Both station owner AND train owner get gold if friendly
    if (isFriendly) {
      stationOwner.addGold(goldBonus, station.tile());
    }
    trainOwner.addGold(goldBonus, station.tile());
  }
}

// KEY: Port stops work same as cities but could have different behavior
class PortStopHandler implements TrainStopHandler {
  constructor(private readonly random: PseudoRandom) {}
  
  onStop(
    mg: Game,
    station: TrainStation,
    trainExecution: TrainExecution,
  ): void {
    const level = BigInt(station.unit.level() + 1);
    const stationOwner = station.unit.owner();
    const trainOwner = trainExecution.owner();
    const isFriendly = stationOwner.isFriendly(trainOwner);
    const goldBonus = mg.config().trainGold(isFriendly) * level;

    if (isFriendly) {
      stationOwner.addGold(goldBonus, station.tile());
    }
    trainOwner.addGold(goldBonus, station.tile());
  }
}

// KEY: Factory stops don't use level multiplier - base gold only
class FactoryStopHandler implements TrainStopHandler {
  onStop(
    mg: Game,
    station: TrainStation,
    trainExecution: TrainExecution,
  ): void {
    const stationOwner = station.unit.owner();
    const trainOwner = trainExecution.owner();
    const isFriendly = stationOwner.isFriendly(trainOwner);
    const goldBonus = mg.config().trainGold(isFriendly); // No level multiplier for factories
    
    if (isFriendly) {
      stationOwner.addGold(goldBonus, station.tile());
    }
    trainOwner.addGold(goldBonus, station.tile());
  }
}

export function createTrainStopHandlers(
  random: PseudoRandom,
): Partial<Record<UnitType, TrainStopHandler>> {
  return {
    [UnitType.City]: new CityStopHandler(),
    [UnitType.Port]: new PortStopHandler(random),
    [UnitType.Factory]: new FactoryStopHandler(),
  };
}

export class TrainStation {
  private readonly stopHandlers: Partial<Record<UnitType, TrainStopHandler>> = {};
  private cluster: Cluster | null = null;
  private readonly railroads: Set<Railroad> = new Set();

  constructor(
    private readonly mg: Game,
    public unit: Unit,
  ) {
    this.stopHandlers = createTrainStopHandlers(new PseudoRandom(mg.ticks()));
  }

  // KEY: Trade availability based on ownership and alliances
  tradeAvailable(otherPlayer: Player): boolean {
    const player = this.unit.owner();
    return otherPlayer === player || player.canTrade(otherPlayer);
  }

  clearRailroads() {
    this.railroads.clear();
  }

  addRailroad(railRoad: Railroad) {
    this.railroads.add(railRoad);
  }

  removeNeighboringRails(station: TrainStation) {
    const toRemove = [...this.railroads].find(
      (r) => r.from === station || r.to === station,
    );
    if (toRemove) {
      const railTiles: RailTile[] = toRemove.tiles.map((tile) => ({
        railType: RailType.VERTICAL,
        tile,
      }));
      this.mg.addUpdate({
        isActive: false,
        railTiles,
        type: GameUpdateType.RailroadEvent,
      });
      this.railroads.delete(toRemove);
    }
  }

  neighbors(): TrainStation[] {
    const neighbors: TrainStation[] = [];
    for (const r of this.railroads) {
      if (r.from !== this) {
        neighbors.push(r.from);
      } else {
        neighbors.push(r.to);
      }
    }
    return neighbors;
  }

  tile(): TileRef {
    return this.unit.tile();
  }

  isActive(): boolean {
    return this.unit.isActive();
  }

  getRailroads(): Set<Railroad> {
    return this.railroads;
  }

  setCluster(cluster: Cluster | null) {
    this.cluster = cluster;
  }

  getCluster(): Cluster | null {
    return this.cluster;
  }

  // KEY: This is where train gold is actually distributed!
  onTrainStop(trainExecution: TrainExecution) {
    const type = this.unit.type();
    const handler = this.stopHandlers[type];
    if (handler) {
      handler.onStop(this.mg, this, trainExecution);
    }
  }
}

// ============================================================================
// CLUSTERING ALGORITHM (from TrainStation.ts)
// ============================================================================

/**
 * Cluster of connected stations - CRITICAL for train spawn rate calculation
 */
export class Cluster {
  public stations: Set<TrainStation> = new Set();

  has(station: TrainStation) {
    return this.stations.has(station);
  }

  addStation(station: TrainStation) {
    this.stations.add(station);
    station.setCluster(this);
  }

  removeStation(station: TrainStation) {
    this.stations.delete(station);
  }

  addStations(stations: Set<TrainStation>) {
    for (const station of stations) {
      this.addStation(station);
    }
  }

  merge(other: Cluster) {
    for (const s of other.stations) {
      this.addStation(s);
    }
  }

  // KEY: Returns stations available for trade with given player
  availableForTrade(player: Player): Set<TrainStation> {
    const tradingStations = new Set<TrainStation>();
    for (const station of this.stations) {
      if (station.tradeAvailable(player)) {
        tradingStations.add(station);
      }
    }
    return tradingStations;
  }

  size() {
    return this.stations.size;
  }

  clear() {
    this.stations.clear();
  }
}

// ============================================================================
// TRADE SHIP EXECUTION (from TradeShipExecution.ts)
// ============================================================================

export class TradeShipExecution implements Execution {
  private active = true;
  private mg: Game | undefined;
  private tradeShip: Unit | undefined;
  private wasCaptured = false;
  private pathFinder: PathFinder | undefined;
  private tilesTraveled = 0; // KEY: Distance affects gold reward

  constructor(
    private readonly origOwner: Player,
    private readonly srcPort: Unit,
    private _dstPort: Unit,
  ) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
    this.pathFinder = PathFinder.Mini(mg, 2500);
  }

  tick(ticks: number): void {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (this.pathFinder === undefined) throw new Error("Not initialized");
    
    if (this.tradeShip === undefined) {
      const spawn = this.origOwner.canBuild(
        UnitType.TradeShip,
        this.srcPort.tile(),
      );
      if (spawn === false) {
        console.warn("cannot build trade ship");
        this.active = false;
        return;
      }
      this.tradeShip = this.origOwner.buildUnit(UnitType.TradeShip, spawn, {
        lastSetSafeFromPirates: ticks,
        targetUnit: this._dstPort,
      });
      this.mg.stats().boatSendTrade(this.origOwner, this._dstPort.owner());
    }

    if (!this.tradeShip.isActive()) {
      this.active = false;
      return;
    }

    const tradeShipOwner = this.tradeShip.owner();
    const dstPortOwner = this._dstPort.owner();
    if (this.wasCaptured !== true && this.origOwner !== tradeShipOwner) {
      this.wasCaptured = true;
    }

    // Various validation checks for trade viability...
    if (dstPortOwner.id() === this.srcPort.owner().id()) {
      this.tradeShip.delete(false);
      this.active = false;
      return;
    }

    if (
      !this.wasCaptured &&
      (!this._dstPort.isActive() || !tradeShipOwner.canTrade(dstPortOwner))
    ) {
      this.tradeShip.delete(false);
      this.active = false;
      return;
    }

    if (
      this.wasCaptured &&
      (tradeShipOwner !== dstPortOwner || !this._dstPort.isActive())
    ) {
      const ports = this.tradeShip
        .owner()
        .units(UnitType.Port)
        .sort(distSortUnit(this.mg, this.tradeShip));
      if (ports.length === 0) {
        this.tradeShip.delete(false);
        this.active = false;
        return;
      } else {
        this._dstPort = ports[0];
        this.tradeShip.setTargetUnit(this._dstPort);
      }
    }

    const curTile = this.tradeShip.tile();
    if (curTile === this.dstPort()) {
      this.complete();
      return;
    }

    const result = this.pathFinder.nextTile(curTile, this._dstPort.tile());

    switch (result.type) {
      case PathFindResultType.Pending:
        this.tradeShip.move(curTile);
        break;
      case PathFindResultType.NextTile:
        // KEY: Update safe status when near shoreline
        if (this.mg.isWater(result.node) && this.mg.isShoreline(result.node)) {
          this.tradeShip.setSafeFromPirates();
        }
        this.tradeShip.move(result.node);
        this.tilesTraveled++; // KEY: Track distance for gold calculation
        break;
      case PathFindResultType.Completed:
        this.complete();
        break;
      case PathFindResultType.PathNotFound:
        console.warn("captured trade ship cannot find route");
        if (this.tradeShip.isActive()) {
          this.tradeShip.delete(false);
        }
        this.active = false;
        break;
    }
  }

  // KEY GOLD DISTRIBUTION: Distance and port count determine reward
  private complete() {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (this.tradeShip === undefined) throw new Error("Not initialized");
    
    this.active = false;
    this.tradeShip.delete(false);
    
    const gold = this.mg
      .config()
      .tradeShipGold(
        this.tilesTraveled, // Distance traveled
        this.tradeShip.owner().unitCount(UnitType.Port), // Number of ports owned
      );

    if (this.wasCaptured) {
      // Captured ship - only captor gets gold
      this.tradeShip.owner().addGold(gold, this._dstPort.tile());
      this.mg.displayMessage(
        `Received ${renderNumber(gold)} gold from ship captured from ${this.origOwner.displayName()}`,
        MessageType.CAPTURED_ENEMY_UNIT,
        this.tradeShip.owner().id(),
        gold,
      );
    } else {
      // Normal trade - both parties get gold
      this.srcPort.owner().addGold(gold);
      this._dstPort.owner().addGold(gold, this._dstPort.tile());
      this.mg.displayMessage(
        `Received ${renderNumber(gold)} gold from trade with ${this.srcPort.owner().displayName()}`,
        MessageType.RECEIVED_GOLD_FROM_TRADE,
        this._dstPort.owner().id(),
        gold,
      );
      this.mg.displayMessage(
        `Received ${renderNumber(gold)} gold from trade with ${this._dstPort.owner().displayName()}`,
        MessageType.RECEIVED_GOLD_FROM_TRADE,
        this.srcPort.owner().id(),
        gold,
      );
    }
    return;
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }

  dstPort(): TileRef {
    return this._dstPort.tile();
  }
}

// ============================================================================
// PLAYER WORKER GOLD GENERATION (from PlayerExecution.ts)
// ============================================================================

export class PlayerExecution implements Execution {
  private readonly ticksPerClusterCalc = 20;
  private config: Config | undefined;
  private lastCalc = 0;
  private mg: Game | undefined;
  private active = true;

  constructor(private readonly player: Player) {}

  activeDuringSpawnPhase(): boolean {
    return false;
  }

  init(mg: Game, ticks: number) {
    this.mg = mg;
    this.config = mg.config();
    this.lastCalc =
      ticks + (simpleHash(this.player.name()) % this.ticksPerClusterCalc);
  }

  tick(ticks: number) {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (this.config === undefined) throw new Error("Not initialized");
    
    this.player.decayRelations();
    
    // Territory-bound unit validation
    this.player.units().forEach((u) => {
      const tileOwner = this.mg?.owner(u.tile());
      if (u.info().territoryBound) {
        if (tileOwner?.isPlayer()) {
          if (tileOwner !== this.player) {
            this.mg?.player(tileOwner.id()).captureUnit(u);
          }
        } else {
          u.delete();
        }
      }
    });

    if (!this.player.isAlive()) {
      // Player elimination logic
      const gold = this.player.gold();
      this.player.removeGold(gold);
      this.player.units().forEach((u) => {
        if (
          u.type() !== UnitType.AtomBomb &&
          u.type() !== UnitType.HydrogenBomb &&
          u.type() !== UnitType.MIRVWarhead &&
          u.type() !== UnitType.MIRV
        ) {
          u.delete();
        }
      });
      this.active = false;
      return;
    }

    // KEY WORKER ECONOMICS: Troops and gold generation every tick
    const troopInc = this.config.troopIncreaseRate(this.player);
    this.player.addTroops(troopInc);
    const goldFromWorkers = this.config.goldAdditionRate(this.player);
    this.player.addGold(goldFromWorkers);

    // Record stats
    this.mg.stats().goldWork(this.player, goldFromWorkers);

    // Alliance and embargo management
    const alliances = Array.from(this.player.alliances());
    for (const alliance of alliances) {
      if (alliance.expiresAt() <= this.mg.ticks()) {
        alliance.expire();
      }
    }

    const embargoes = this.player.getEmbargoes();
    for (const embargo of embargoes) {
      if (
        embargo.isTemporary &&
        this.mg.ticks() - embargo.createdAt >
          this.mg.config().temporaryEmbargoDuration()
      ) {
        this.player.stopEmbargo(embargo.target);
      }
    }

    // Cluster calculation for territory management
    if (ticks - this.lastCalc > this.ticksPerClusterCalc) {
      if (this.player.lastTileChange() > this.lastCalc) {
        this.lastCalc = ticks;
        const start = performance.now();
        this.removeClusters();
        const end = performance.now();
        if (end - start > 1000) {
          console.log(`player ${this.player.name()}, took ${end - start}ms`);
        }
      }
    }
  }

  // Territory cluster management for surrounded territories
  private removeClusters() {
    if (this.mg === undefined) throw new Error("Not initialized");
    const clusters = this.calculateClusters();
    clusters.sort((a, b) => b.size - a.size);

    const main = clusters.shift();
    if (main === undefined) throw new Error("No clusters");
    this.player.largestClusterBoundingBox = calculateBoundingBox(this.mg, main);
    const surroundedBy = this.surroundedBySamePlayer(main);
    if (surroundedBy && !this.player.isFriendly(surroundedBy)) {
      this.removeCluster(main);
    }

    for (const cluster of clusters) {
      if (this.isSurrounded(cluster)) {
        this.removeCluster(cluster);
      }
    }
  }

  // Complex territory analysis algorithms...
  private surroundedBySamePlayer(cluster: Set<TileRef>): false | Player {
    if (this.mg === undefined) throw new Error("Not initialized");
    const enemies = new Set<number>();
    for (const tile of cluster) {
      const isOceanShore = this.mg.isOceanShore(tile);
      if (this.mg.isOceanShore(tile) && !isOceanShore) {
        continue;
      }
      if (
        isOceanShore ||
        this.mg.isOnEdgeOfMap(tile) ||
        this.mg.neighbors(tile).some((n) => !this.mg?.hasOwner(n))
      ) {
        return false;
      }
      this.mg
        .neighbors(tile)
        .filter((n) => this.mg?.ownerID(n) !== this.player?.smallID())
        .forEach((p) => this.mg && enemies.add(this.mg.ownerID(p)));
      if (enemies.size !== 1) {
        return false;
      }
    }
    if (enemies.size !== 1) {
      return false;
    }
    const enemy = this.mg.playerBySmallID(Array.from(enemies)[0]) as Player;
    const enemyBox = calculateBoundingBox(this.mg, enemy.borderTiles());
    const clusterBox = calculateBoundingBox(this.mg, cluster);
    if (inscribed(enemyBox, clusterBox)) {
      return enemy;
    }
    return false;
  }

  private isSurrounded(cluster: Set<TileRef>): boolean {
    if (this.mg === undefined) throw new Error("Not initialized");
    const enemyTiles = new Set<TileRef>();
    for (const tr of cluster) {
      if (this.mg.isShore(tr) || this.mg.isOnEdgeOfMap(tr)) {
        return false;
      }
      this.mg
        .neighbors(tr)
        .filter(
          (n) =>
            this.mg?.owner(n).isPlayer() &&
            this.mg?.ownerID(n) !== this.player?.smallID(),
        )
        .forEach((n) => enemyTiles.add(n));
    }
    if (enemyTiles.size === 0) {
      return false;
    }
    const enemyBox = calculateBoundingBox(this.mg, enemyTiles);
    const clusterBox = calculateBoundingBox(this.mg, cluster);
    return inscribed(enemyBox, clusterBox);
  }

  private removeCluster(cluster: Set<TileRef>) {
    if (this.mg === undefined) throw new Error("Not initialized");
    if (
      Array.from(cluster).some(
        (t) => this.mg?.ownerID(t) !== this.player?.smallID(),
      )
    ) {
      return;
    }

    const capturing = this.getCapturingPlayer(cluster);
    if (capturing === null) {
      return;
    }

    const firstTile = cluster.values().next().value;
    if (!firstTile) {
      return;
    }

    const filter = (_: GameMap, t: TileRef): boolean =>
      this.mg?.ownerID(t) === this.player?.smallID();
    const tiles = this.mg.bfs(firstTile, filter);

    if (this.player.numTilesOwned() === tiles.size) {
      this.mg.conquerPlayer(capturing, this.player);
    }

    for (const tile of tiles) {
      capturing.conquer(tile);
    }
  }

  private getCapturingPlayer(cluster: Set<TileRef>): Player | null {
    if (this.mg === undefined) throw new Error("Not initialized");
    const neighborsIDs = new Set<number>();
    for (const t of cluster) {
      for (const neighbor of this.mg.neighbors(t)) {
        if (this.mg.ownerID(neighbor) !== this.player.smallID()) {
          neighborsIDs.add(this.mg.ownerID(neighbor));
        }
      }
    }

    let largestNeighborAttack: Player | null = null;
    let largestTroopCount = 0;
    for (const id of neighborsIDs) {
      const neighbor = this.mg.playerBySmallID(id);
      if (!neighbor.isPlayer() || this.player.isFriendly(neighbor)) {
        continue;
      }
      for (const attack of neighbor.outgoingAttacks()) {
        if (attack.target() === this.player) {
          if (attack.troops() > largestTroopCount) {
            largestTroopCount = attack.troops();
            largestNeighborAttack = neighbor;
          }
        }
      }
    }
    if (largestNeighborAttack !== null) {
      return largestNeighborAttack;
    }

    const mode = getMode(neighborsIDs);
    if (!this.mg.playerBySmallID(mode).isPlayer()) {
      return null;
    }
    const capturing = this.mg.playerBySmallID(mode);
    if (!capturing.isPlayer()) {
      return null;
    }
    return capturing;
  }

  private calculateClusters(): Set<TileRef>[] {
    const seen = new Set<TileRef>();
    const border = this.player.borderTiles();
    const clusters: Set<TileRef>[] = [];
    for (const tile of border) {
      if (seen.has(tile)) {
        continue;
      }

      const cluster = new Set<TileRef>();
      const queue: TileRef[] = [tile];
      seen.add(tile);
      while (queue.length > 0) {
        const curr = queue.shift();
        if (curr === undefined) throw new Error("curr is undefined");
        cluster.add(curr);

        const neighbors = (this.mg as GameImpl).neighborsWithDiag(curr);
        for (const neighbor of neighbors) {
          if (border.has(neighbor) && !seen.has(neighbor)) {
            queue.push(neighbor);
            seen.add(neighbor);
          }
        }
      }
      clusters.push(cluster);
    }
    return clusters;
  }

  owner(): Player {
    if (this.player === null) {
      throw new Error("Not initialized");
    }
    return this.player;
  }

  isActive(): boolean {
    return this.active;
  }
}

// ============================================================================
// A* PATHFINDING ALGORITHM (from SerialAStar.ts)
// ============================================================================

export enum PathFindResultType {
  Pending = "Pending",
  Completed = "Completed", 
  PathNotFound = "PathNotFound",
  NextTile = "NextTile"
}

export interface AStar<NodeType> {
  compute(): PathFindResultType;
  reconstructPath(): NodeType[];
}

export type GraphAdapter<NodeType> = {
  neighbors(node: NodeType): NodeType[];
  cost(node: NodeType): number;
  position(node: NodeType): { x: number; y: number };
  isTraversable(from: NodeType, to: NodeType): boolean;
};

export class SerialAStar<NodeType> implements AStar<NodeType> {
  private readonly fwdOpenSet: FastPriorityQueue<{
    tile: NodeType;
    fScore: number;
  }>;
  private readonly bwdOpenSet: FastPriorityQueue<{
    tile: NodeType;
    fScore: number;
  }>;

  private readonly fwdCameFrom = new Map<NodeType, NodeType>();
  private readonly bwdCameFrom = new Map<NodeType, NodeType>();
  private readonly fwdGScore = new Map<NodeType, number>();
  private readonly bwdGScore = new Map<NodeType, number>();

  private meetingPoint: NodeType | null = null;
  public completed = false;
  private readonly sources: NodeType[];
  private readonly closestSource: NodeType;

  constructor(
    src: NodeType | NodeType[],
    private readonly dst: NodeType,
    private readonly iterations: number,
    private maxTries: number,
    private readonly graph: GraphAdapter<NodeType>,
    private readonly directionChangePenalty = 0,
  ) {
    this.fwdOpenSet = new FastPriorityQueue((a, b) => a.fScore < b.fScore);
    this.bwdOpenSet = new FastPriorityQueue((a, b) => a.fScore < b.fScore);
    this.sources = Array.isArray(src) ? src : [src];
    this.closestSource = this.findClosestSource(dst);

    // Initialize forward search with source point(s)
    this.sources.forEach((startPoint) => {
      this.fwdGScore.set(startPoint, 0);
      this.fwdOpenSet.add({
        tile: startPoint,
        fScore: this.heuristic(startPoint, dst),
      });
    });

    // Initialize backward search from destination
    this.bwdGScore.set(dst, 0);
    this.bwdOpenSet.add({
      tile: dst,
      fScore: this.heuristic(dst, this.findClosestSource(dst)),
    });
  }

  private findClosestSource(tile: NodeType): NodeType {
    return this.sources.reduce((closest, source) =>
      this.heuristic(tile, source) < this.heuristic(tile, closest)
        ? source
        : closest,
    );
  }

  // KEY: Bidirectional A* for improved performance
  compute(): PathFindResultType {
    if (this.completed) return PathFindResultType.Completed;

    this.maxTries -= 1;
    let { iterations } = this;

    while (!this.fwdOpenSet.isEmpty() && !this.bwdOpenSet.isEmpty()) {
      iterations--;
      if (iterations <= 0) {
        if (this.maxTries <= 0) {
          return PathFindResultType.PathNotFound;
        }
        return PathFindResultType.Pending;
      }

      // Process forward search
      const fwdCurrent = this.fwdOpenSet.poll()!.tile;

      // Check if we've found a meeting point
      if (this.bwdGScore.has(fwdCurrent)) {
        this.meetingPoint = fwdCurrent;
        this.completed = true;
        return PathFindResultType.Completed;
      }
      this.expandNode(fwdCurrent, true);

      // Process backward search
      const bwdCurrent = this.bwdOpenSet.poll()!.tile;

      // Check if we've found a meeting point
      if (this.fwdGScore.has(bwdCurrent)) {
        this.meetingPoint = bwdCurrent;
        this.completed = true;
        return PathFindResultType.Completed;
      }
      this.expandNode(bwdCurrent, false);
    }

    return this.completed
      ? PathFindResultType.Completed
      : PathFindResultType.PathNotFound;
  }

  private expandNode(current: NodeType, isForward: boolean) {
    for (const neighbor of this.graph.neighbors(current)) {
      if (
        neighbor !== (isForward ? this.dst : this.closestSource) &&
        !this.graph.isTraversable(current, neighbor)
      )
        continue;

      const gScore = isForward ? this.fwdGScore : this.bwdGScore;
      const openSet = isForward ? this.fwdOpenSet : this.bwdOpenSet;
      const cameFrom = isForward ? this.fwdCameFrom : this.bwdCameFrom;

      const tentativeGScore = (gScore.get(current) ?? 0) + this.graph.cost(neighbor);
      let penalty = 0;
      
      // Direction change penalty for straighter paths
      if (this.directionChangePenalty > 0) {
        const prev = cameFrom.get(current);
        if (prev) {
          const prevDir = this.getDirection(prev, current);
          const newDir = this.getDirection(current, neighbor);
          if (prevDir !== newDir) {
            penalty = this.directionChangePenalty;
          }
        }
      }

      const totalG = tentativeGScore + penalty;
      const g = gScore.get(neighbor);
      if (g === undefined || totalG < g) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, totalG);
        const fScore =
          totalG +
          this.heuristic(neighbor, isForward ? this.dst : this.closestSource);
        openSet.add({ tile: neighbor, fScore });
      }
    }
  }

  // Manhattan distance heuristic
  private heuristic(a: NodeType, b: NodeType): number {
    const posA = this.graph.position(a);
    const posB = this.graph.position(b);
    return 2 * (Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y));
  }

  private getDirection(from: NodeType, to: NodeType): string {
    const fromPos = this.graph.position(from);
    const toPos = this.graph.position(to);
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    return `${Math.sign(dx)},${Math.sign(dy)}`;
  }

  public reconstructPath(): NodeType[] {
    if (!this.meetingPoint) return [];

    // Reconstruct path from start to meeting point
    const fwdPath: NodeType[] = [this.meetingPoint];
    let current: NodeType = this.meetingPoint;

    let f = this.fwdCameFrom.get(current);
    while (f !== undefined) {
      current = f;
      fwdPath.unshift(current);
      f = this.fwdCameFrom.get(current);
    }

    // Reconstruct path from meeting point to goal
    current = this.meetingPoint;

    let b = this.bwdCameFrom.get(current);
    while (b !== undefined) {
      current = b;
      fwdPath.push(current);
      b = this.bwdCameFrom.get(current);
    }

    return fwdPath;
  }
}

// ============================================================================
// RAIL NETWORK IMPLEMENTATION (from RailNetworkImpl.ts)
// ============================================================================

export type StationManager = {
  addStation(station: TrainStation): void;
  removeStation(station: TrainStation): void;
  findStation(unit: Unit): TrainStation | null;
  getAll(): Set<TrainStation>;
};

export class StationManagerImpl implements StationManager {
  private readonly stations: Set<TrainStation> = new Set();

  addStation(station: TrainStation) {
    this.stations.add(station);
  }

  removeStation(station: TrainStation) {
    this.stations.delete(station);
  }

  findStation(unit: Unit): TrainStation | null {
    for (const station of this.stations) {
      if (station.unit === unit) return station;
    }
    return null;
  }

  getAll(): Set<TrainStation> {
    return this.stations;
  }
}

export type RailPathFinderService = {
  findTilePath(from: TileRef, to: TileRef): TileRef[];
  findStationsPath(from: TrainStation, to: TrainStation): TrainStation[];
};

class RailPathFinderServiceImpl implements RailPathFinderService {
  constructor(private readonly game: Game) {}

  findTilePath(from: TileRef, to: TileRef): TileRef[] {
    const astar = new MiniAStar(
      this.game.map(),
      this.game.miniMap(),
      from,
      to,
      5000, // iterations
      20,   // max tries
      false, // water path
      3,    // direction change penalty
    );
    return astar.compute() === PathFindResultType.Completed
      ? astar.reconstructPath()
      : [];
  }

  findStationsPath(from: TrainStation, to: TrainStation): TrainStation[] {
    const stationAStar = new SerialAStar(
      from,
      to,
      5000, // iterations
      20,   // max tries
      new TrainStationMapAdapter(this.game),
    );
    return stationAStar.compute() === PathFindResultType.Completed
      ? stationAStar.reconstructPath()
      : [];
  }
}

export class RailNetworkImpl implements RailNetwork {
  private readonly maxConnectionDistance = 4; // KEY: Max 4 stations between connections

  constructor(
    private readonly game: Game,
    private readonly stationManager: StationManager,
    private readonly pathService: RailPathFinderService,
  ) {}

  connectStation(station: TrainStation) {
    this.stationManager.addStation(station);
    this.connectToNearbyStations(station);
  }

  removeStation(unit: Unit): void {
    const station = this.stationManager.findStation(unit);
    if (!station) return;

    const neighbors = station.neighbors();
    this.disconnectFromNetwork(station);
    this.stationManager.removeStation(station);

    const cluster = station.getCluster();
    if (!cluster) return;
    if (neighbors.length === 1) {
      cluster.removeStation(station);
    } else if (neighbors.length > 1) {
      // Rebuild clusters when removing a hub station
      for (const neighbor of neighbors) {
        const stations = this.computeCluster(neighbor);
        const newCluster = new Cluster();
        newCluster.addStations(stations);
      }
    }
    station.unit.setTrainStation(false);
  }

  findStationsPath(from: TrainStation, to: TrainStation): TrainStation[] {
    return this.pathService.findStationsPath(from, to);
  }

  // KEY CLUSTERING ALGORITHM: Connect to nearby stations and manage clusters
  private connectToNearbyStations(station: TrainStation) {
    const neighbors = this.game.nearbyUnits(
      station.tile(),
      this.game.config().trainStationMaxRange(), // 80 tile range
      [UnitType.City, UnitType.Factory, UnitType.Port],
    );

    const editedClusters = new Set<Cluster>();
    neighbors.sort((a, b) => a.distSquared - b.distSquared);

    for (const neighbor of neighbors) {
      if (neighbor.unit === station.unit) continue;
      const neighborStation = this.stationManager.findStation(neighbor.unit);
      if (!neighborStation) continue;

      const distanceToStation = this.distanceFrom(
        neighborStation,
        station,
        this.maxConnectionDistance,
      );

      const neighborCluster = neighborStation.getCluster();
      if (neighborCluster === null) continue;
      const connectionAvailable =
        distanceToStation > this.maxConnectionDistance ||
        distanceToStation === -1;
      if (
        connectionAvailable &&
        neighbor.distSquared > this.game.config().trainStationMinRange() ** 2
      ) {
        if (this.connect(station, neighborStation)) {
          neighborCluster.addStation(station);
          editedClusters.add(neighborCluster);
        }
      }
    }

    // Merge clusters when multiple clusters connect to new station
    if (editedClusters.size > 1) {
      this.mergeClusters(editedClusters);
    } else if (editedClusters.size === 0) {
      // Create new cluster for isolated station
      const newCluster = new Cluster();
      newCluster.addStation(station);
    }
  }

  private disconnectFromNetwork(station: TrainStation) {
    for (const rail of station.getRailroads()) {
      rail.delete(this.game);
    }
    station.clearRailroads();
    const cluster = station.getCluster();
    if (cluster !== null && cluster.size() === 1) {
      this.deleteCluster(cluster);
    }
  }

  private deleteCluster(cluster: Cluster) {
    for (const station of cluster.stations) {
      station.setCluster(null);
    }
    cluster.clear();
  }

  // KEY: Railroad creation with pathfinding and size limits
  private connect(from: TrainStation, to: TrainStation) {
    const path = this.pathService.findTilePath(from.tile(), to.tile());
    if (path.length > 0 && path.length < this.game.config().railroadMaxSize()) {
      const railRoad = new Railroad(from, to, path);
      this.game.addExecution(new RailroadExecution(railRoad));
      from.addRailroad(railRoad);
      to.addRailroad(railRoad);
      return true;
    }
    return false;
  }

  // BFS to find distance between stations (for connection limits)
  private distanceFrom(
    start: TrainStation,
    dest: TrainStation,
    maxDistance: number,
  ): number {
    if (start === dest) return 0;

    const visited = new Set<TrainStation>();
    const queue: Array<{ station: TrainStation; distance: number }> = [
      { station: start, distance: 0 },
    ];

    let head = 0;
    while (head < queue.length) {
      const { station, distance } = queue[head++];
      if (visited.has(station)) continue;
      visited.add(station);

      if (distance >= maxDistance) continue;

      for (const neighbor of station.neighbors()) {
        if (neighbor === dest) return distance + 1;
        if (!visited.has(neighbor)) {
          queue.push({ station: neighbor, distance: distance + 1 });
        }
      }
    }

    return -1; // Not found within maxDistance
  }

  // BFS to compute connected stations for clustering
  private computeCluster(start: TrainStation): Set<TrainStation> {
    const visited = new Set<TrainStation>();
    const queue = [start];

    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      if (visited.has(current)) continue;
      visited.add(current);

      for (const neighbor of current.neighbors()) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }

    return visited;
  }

  private mergeClusters(clustersToMerge: Set<Cluster>) {
    const merged = new Cluster();
    for (const cluster of clustersToMerge) {
      merged.merge(cluster);
    }
  }
}

// ============================================================================
// UTILITY CLASSES AND FUNCTIONS
// ============================================================================

export class PseudoRandom {
  constructor(private seed: number) {}
  
  chance(rate: number): boolean {
    // Simplified random implementation
    return Math.random() < rate / 10000;
  }
  
  randFromSet<T>(set: Set<T>): T {
    const items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
  }
  
  randElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

export class MiniAStar implements AStar<TileRef> {
  private readonly aStar: AStar<TileRef>;

  constructor(
    private readonly gameMap: GameMap,
    private readonly miniMap: GameMap,
    private readonly src: TileRef | TileRef[],
    private readonly dst: TileRef,
    iterations: number,
    maxTries: number,
    waterPath = true,
    directionChangePenalty = 0,
  ) {
    const srcArray: TileRef[] = Array.isArray(src) ? src : [src];
    const miniSrc = srcArray.map((srcPoint) =>
      this.miniMap.ref(
        Math.floor(gameMap.x(srcPoint) / 2),
        Math.floor(gameMap.y(srcPoint) / 2),
      ),
    );

    const miniDst = this.miniMap.ref(
      Math.floor(gameMap.x(dst) / 2),
      Math.floor(gameMap.y(dst) / 2),
    );

    this.aStar = new SerialAStar(
      miniSrc,
      miniDst,
      iterations,
      maxTries,
      new GameMapAdapter(miniMap, waterPath),
      directionChangePenalty,
    );
  }

  compute(): PathFindResultType {
    return this.aStar.compute();
  }

  reconstructPath(): TileRef[] {
    // Path reconstruction and upscaling logic...
    return this.aStar.reconstructPath();
  }
}

export class GameMapAdapter implements GraphAdapter<TileRef> {
  private readonly waterPenalty = 3;
  
  constructor(
    private readonly gameMap: GameMap,
    private readonly waterPath: boolean,
  ) {}

  neighbors(node: TileRef): TileRef[] {
    return this.gameMap.neighbors(node);
  }

  cost(node: TileRef): number {
    let base = this.gameMap.cost(node);
    if (!this.waterPath && this.gameMap.isWater(node)) {
      base += this.waterPenalty;
    }
    return base;
  }

  position(node: TileRef): { x: number; y: number } {
    return { x: this.gameMap.x(node), y: this.gameMap.y(node) };
  }

  isTraversable(from: TileRef, to: TileRef): boolean {
    const toWater = this.gameMap.isWater(to);
    if (this.waterPath) {
      return toWater;
    }
    const fromShore = this.gameMap.isShoreline(from);
    const toShore = this.gameMap.isShoreline(to);
    return !toWater || fromShore || toShore;
  }
}

// Additional types and interfaces for completeness
export interface Railroad {
  from: TrainStation;
  to: TrainStation; 
  tiles: TileRef[];
  delete(game: Game): void;
}

export interface OrientedRailroad {
  getTiles(): TileRef[];
}

export interface PathFinder {
  nextTile(from: TileRef, to: TileRef): {type: PathFindResultType, node?: TileRef};
  static Mini(game: Game, iterations: number): PathFinder;
}

export interface FastPriorityQueue<T> {
  isEmpty(): boolean;
  add(item: T): void;
  poll(): T | undefined;
}

export interface GameImpl extends Game {
  neighborsWithDiag(tile: TileRef): TileRef[];
}

export interface RailroadExecution extends Execution {
  constructor(railroad: Railroad): RailroadExecution;
}

export type GameUpdateType = any;
export type RailTile = any;
export type RailType = any;

// Utility functions
export function getOrientedRailroad(from: TrainStation, to: TrainStation): OrientedRailroad | null {
  // Implementation would return oriented railroad between stations
  return null;
}

export function distSortUnit(game: Game, unit: Unit) {
  return (a: Unit, b: Unit) => {
    // Sort by distance from unit
    return 0;
  };
}

export function renderNumber(gold: Gold): string {
  return gold.toString();
}

export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function calculateBoundingBox(game: Game, tiles: Set<TileRef>): any {
  return null;
}

export function getMode(numbers: Set<number>): number {
  return Array.from(numbers)[0] ?? 0;
}

export function inscribed(box1: any, box2: any): boolean {
  return false;
}

export function within(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * =============================================================================
 * KEY ECONOMIC INSIGHTS FOR OPTIMIZATION:
 * =============================================================================
 * 
 * TRAIN ECONOMICS:
 * - Spawn rate: 40 * sqrt(connected_stations), max 1400
 * - Gold: 25k normal, 100k friendly (4x multiplier!)  
 * - Cities/Ports: Gold multiplied by (level + 1)
 * - Factories: Base gold only, no level multiplier
 * - Train frequency: 10 tick cooldown minimum
 * - Connection range: 15-80 tiles, max 4 hops between stations
 * - Only factories spawn trains automatically
 * 
 * TRADE SHIP ECONOMICS:
 * - Base: 50k + 100 per tile traveled
 * - Port bonus: 25% per port with 90% diminishing returns  
 * - Spawn rate increases with existing ships (power law)
 * - Both parties get equal gold in normal trade
 * 
 * WORKER ECONOMICS:
 * - Base gold: 100 per tick per player
 * - Troop generation: 10 + troops^0.73 / 4, with diminishing returns
 * 
 * OPTIMIZATION STRATEGIES:
 * 1. Build factory networks for train spawning
 * 2. Maximize friendly connections (4x gold multiplier)
 * 3. Upgrade cities/ports for level multipliers
 * 4. Build many ports for compounding trade bonuses
 * 5. Keep trade routes long for distance bonuses
 * 6. Cluster buildings within 80 tiles for train connections
 * =============================================================================
 */