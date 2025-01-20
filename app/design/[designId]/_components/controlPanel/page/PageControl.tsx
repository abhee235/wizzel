import React, { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { Button } from '@/components/ui/button';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
};

const PageControl = ({
  inputRef,
  attribute,
  attributeType,
  handleInputChange,
}: Props) => {
  return (
    <div className=" border-b py-3 px-3">
      <div className="flex flex-col">
        <div className="flex justify-between align-middle py-1">
          <h3 className="text-xs font-semibold">Page</h3>
        </div>

        <div className="py-1 mt-2">
          <div className="flex justify-between mb-2 gap-2">
            <div className="flex flex-start">
              <div className="relative">
                <span className="absolute text-xs left-1 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Input
                    type="color"
                    value={attribute}
                    ref={inputRef}
                    onChange={(e) =>
                      handleInputChange(attributeType, e.target.value)
                    }
                    className="text-xs w-5 h-6 bg-gray-100  focus:outline-none p-0"
                  />
                </span>
                <Input
                  value={attribute}
                  ref={inputRef}
                  onChange={(e) =>
                    handleInputChange(attributeType, e.target.value)
                  }
                  className="pl-7 text-xs mr-[2px] pr-2 py-1 w-28 h-6 bg-gray-100 rounded-l-md rounded-r-none border-r-0 text-gray-800 focus:outline-none"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PageControl);
