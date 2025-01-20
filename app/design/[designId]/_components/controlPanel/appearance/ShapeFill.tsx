import React, { memo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { Button } from '@/components/ui/button';
import { faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import ColorPicker, { useColorPicker } from 'react-best-gradient-color-picker';

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
};

const ShapeFill = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
}: Props) => {
  const [color, setColor] = React.useState(attribute);
  const { setSolid, setGradient } = useColorPicker(color, setColor);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    handleInputChange(attributeType, color);
  }, [color]);

  return (
    <div className="py-1 mt-2">
      {open && (
        <div className="fixed z-10 top-9 right-64 bg-neutral-50 p-2 pb-4 rounded-lg">
          <div className="flex justify-end mb-2 gap-2 border-b">
            <Button
              variant={'ghost'}
              className="w-6 h-6 text-primary-grey-300 px-2"
              onClick={() => setOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </div>
          <ColorPicker value={attribute} width={280} onChange={setColor} />
        </div>
      )}
      <div className="flex justify-between mb-2 gap-2">
        <div className="flex flex-start">
          <div className="relative">
            <span className="absolute text-xs left-1 top-1/2 transform -translate-y-1/2 text-gray-500">
              <div
                style={{
                  backgroundColor: attribute,
                }}
                ref={inputRef}
                onClick={() => setOpen(true)}
                className=" w-4 h-4 focus:outline-none p-0"
              ></div>
            </span>
            <Input
              value={attribute}
              ref={inputRef}
              onFocus={() => setOpen(true)}
              //onBlur={() => setOpen(false)}
              onChange={(e) => handleInputChange(attributeType, e.target.value)}
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
    </div>
  );
};

export default memo(ShapeFill);

