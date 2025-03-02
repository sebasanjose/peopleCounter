import React from 'react';
import { CountDisplayProps } from '../types';

const CountDisplay: React.FC<CountDisplayProps> = ({ count, totalCount }) => {
  return (
    <div className="bg-card rounded-lg shadow-lg p-6 text-center">
      <h2 className="text-2xl font-semibold mb-2 text-text">Count Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium text-text">Current Count</h3>
          <div className="text-5xl font-bold text-primary">{count}</div>
          <p className="mt-1 text-sm text-gray-500">People in frame</p>
        </div>
        <div>
          <h3 className="text-lg font-medium text-text">Total Count</h3>
          <div className="text-5xl font-bold text-secondary">{totalCount}</div>
          <p className="mt-1 text-sm text-gray-500">People detected overall</p>
        </div>
      </div>
    </div>
  );
};

export default CountDisplay; 