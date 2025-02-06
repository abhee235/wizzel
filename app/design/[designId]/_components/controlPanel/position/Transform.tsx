import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faGear,
  faRulerHorizontal,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import ScrubInput from '@/components/ui/scrub-input';

const Transform = ({ angle, handleInputChange }) => {
  const x = 0;
  return (
    <div className="py-1">
      <div className="text-[10px] text-gray-600 pb-1">Transform</div>
      <div className="flex justify-between mb-2">
        <div className="relative">
          <span className="absolute text-xs left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FontAwesomeIcon icon={faGear} />
          </span>
          <ScrubInput
            id="width"
            value={Math.floor(angle)}
            onChange={(e) => {
              handleInputChange('angle', e);
            }}
            onBlur={() => {}}
            icon="A"
          />
        </div>
        <div className="flex flex-start items-center gap-[1px]">
          <Button
            variant="secondary"
            className="w-8 h-6 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faArrowDown} />
          </Button>
          <Button
            variant="secondary"
            className="w-8 h-6 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </Button>
          <Button
            variant="secondary"
            className="w-8 h-6 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faRulerHorizontal} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(Transform);
