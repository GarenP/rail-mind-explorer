import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClusterData, StationData } from '@/types/GameData';
import { Network, TrendingUp, Activity } from 'lucide-react';

interface ClusterStatsProps {
  clusters: ClusterData[];
  stations: StationData[];
}

export function ClusterStats({ clusters, stations }: ClusterStatsProps) {
  const getClusterStations = (clusterId: string) => {
    return stations.filter(station => station.clusterId === clusterId);
  };

  const getTotalTrafficVolume = () => {
    return clusters.reduce((sum, cluster) => sum + cluster.tradingVolume, 0);
  };

  const getAverageEfficiency = () => {
    if (clusters.length === 0) return 0;
    return clusters.reduce((sum, cluster) => sum + cluster.efficiency, 0) / clusters.length;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clusters</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clusters.length}</div>
            <p className="text-xs text-muted-foreground">
              Connected station groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalTrafficVolume().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all clusters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getAverageEfficiency() * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Network performance
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cluster Details</CardTitle>
          <CardDescription>
            Individual cluster performance and composition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clusters.map((cluster) => {
              const clusterStations = getClusterStations(cluster.id);
              const stationTypes = clusterStations.reduce((acc, station) => {
                acc[station.type] = (acc[station.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              return (
                <div key={cluster.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{cluster.id}</h4>
                      <Badge variant="outline">{cluster.size} stations</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Volume: {cluster.tradingVolume.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Efficiency</span>
                        <span>{Math.round(cluster.efficiency * 100)}%</span>
                      </div>
                      <Progress value={cluster.efficiency * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(stationTypes).map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {count} {type}{count > 1 ? 's' : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}