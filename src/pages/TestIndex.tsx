import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TestIndex = () => {
  console.log('🧪 Rendering TestIndex component');
  
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-4xl font-bold text-primary mb-8">OpenFrontIO Analytics - Test Mode</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>🚂 System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">Dashboard is loading successfully!</p>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary">✅ React components working</p>
              <p className="text-sm text-primary">✅ CSS styles loading</p>
              <p className="text-sm text-primary">✅ Design system active</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>🎨 Theme Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-primary text-primary-foreground rounded">Primary Color</div>
              <div className="p-2 bg-secondary text-secondary-foreground rounded">Secondary Color</div>
              <div className="p-2 bg-accent text-accent-foreground rounded">Accent Color</div>
              <div className="p-2 bg-muted text-muted-foreground rounded">Muted Color</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestIndex;