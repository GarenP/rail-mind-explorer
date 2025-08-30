import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { BarChart3, Home, Network, DollarSign, Factory } from 'lucide-react';

export default function OpenFrontIOHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/openfrontio" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-6 w-6" />
            OpenFrontIO Analytics
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/openfrontio/dashboard">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              OpenFrontIO Analytics
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Comprehensive data mining dashboard for real-time strategy game analysis. 
              Visualize railway networks, track economic performance, and monitor factory efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="border rounded-lg p-6 space-y-3">
              <Network className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Railway Network Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Interactive visualization of train stations, connections, and traffic flow patterns.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 space-y-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Economic Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track gold flow, trade volumes, and revenue sources across all players.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 space-y-3">
              <Factory className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Factory Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Monitor production rates, efficiency metrics, and supply chain performance.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link to="/openfrontio/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Launch Dashboard
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              View comprehensive analytics for your OpenFrontIO RTS games
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}