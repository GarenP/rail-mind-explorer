import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RailNetworkData, StationData } from '@/types/GameData';
import { StationNode } from './nodes/StationNode';
import { ClusterStats } from './ClusterStats';

interface RailNetworkVisualizationProps {
  railNetwork: RailNetworkData;
}

const nodeTypes = {
  station: StationNode,
};

export function RailNetworkVisualization({ railNetwork }: RailNetworkVisualizationProps) {
  const { stations, railroads, clusters } = railNetwork;

  // Convert station data to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return stations.map((station) => ({
      id: station.id,
      type: 'station',
      position: { x: station.position.x * 2, y: station.position.y * 2 },
      data: {
        station,
        label: `${station.type} (L${station.level})`,
        owner: station.owner,
        goldGenerated: station.goldGenerated,
        trafficVolume: station.trafficVolume,
      },
    }));
  }, [stations]);

  // Convert railroad data to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return railroads.map((railroad) => ({
      id: railroad.id,
      source: railroad.from,
      target: railroad.to,
      type: 'smoothstep',
      animated: railroad.usage > 15,
      style: {
        strokeWidth: Math.max(2, railroad.usage / 5),
        stroke: railroad.efficiency > 0.8 ? '#22c55e' : railroad.efficiency > 0.6 ? '#eab308' : '#ef4444',
      },
      label: `${railroad.length}km (${Math.round(railroad.efficiency * 100)}%)`,
    }));
  }, [railroads]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeClassName = (node: Node) => {
    const station = node.data?.station as StationData;
    return `station-${station?.type?.toLowerCase() || 'default'}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Stations:</span>
              <Badge variant="outline">{stations.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Railroads:</span>
              <Badge variant="outline">{railroads.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Clusters:</span>
              <Badge variant="outline">{clusters.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Station Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {['City', 'Port', 'Factory'].map((type) => {
              const count = stations.filter(s => s.type === type).length;
              return (
                <div key={type} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{type}s:</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Efficiency:</span>
              <Badge variant="outline">
                {Math.round((railroads.reduce((sum, r) => sum + r.efficiency, 0) / railroads.length) * 100)}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Traffic:</span>
              <Badge variant="outline">
                {stations.reduce((sum, s) => sum + s.trafficVolume, 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClusterStats clusters={clusters} stations={stations} />

      <Card>
        <CardHeader>
          <CardTitle>Railway Network Topology</CardTitle>
          <CardDescription>
            Interactive visualization of train stations, connections, and traffic flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full border rounded-lg">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="top-right"
              style={{ backgroundColor: 'hsl(var(--background))' }}
            >
              <Background />
              <Controls />
              <MiniMap 
                zoomable 
                pannable 
                nodeClassName={nodeClassName}
                style={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}