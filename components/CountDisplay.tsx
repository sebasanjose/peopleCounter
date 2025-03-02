import React from 'react';
import { CountDisplayProps } from '../types';

const CountDisplay: React.FC<CountDisplayProps> = ({ count }) => {
  return (
    <div className="bg-card rounded-lg shadow-lg p-6 text-center">
      <h2 className="text-2xl font-semibold mb-2 text-text">Current Count</h2>
      <div className="text-6xl font-bold text-primary">{count}</div>
      <p className="mt-2 text-gray-500">People detected</p>
    </div>
  );
};

export default CountDisplay; 