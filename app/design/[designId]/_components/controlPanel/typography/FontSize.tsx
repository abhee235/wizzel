import React, { useState, useRef, memo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { fontSizeOptions } from '../../constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Input } from '@/components/ui/input';

export interface FontSizeProps {
  inputRef: any;
  handleInputChange: any;
  textSize: number;
}

const FontSize = ({ inputRef, handleInputChange, textSize }: FontSizeProps) => {
  const [fontSize, setFontSize] = useState(textSize);
  const [previewFontSize, setPreviewFontSize] = useState<number | null>(null);

  useEffect(() => {
    // Update the parent with the selected font size
    handleInputChange('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    // Handle preview font size changes
    if (previewFontSize !== null) {
      handleInputChange('fontSize', previewFontSize);
    }
  }, [previewFontSize]);

  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
    setPreviewFontSize(null); // Reset preview on selection
  };

  const handlePreviewFontSizeChange = (value: number) => {
    setPreviewFontSize(value);
  };

  const resetPreview = () => {
    setPreviewFontSize(null);
    handleInputChange('fontSize', fontSize); // Revert to selected font size
  };

  return (
    <div className="mt-2 flex">
      <div className="group flex flex-start">
        {/* Input Field */}
        <Input
          value={fontSize}
          ref={inputRef}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          className="pl-4 group-hover:border-blue-500 text-xs mr-[2px] pr-2 py-1 w-full h-6 bg-gray-100 rounded-l-md rounded-r-none border-r-0 text-gray-800 focus:outline-none"
        />

        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="pl-1 text-xs pr-2 py-1 w-6 h-6 bg-gray-100 rounded-l-none rounded-r-md hover:bg-border text-gray-800 focus:outline-none">
            <FontAwesomeIcon icon={faChevronDown} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-black w-16"
            onMouseLeave={resetPreview} // Reset preview on mouse leave
          >
            {fontSizeOptions.map((item, index) => (
              <DropdownMenuCheckboxItem
                key={index}
                className="text-[13px] text-white focus:bg-[#0d99ff] focus:text-white px-2 h-6"
                checked={fontSize === Number(item.value)}
                onCheckedChange={() => handleFontSizeChange(Number(item.value))}
                onMouseOver={() =>
                  handlePreviewFontSizeChange(Number(item.value))
                }
              >
                <span className="ml-8">{item.label}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default memo(FontSize);
