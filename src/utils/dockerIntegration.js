// Docker integration utilities for OpenFrontIO single player

export class DockerGameManager {
  constructor() {
    this.gameContainer = null;
    this.gameUrl = 'http://localhost:8080'; // Docker container port
  }

  async startSinglePlayerGame(gameConfig) {
    try {
      console.log('Starting OpenFrontIO single player game with config:', gameConfig);
      
      // Check if Docker container is already running
      const isRunning = await this.checkContainerStatus();
      
      if (!isRunning) {
        // Start the Docker container
        await this.startContainer();
      }
      
      // Configure the game with selected options
      await this.configureGame(gameConfig);
      
      // Redirect to the game
      this.redirectToGame();
      
    } catch (error) {
      console.error('Failed to start single player game:', error);
      throw new Error(`Game startup failed: ${error.message}`);
    }
  }

  async checkContainerStatus() {
    try {
      const response = await fetch(this.gameUrl + '/health', {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.log('Container not running or not accessible');
      return false;
    }
  }

  async startContainer() {
    console.log('Starting OpenFrontIO Docker container...');
    
    // In a real implementation, this would trigger Docker container startup
    // For now, we'll show instructions to the user
    
    const instructions = `
To start the OpenFrontIO single player game:

1. Open a terminal/command prompt
2. Navigate to the core folder
3. Run: docker build -f Dockerfile.singleplayer -t openfront-sp .
4. Run: docker run --rm -p 8080:8080 openfront-sp

The game will be available at http://localhost:8080
    `;
    
    alert(instructions);
    
    // Wait for user to start the container
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        const isRunning = await this.checkContainerStatus();
        if (isRunning) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 2000);
      
      // Timeout after 2 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(false);
      }, 120000);
    });
  }

  async configureGame(gameConfig) {
    // Send game configuration to the running container
    try {
      await fetch(this.gameUrl + '/api/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameConfig)
      });
    } catch (error) {
      console.warn('Could not configure game:', error);
      // Continue anyway, game will use defaults
    }
  }

  redirectToGame() {
    // Open the game in a new window/tab
    window.open(this.gameUrl, '_blank');
  }
}

export const dockerGameManager = new DockerGameManager();