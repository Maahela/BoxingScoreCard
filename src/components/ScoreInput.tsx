import React from 'react';
import type { CriteriaItem } from '@/types';

interface ScoreInputProps {
  criteria: CriteriaItem;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ScoreInput({ criteria, value, onChange, disabled }: ScoreInputProps) {
  const handleIncrement = () => {
    if (value < criteria.maxPoints) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value) || 0;
    if (newValue >= 0 && newValue <= criteria.maxPoints) {
      onChange(newValue);
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <label className="text-lg font-semibold text-gray-800">
          {criteria.label}
        </label>
        <span className="text-sm text-gray-500">Max: {criteria.maxPoints}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value === 0}
          className="score-button bg-red-500 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          −
        </button>
        
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max={criteria.maxPoints}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="score-input flex-1"
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value === criteria.maxPoints}
          className="score-button bg-green-500 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          +
        </button>
      </div>
    </div>
  );
}
