import React, { memo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ScrubInput from '@/components/ui/scrub-input';

const Position = ({ left, top, handleInputChange }) => (
  <div className="py-1">
    <div className="text-[10px] text-gray-600 pb-1">Positions</div>
    <div className="flex justify-between mb-2">
      <div className="relative">
        <span className="absolute text-xs left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
          X
        </span>
        <ScrubInput
          id="x"
          value={left}
          onChange={(e) => {
            handleInputChange('left', e);
          }}
          min={-Infinity}
          max={Infinity}
          onBlur={() => {}}
          icon="X"
        />
      </div>
      <div className="relative">
        <span className="absolute text-xs left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
          Y
        </span>
        <ScrubInput
          id="y"
          value={top}
          onChange={(e) => {
            handleInputChange('top', e);
          }}
          min={-Infinity}
          max={Infinity}
          //onBlur={() => (isEditingRef.current = false)}
          onBlur={() => {}}
          icon="Y"
        />
      </div>
    </div>
  </div>
);

export default memo(Position);
