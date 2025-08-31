// Simplified OpenFrontIO game engine for browser play
export class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gameState = {
      isRunning: false,
      selectedMap: null,
      difficulty: 'Medium',
      gameMode: 'FFA'
    };
    this.entities = [];
    this.gameLoop = null;
  }

  async initialize(containerId = 'game-container') {
    // Create fullscreen canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '1000';
    this.canvas.style.backgroundColor = '#1a1a2e';
    this.canvas.style.touchAction = 'none';
    
    // Set canvas resolution
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.ctx = this.canvas.getContext('2d');
    
    // Add to DOM
    document.body.appendChild(this.canvas);
    
    // Handle resize
    window.addEventListener('resize', () => this.handleResize());
    
    // Add input handlers
    this.setupInputHandlers();
    
    // Add exit handler
    this.addExitButton();
    
    console.log('Game engine initialized');
    return true;
  }

  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupInputHandlers() {
    // Basic mouse/touch controls
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  addExitButton() {
    const exitBtn = document.createElement('button');
    exitBtn.textContent = '✕ Exit Game';
    exitBtn.style.position = 'fixed';
    exitBtn.style.top = '20px';
    exitBtn.style.right = '20px';
    exitBtn.style.zIndex = '1001';
    exitBtn.style.padding = '10px 20px';
    exitBtn.style.backgroundColor = '#ff4444';
    exitBtn.style.color = 'white';
    exitBtn.style.border = 'none';
    exitBtn.style.borderRadius = '5px';
    exitBtn.style.cursor = 'pointer';
    exitBtn.style.fontFamily = 'Arial, sans-serif';
    
    exitBtn.addEventListener('click', () => this.exitGame());
    document.body.appendChild(exitBtn);
  }

  async startGame(config) {
    console.log('Starting game with config:', config);
    
    this.gameState = {
      ...this.gameState,
      ...config,
      isRunning: true
    };

    // Load map data
    await this.loadMap(config.map);
    
    // Initialize game entities
    this.initializeGameEntities();
    
    // Start game loop
    this.startGameLoop();
    
    return true;
  }

  async loadMap(mapType) {
    console.log(`Loading map: ${mapType}`);
    
    // For now, create a simple procedural map
    // In a full implementation, this would load from core/resources/maps/
    this.mapData = {
      name: mapType,
      width: this.canvas.width,
      height: this.canvas.height,
      landmass: this.generateLandmass()
    };
    
    console.log('Map loaded successfully');
  }

  generateLandmass() {
    // Generate a simple landmass for demonstration
    const points = [];
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(this.canvas.width, this.canvas.height) / 3;
    
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const variation = 0.7 + Math.random() * 0.6; // Random variation
      points.push({
        x: centerX + Math.cos(angle) * radius * variation,
        y: centerY + Math.sin(angle) * radius * variation
      });
    }
    
    return points;
  }

  initializeGameEntities() {
    // Add some basic entities for gameplay
    this.entities = [];
    
    // Add cities
    for (let i = 0; i < 5; i++) {
      const point = this.mapData.landmass[i * 4];
      if (point) {
        this.entities.push({
          type: 'city',
          x: point.x + (Math.random() - 0.5) * 100,
          y: point.y + (Math.random() - 0.5) * 100,
          size: 8,
          color: '#4a9eff',
          population: Math.floor(Math.random() * 1000) + 500
        });
      }
    }
    
    // Add ports
    for (let i = 0; i < 3; i++) {
      const point = this.mapData.landmass[i * 6];
      if (point) {
        this.entities.push({
          type: 'port',
          x: point.x + (Math.random() - 0.5) * 150,
          y: point.y + (Math.random() - 0.5) * 150,
          size: 6,
          color: '#00ff88',
          goods: Math.floor(Math.random() * 500)
        });
      }
    }
  }

  startGameLoop() {
    const loop = () => {
      if (!this.gameState.isRunning) return;
      
      this.update();
      this.render();
      
      this.gameLoop = requestAnimationFrame(loop);
    };
    
    loop();
  }

  update() {
    // Update game entities
    this.entities.forEach(entity => {
      if (entity.type === 'city') {
        entity.population += Math.random() * 2 - 1; // Slight population changes
        entity.population = Math.max(100, entity.population);
      }
    });
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw water
    this.ctx.fillStyle = '#2c5aa0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw landmass
    if (this.mapData && this.mapData.landmass) {
      this.ctx.fillStyle = '#4a7c59';
      this.ctx.beginPath();
      this.mapData.landmass.forEach((point, index) => {
        if (index === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      this.ctx.closePath();
      this.ctx.fill();
      
      // Add landmass outline
      this.ctx.strokeStyle = '#3a6c49';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
    
    // Draw entities
    this.entities.forEach(entity => {
      this.ctx.fillStyle = entity.color;
      this.ctx.beginPath();
      this.ctx.arc(entity.x, entity.y, entity.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw labels
      this.ctx.fillStyle = 'white';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      let label = '';
      
      if (entity.type === 'city') {
        label = `City (${Math.floor(entity.population)})`;
      } else if (entity.type === 'port') {
        label = `Port (${Math.floor(entity.goods)})`;
      }
      
      this.ctx.fillText(label, entity.x, entity.y - entity.size - 5);
    });
    
    // Draw UI
    this.drawUI();
  }

  drawUI() {
    // Game info
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 300, 120);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Map: ${this.gameState.selectedMap}`, 20, 35);
    this.ctx.fillText(`Difficulty: ${this.gameState.difficulty}`, 20, 55);
    this.ctx.fillText(`Mode: ${this.gameState.gameMode}`, 20, 75);
    this.ctx.fillText(`Entities: ${this.entities.length}`, 20, 95);
    this.ctx.fillText('Click entities to interact', 20, 115);
    
    // Instructions
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, this.canvas.height - 80, 400, 70);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('Controls:', 20, this.canvas.height - 60);
    this.ctx.fillText('• Click entities to select them', 20, this.canvas.height - 40);
    this.ctx.fillText('• Press ESC or click Exit to return to menu', 20, this.canvas.height - 20);
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on an entity
    this.entities.forEach(entity => {
      const dist = Math.hypot(x - entity.x, y - entity.y);
      if (dist < entity.size + 10) {
        console.log(`Clicked on ${entity.type}:`, entity);
        this.selectEntity(entity);
      }
    });
  }

  selectEntity(entity) {
    // Simple selection feedback
    entity.selected = !entity.selected;
    entity.color = entity.selected ? '#ffff00' : (entity.type === 'city' ? '#4a9eff' : '#00ff88');
  }

  handleMouseMove(e) {
    // Could add hover effects here
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.exitGame();
    }
  }

  exitGame() {
    console.log('Exiting game');
    
    // Stop game loop
    this.gameState.isRunning = false;
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    
    // Remove canvas and exit button
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    // Remove exit button
    const exitBtn = document.querySelector('button');
    if (exitBtn && exitBtn.textContent.includes('Exit Game')) {
      exitBtn.parentNode.removeChild(exitBtn);
    }
    
    // Dispatch exit event
    window.dispatchEvent(new CustomEvent('gameExit'));
  }

  destroy() {
    this.exitGame();
  }
}

export const gameEngine = new GameEngine();