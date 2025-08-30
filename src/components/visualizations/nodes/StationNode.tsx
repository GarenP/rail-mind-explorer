import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { StationData } from '@/types/GameData';
import { Building, Ship, Factory, Coins, Activity } from 'lucide-react';

interface StationNodeProps {
  data: {
    station: StationData;
    label: string;
    owner: string;
    goldGenerated: number;
    trafficVolume: number;
  };
}

const StationNode = memo(({ data }: StationNodeProps) => {
  const { station } = data;
  
  const getStationIcon = () => {
    switch (station.type) {
      case 'City':
        return <Building className="h-4 w-4" />;
      case 'Port':
        return <Ship className="h-4 w-4" />;
      case 'Factory':
        return <Factory className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getOwnerColor = () => {
    switch (station.owner) {
      case 'player1':
        return 'hsl(var(--primary))';
      case 'player2':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg p-3 min-w-[180px] shadow-lg"
      style={{ borderLeftColor: getOwnerColor(), borderLeftWidth: '3px' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStationIcon()}
            <span className="font-medium text-sm">{station.type}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            L{station.level}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-yellow-500" />
              <span className="text-muted-foreground">Gold:</span>
            </div>
            <span className="font-medium">{station.goldGenerated}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-blue-500" />
              <span className="text-muted-foreground">Traffic:</span>
            </div>
            <span className="font-medium">{station.trafficVolume}</span>
          </div>
        </div>

        {station.clusterId && (
          <Badge variant="secondary" className="text-xs w-full justify-center">
            Cluster: {station.clusterId}
          </Badge>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
});

StationNode.displayName = 'StationNode';

export { StationNode };