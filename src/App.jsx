import React from 'react';
import { SinglePlayerMenu } from './components/SinglePlayerMenu.jsx';
import { TrainEconomicsDashboard } from './components/TrainEconomicsDashboard.jsx';
import './index.css';
import './App.css';

function App() {
  return (
    <div className="app">
      <SinglePlayerMenu />
      <TrainEconomicsDashboard />
    </div>
  );
}

export default App;