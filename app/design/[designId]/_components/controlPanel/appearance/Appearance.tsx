import React, { useRef, useState, memo } from 'react';
import { Input } from '@/components/ui/input';
import ScrubbyInput from '@/components/ui/scrubInput';
import ScrubInput from '@/components/ui/scrubInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

type Props = {
  type: string;
  opacity: string;
  radius: string;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const Appearance = ({
  type,
  opacity,
  isEditingRef,
  radius,
  handleInputChange,
}: Props) => {
  // const handleInput = (property: string, val: number) => {
  //   if (type !== 'itext' && property === 'width')
  //     handleInputChange('scaleX', (val / scaleX).toString());
  //   else if (type !== 'itext' && property === 'height')
  //     handleInputChange('scaleY', (val / scaleY).toString());
  //   else handleInputChange(property, val.toString());
  // };
  //console.log(type, width, height, scaleX);
  return (
    <div className=" border-b py-2 px-3">
      <div className="flex flex-col">
        <div className="flex justify-between align-middle py-1">
          <h3 className="text-xs font-semibold">Appearance</h3>
          <FontAwesomeIcon
            size="xs"
            icon={faEye}
            className="text-primary-grey-300"
          />
        </div>
        <div className="py-1 mt-2">
          <div className="flex justify-between item-center mb-2">
            <div>
              <div className="text-[10px] text-gray-600 pb-2">Opacity</div>
              <ScrubInput
                id="opacity"
                value={opacity * 100}
                suffix="%"
                min={0}
                max={100}
                onChange={(e) => {
                  handleInputChange('opacity', (parseInt(e) / 100).toString());
                }}
                onBlur={() => (isEditingRef.current = false)}
                icon="O"
              />
            </div>
            <div>
              <div className="text-[10px] text-gray-600 pb-2">
                Corner Radius
              </div>

              <ScrubInput
                id="radius"
                value={radius}
                sensitivity={0.1}
                onChange={(e) => {
                  handleInputChange('radius', e);
                }}
                onBlur={() => (isEditingRef.current = false)}
                icon="R"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Appearance);
