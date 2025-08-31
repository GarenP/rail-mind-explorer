// Simple simulation of economic mechanics with Australian map
interface Drawable {
  x: number;
  y: number;
  draw(ctx: CanvasRenderingContext2D): void;
}

abstract class Node implements Drawable {
  goods: number;
  constructor(
    public x: number,
    public y: number,
    public color: string,
    goods = 0
  ) {
    this.goods = goods;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

class City extends Node {}

class Factory extends Node {
  produce() {
    this.goods += 0.1;
  }
}

class Port extends Node {}

class Train {
  x: number;
  y: number;
  cargo = 0;
  constructor(
    public from: Node,
    public to: Node,
    public speed = 1,
    public capacity = 10
  ) {
    this.x = from.x;
    this.y = from.y;
  }
  update() {
    const dx = this.to.x - this.x;
    const dy = this.to.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < this.speed) {
      this.x = this.to.x;
      this.y = this.to.y;
      this.handleArrival();
      [this.from, this.to] = [this.to, this.from];
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }
  handleArrival() {
    if (this.cargo === 0) {
      const load = Math.min(this.capacity, this.from.goods);
      this.from.goods -= load;
      this.cargo = load;
    } else {
      this.to.goods += this.cargo;
      this.cargo = 0;
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x - 4, this.y - 4, 8, 8);
  }
}

class Game {
  private ctx: CanvasRenderingContext2D;
  private entities: Node[] = [];
  private trains: Train[] = [];
  private mapImage: HTMLImageElement;
  // minimal player stats for UI overlay
  private playerName = "[TRAIN] Texas Batman";
  private population = 96.7e6;
  private troops = 3.4e6;
  private gold = 3.01e6;
  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not supported");
    this.ctx = context;
    this.mapImage = new Image();
    // use an inline SVG map to avoid binary assets
    this.mapImage.src = "/australia_map.svg";
    this.mapImage.onload = () => requestAnimationFrame(this.loop);
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.setup();
  }
  private setup() {
    const factory = new Factory(520, 250, "gray", 50);
    const city = new City(500, 300, "blue");
    const port = new Port(200, 300, "green");
    this.entities.push(factory, city, port);
    this.trains.push(new Train(factory, city, 1.5), new Train(city, port, 1.5));
  }
  private loop = () => {
    this.update();
    this.render();
    requestAnimationFrame(this.loop);
  };
  private update() {
    this.entities.forEach((e) => {
      if (e instanceof Factory) e.produce();
    });
    this.trains.forEach((t) => t.update());
  }
  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMap();
    this.entities.forEach((e) => e.draw(this.ctx));
    this.trains.forEach((t) => t.draw(this.ctx));
    this.drawGoods();
    this.drawUI();
  }
  private drawMap() {
    if (this.mapImage.complete) {
      this.ctx.drawImage(
        this.mapImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    } else {
      this.ctx.fillStyle = "#e5c37e";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  private drawGoods() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "12px sans-serif";
    this.ctx.textAlign = "center";
    this.entities.forEach((e) => {
      this.ctx.fillText(e.goods.toFixed(0), e.x, e.y - 12);
    });
  }
  private drawUI() {
    const ctx = this.ctx;
    // central player label
    ctx.fillStyle = "yellow";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${this.playerName} ${(this.population / 1e6).toFixed(1)}M`,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    // bottom-left stats background
    ctx.textAlign = "left";
    const boxHeight = 50;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(10, this.canvas.height - boxHeight - 10, 230, boxHeight);
    ctx.fillStyle = "white";
    ctx.font = "14px sans-serif";
    ctx.fillText(
      `Troops: ${(this.troops / 1e6).toFixed(1)}M / 100M (+35.0)`,
      20,
      this.canvas.height - boxHeight / 2
    );
    ctx.fillText(
      `Gold: ${(this.gold / 1e6).toFixed(2)}M`,
      20,
      this.canvas.height - 15
    );
  }
  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game") as HTMLCanvasElement;
  new Game(canvas);
});
