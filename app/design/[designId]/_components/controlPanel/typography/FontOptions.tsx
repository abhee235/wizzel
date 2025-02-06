'use client';

import React, { useState, useEffect, memo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { fontFamilyOptions } from '../../constants';
import {ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface FontOptionsProps {
  inputRef: any;
  handleInputChange: (key: string, value: string) => void;
  fontFamily: string;
}

const FontOptions = ({
  inputRef,
  handleInputChange,
  fontFamily,
}: FontOptionsProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFontFamily, setSelectedFontFamily] = useState(fontFamily);
  const [previewFontFamily, setPreviewFontFamily] = useState<string | null>(
    null
  );

  useEffect(() => {
    handleInputChange('fontFamily', selectedFontFamily);
  }, [selectedFontFamily]);

  useEffect(() => {
    if (previewFontFamily !== null) {
      handleInputChange('fontFamily', previewFontFamily);
    }
  }, [previewFontFamily]);

  const handleFontFamilySelect = (value: string) => {
    setSelectedFontFamily(value);
    setPreviewFontFamily(null); // Reset preview after selection
    setOpen(false);
  };

  const handlePreviewFontFamily = (value: string) => {
    setPreviewFontFamily(value);
  };

  const resetPreview = () => {
    setPreviewFontFamily(null);
    handleInputChange('fontFamily', selectedFontFamily); // Revert to selected font family
  };

  const displayFontLabel =
    fontFamilyOptions.find((font) => font.value === selectedFontFamily)
      ?.label || 'Inter';

      return (
        <div className="mt-2 py-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full h-6 text-[13px] justify-between font-normal"
              >
                {displayFontLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <ScrollArea className="w-56 h-full whitespace-nowrap rounded-md border">
                <Command>
                  <CommandInput placeholder="Search fonts" />
                  <CommandList onMouseLeave={resetPreview}>
                    <CommandEmpty>No font found.</CommandEmpty>
                    <CommandGroup>
                      {fontFamilyOptions.map((font) => (
                        <CommandItem
                          key={font.value}
                          className="text-[16px] h-8"
                          value={font.value}
                          onSelect={() => handleFontFamilySelect(font.value)}
                          onMouseEnter={() => handlePreviewFontFamily(font.value)}
                          style={{ fontFamily: font.value }}  // ✅ Corrected
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedFontFamily === font.value
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <span style={{ fontFamily: font.value }}>  {/* ✅ Corrected */}
                            {font.label}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      );      
};

export default memo(FontOptions);

