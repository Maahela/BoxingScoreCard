import React from 'react';
import type { CriteriaItem } from '@/types';

interface ScoreInputProps {
  criteria: CriteriaItem;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ScoreInput({
  criteria,
  value,
  onChange,
  disabled,
}: ScoreInputProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value) || 0;
    if (newValue >= 0 && newValue <= criteria.maxPoints) {
      onChange(newValue);
    }
  };

  // Calculate percentage for visual feedback
  const percentage = (value / criteria.maxPoints) * 100;

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <label className="text-lg font-semibold text-gray-800">
          {criteria.label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max={criteria.maxPoints}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-16 px-2 py-1 text-center text-xl font-bold border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">/ {criteria.maxPoints}</span>
        </div>
      </div>

      <div className="relative">
        {/* Slider */}
        <input
          type="range"
          min="0"
          max={criteria.maxPoints}
          step="1"
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
          }}
        />

        {/* Score markers */}
        <div className="flex justify-between mt-1 px-1">
          <span className="text-xs text-gray-400">0</span>
          <span className="text-xs text-gray-400">
            {Math.floor(criteria.maxPoints / 2)}
          </span>
          <span className="text-xs text-gray-400">{criteria.maxPoints}</span>
        </div>
      </div>
    </div>
  );
}
