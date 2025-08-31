// Simple simulation of economic mechanics with Australian map
interface Entity {
  x: number;
  y: number;
  draw(ctx: CanvasRenderingContext2D): void;
}

abstract class BaseEntity implements Entity {
  constructor(public x: number, public y: number) {}
  abstract color: string;
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

class City extends BaseEntity {
  color = "blue";
  goods = 0;
}

class Factory extends BaseEntity {
  color = "gray";
  goods = 50;
  produce() {
    this.goods += 0.1;
  }
}

class Port extends BaseEntity {
  color = "green";
  goods = 0;
}

class Train {
  x: number;
  y: number;
  cargo = 0;
  constructor(
    public from: BaseEntity,
    public to: BaseEntity,
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
    if (this.from instanceof Factory && this.cargo === 0) {
      const load = Math.min(this.capacity, this.from.goods);
      this.from.goods -= load;
      this.cargo = load;
    } else if (this.from instanceof City && this.cargo === 0) {
      const load = Math.min(this.capacity, this.from.goods);
      this.from.goods -= load;
      this.cargo = load;
    } else {
      if (this.to instanceof City) {
        (this.to as City).goods += this.cargo;
      } else if (this.to instanceof Port) {
        (this.to as Port).goods += this.cargo;
      } else if (this.to instanceof Factory) {
        (this.to as Factory).goods += this.cargo;
      }
      this.cargo = 0;
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x - 4, this.y - 4, 8, 8);
  }
}

class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  entities: BaseEntity[] = [];
  trains: Train[] = [];
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not supported");
    this.ctx = context;
    this.setup();
    requestAnimationFrame(this.loop);
  }
  setup() {
    const factory = new Factory(520, 250);
    const city = new City(500, 300);
    const port = new Port(200, 300);
    this.entities.push(factory, city, port);
    this.trains.push(new Train(factory, city, 1.5), new Train(city, port, 1.5));
  }
  loop = () => {
    this.update();
    this.render();
    requestAnimationFrame(this.loop);
  };
  update() {
    this.entities.forEach((e) => {
      if (e instanceof Factory) e.produce();
    });
    this.trains.forEach((t) => t.update());
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMap();
    this.entities.forEach((e) => e.draw(this.ctx));
    this.trains.forEach((t) => t.draw(this.ctx));
  }
  drawMap() {
    const ctx = this.ctx;
    ctx.fillStyle = "#e5c37e";
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(600, 120);
    ctx.lineTo(650, 320);
    ctx.lineTo(450, 550);
    ctx.lineTo(150, 480);
    ctx.closePath();
    ctx.fill();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game") as HTMLCanvasElement;
  new Game(canvas);
});
