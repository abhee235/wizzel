import React, { useState, memo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { fontWeightOptions } from '../../constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export interface FontWeightProps {
  inputRef: any;
  handleInputChange: (key: string, value: string) => void;
  weight: string;
}

const FontWeight = ({
  inputRef,
  handleInputChange,
  weight,
}: FontWeightProps) => {
  const [fontWeight, setFontWeight] = useState(weight);
  const [previewFontWeight, setPreviewFontWeight] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Update the parent component with the selected font weight
    handleInputChange('fontWeight', fontWeight);
  }, [fontWeight]);

  useEffect(() => {
    // Apply the preview font weight temporarily
    if (previewFontWeight !== null) {
      handleInputChange('fontWeight', previewFontWeight);
    }
  }, [previewFontWeight]);

  const handleFontWeightChange = (value: string) => {
    setFontWeight(value);
    setPreviewFontWeight(null); // Reset preview after selection
  };

  const handlePreviewFontWeightChange = (value: string) => {
    setPreviewFontWeight(value);
  };

  const resetPreview = () => {
    setPreviewFontWeight(null);
    handleInputChange('fontWeight', fontWeight); // Revert to selected font weight
  };

  const fontLabel = fontWeightOptions.find(
    (x) => x.value === fontWeight
  )?.label;

  return (
    <div className="mt-2 flex">
      <div className="group flex flex-start">
        {/* Input Field */}
        <Input
          value={fontLabel}
          ref={inputRef}
          onChange={(e) =>
            handleFontWeightChange(
              fontWeightOptions.find((x) => x.label === e.target.value)
                ?.value || ''
            )
          }
          className="pl-4 group-hover:border-blue-500 text-xs mr-[2px] pr-2 py-1 w-full h-6 bg-gray-100 rounded-l-md rounded-r-none border-r-0 text-gray-800 focus:outline-none"
        />

        {/* Dropdown */}
        <Select
          onValueChange={(value) => handleFontWeightChange(value)}
          onBlur={resetPreview} // Reset preview on dropdown blur
        >
          <SelectTrigger className="pl-1 text-xs pr-2 py-1 w-6 h-6 bg-gray-100 rounded-l-none rounded-r-md hover:bg-border text-gray-800 focus:outline-none">
            <FontAwesomeIcon icon={faChevronDown} />
          </SelectTrigger>
          <SelectContent
            align="center"
            className="bg-black w-44 p-1"
            onMouseLeave={resetPreview} // Reset preview on mouse leave
          >
            {fontWeightOptions.map((item, index) => (
              <SelectItem
                key={index}
                value={item.value}
                className="text-[13px] text-white focus:bg-[#0d99ff] focus:text-white px-2 h-6"
                onMouseEnter={() => handlePreviewFontWeightChange(item.value)}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default memo(FontWeight);
