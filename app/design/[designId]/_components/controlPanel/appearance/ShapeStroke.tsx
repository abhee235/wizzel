import React, { memo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import ScrubInput from '@/components/ui/scrubInput';
import { Select, SelectItem, SelectTrigger } from '@/components/ui/select';
import { SelectContent } from '@radix-ui/react-select';

const ShapeStroke = ({
  inputRef,
  strokeColor,
  strokeWidth,
  StrokePosition,
  placeholder,
  attributeType,
  handleInputChange,
  isEditingRef,
}) => {
  return (
    <div className=" border-b py-3 px-3">
      <div className="flex flex-col">
        <div className="flex justify-between align-middle py-1">
          <h3 className="text-xs font-semibold">Strokes</h3>
          <FontAwesomeIcon
            size="xs"
            icon={faPlus}
            className="text-primary-grey-300"
          />
        </div>
        <div className="py-1 mt-2">
          <div className="flex justify-between mb-2 gap-2">
            <div className="flex flex-start">
              <div className="relative">
                <span className="absolute text-xs left-1 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Input
                    type="color"
                    value={strokeColor}
                    ref={inputRef}
                    onChange={(e) =>
                      handleInputChange('stroke', e.target.value)
                    }
                    className="text-xs w-5 h-6 bg-gray-100  focus:outline-none p-0"
                  />
                </span>
                <Input
                  ref={inputRef}
                  value={strokeColor}
                  onChange={(e) => handleInputChange('stroke', e.target.value)}
                  className="pl-7 text-xs mr-[2px] pr-2 py-1 w-24 h-6 bg-gray-100 rounded-l-md rounded-r-none border-r-0 text-gray-800 focus:outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute text-xs right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
                <Input
                  type=""
                  defaultValue={100}
                  className="pl-1 text-xs pr-2 py-1 w-14 h-6 bg-gray-100 rounded-l-none rounded-r-md border-l-0 text-gray-800 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-end">
              <Button
                variant={'ghost'}
                className="w-6 h-6 text-primary-grey-300 px-2"
              >
                <FontAwesomeIcon icon={faEye} size="sm" />
              </Button>
              <Button
                variant={'ghost'}
                className="w-6 h-6 text-primary-grey-300 px-2"
              >
                <FontAwesomeIcon icon={faMinus} size="sm" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between item-center mb-2">
            <div>
              <div className="text-[10px] text-gray-600 pb-2">Position</div>
              <Select>
                <SelectTrigger className="pl-1 text-xs pr-2 py-1 w-24 h-6 bg-gray-100 rounded hover:bg-border text-gray-800 focus:outline-none">
                  <FontAwesomeIcon icon={faChevronDown} />
                </SelectTrigger>
                <SelectContent className="bg-black">
                  {['Outside', 'Inside'].map((item, index) => (
                    <SelectItem
                      key={index}
                      value={item} // Ensure value is consistent
                      className="text-[13px] text-white active:bg-blue-600"
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-[10px] text-gray-600 pb-2">Width</div>

              <ScrubInput
                id="strokeWidth"
                value={strokeWidth}
                sensitivity={0.1}
                onChange={(e) => {
                  handleInputChange('strokeWidth', e);
                }}
                onBlur={() => (isEditingRef.current = false)}
                icon="S"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default memo(ShapeStroke);
