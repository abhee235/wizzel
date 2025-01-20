import React, { memo } from 'react';
import { Input } from '@/components/ui/input';
import ScrubInput from '@/components/ui/scrubInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsToCircle } from '@fortawesome/free-solid-svg-icons';

const dimensionsOptions = [
  { label: 'W', property: 'width' },
  { label: 'H', property: 'height' },
];

type Props = {
  type: string;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const LayoutControls = ({
  type,
  width,
  height,
  scaleX,
  scaleY,
  isEditingRef,
  handleInputChange,
}: Props) => {
  return (
    <div className=" border-b py-2 px-3">
      <div className="flex flex-col">
        <div className="flex justify-between align-middle py-1">
          <h3 className="text-xs font-semibold">Layout</h3>
          <FontAwesomeIcon
            size="xs"
            icon={faArrowsToCircle}
            className="text-primary-grey-300"
          />
        </div>

        <div className="py-1 mt-2">
          <div className="flex justify-between item-center mb-2">
            <div>
              <div className="text-[10px] text-gray-600 pb-2">Width</div>
              <ScrubInput
                id="width"
                value={Math.floor(width * scaleY)}
                onChange={(e) => {
                  handleInputChange('width', e);
                }}
                onBlur={() => (isEditingRef.current = false)}
                icon="W"
              />
            </div>
            <div>
              <div className="text-[10px] text-gray-600 pb-2">Height</div>

              <ScrubInput
                id="height"
                value={Math.floor(height * scaleY)}
                onChange={(e) => {
                  handleInputChange('height', e);
                }}
                onBlur={() => (isEditingRef.current = false)}
                icon="H"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(LayoutControls);
