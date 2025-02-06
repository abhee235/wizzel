import React, {memo} from 'react';
import ScrubInput from '@/components/ui/scrub-input';

type Props = {
  type: string;
  paddingLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingHorizontal: number;
  paddingVertical: number;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const LayoutPaddings = ({
  type,
  paddingLeft,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingHorizontal,
  paddingVertical,
  isEditingRef,
  handleInputChange,
}: Props) => {
  return (
    <div className="py-1">
      <div className="text-[10px] text-gray-600 pb-1">Padding</div>
      <div className="flex justify-between mb-2">
        <div className="relative">
          <span className="absolute text-xs left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            X
          </span>
          <ScrubInput
            id="paddingHorizontal"
            value={paddingHorizontal}
            onChange={(e) => {
              handleInputChange('paddingHorizontal', e);
            }}
            min={0}
            max={Infinity}
            onBlur={() => {}}
            icon="|o|"
          />
        </div>
        <div className="relative">
          <span className="absolute text-xs left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            Y
          </span>
          <ScrubInput
            id="paddingVertical"
            value={paddingVertical}
            onChange={(e) => {
              handleInputChange('paddingVertical', e);
            }}
            min={0}
            max={Infinity}
            //onBlur={() => (isEditingRef.current = false)}
            onBlur={() => {}}
            icon="U+136C"
          />
        </div>
      </div>
    </div>
  );
};

export default memo(LayoutPaddings);
