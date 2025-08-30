import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Node {
  id: string;
  x: number;
  y: number;
  type: "station" | "factory" | "depot";
  status: "active" | "inactive" | "busy";
  connections: string[];
  goldProduction?: number;
}

interface Edge {
  from: string;
  to: string;
  traffic: "low" | "medium" | "high";
  distance: number;
}

export const NetworkGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: "S1", x: 150, y: 100, type: "station", status: "active", connections: ["S2", "F1"], goldProduction: 150 },
    { id: "S2", x: 350, y: 150, type: "station", status: "busy", connections: ["S1", "S3"], goldProduction: 230 },
    { id: "S3", x: 250, y: 280, type: "station", status: "active", connections: ["S2", "F2"], goldProduction: 180 },
    { id: "F1", x: 80, y: 200, type: "factory", status: "active", connections: ["S1"] },
    { id: "F2", x: 400, y: 250, type: "factory", status: "busy", connections: ["S3"] },
    { id: "D1", x: 200, y: 50, type: "depot", status: "active", connections: ["S1"] },
  ]);

  const [edges] = useState<Edge[]>([
    { from: "S1", to: "S2", traffic: "high", distance: 45 },
    { from: "S1", to: "F1", traffic: "medium", distance: 28 },
    { from: "S2", to: "S3", traffic: "medium", distance: 38 },
    { from: "S3", to: "F2", traffic: "low", distance: 32 },
    { from: "D1", to: "S1", traffic: "low", distance: 22 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges first
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      
      // Color based on traffic
      const colors = {
        low: "rgba(142, 76, 36, 0.6)",
        medium: "rgba(35, 100, 60, 0.8)", 
        high: "rgba(0, 98, 60, 1)"
      };
      
      ctx.strokeStyle = colors[edge.traffic];
      ctx.lineWidth = edge.traffic === "high" ? 3 : edge.traffic === "medium" ? 2 : 1;
      ctx.stroke();

      // Add glow effect for high traffic
      if (edge.traffic === "high") {
        ctx.shadowColor = "hsl(142, 76%, 36%)";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI);
      
      // Color based on type and status
      const colors = {
        station: { 
          active: "hsl(200, 98%, 60%)", 
          busy: "hsl(35, 100%, 60%)", 
          inactive: "hsl(215, 20%, 65%)" 
        },
        factory: { 
          active: "hsl(142, 76%, 36%)", 
          busy: "hsl(35, 100%, 60%)", 
          inactive: "hsl(215, 20%, 65%)" 
        },
        depot: { 
          active: "hsl(0, 86%, 65%)", 
          busy: "hsl(35, 100%, 60%)", 
          inactive: "hsl(215, 20%, 65%)" 
        }
      };

      ctx.fillStyle = colors[node.type][node.status];
      ctx.fill();

      // Add glow effect for active nodes
      if (node.status === "active") {
        ctx.shadowColor = colors[node.type][node.status];
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Add border
      ctx.strokeStyle = "hsl(210, 40%, 98%)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Add label
      ctx.fillStyle = "hsl(210, 40%, 98%)";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(node.id, node.x, node.y + 25);
    });

  }, [nodes, edges]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if click is near any node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(clickX - node.x, 2) + Math.pow(clickY - node.y, 2));
      return distance <= 15;
    });

    setSelectedNode(clickedNode || null);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🗺️ Railway Network Map
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
            <Button variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={350}
              className="w-full h-80 bg-gradient-to-br from-muted/20 to-background border border-border rounded-lg cursor-pointer"
              onClick={handleCanvasClick}
            />
            
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs space-y-2">
              <div className="font-semibold text-foreground">Legend</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Station</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span>Factory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span>Depot</span>
              </div>
            </div>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-primary">{selectedNode.id}</h4>
                <Badge variant={selectedNode.status === "active" ? "default" : "secondary"}>
                  {selectedNode.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 capitalize">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Connections:</span>
                  <span className="ml-2">{selectedNode.connections.length}</span>
                </div>
                {selectedNode.goldProduction && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Gold Production:</span>
                    <span className="ml-2 text-warning font-semibold">₿ {selectedNode.goldProduction}/hr</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};