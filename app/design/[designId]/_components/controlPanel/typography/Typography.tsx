import ScrubInput from '@/components/ui/scrub-input';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAlignCenter,
  faAlignLeft,
  faAlignRight,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import React, { memo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  fontFamilyOptions,
  fontSizeOptions,
  fontWeightOptions,
} from '../constants';
import { cn } from '@/lib/utils';
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
import FontOptions from './FontOptions';
import FontSize from './FontSize';
import FontWeight from './FontWeight';

export interface TypographyProps {
  type: string;
  inputRef: any;
  handleInputChange: any;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number;
  textAlignment: string;
}

const Typography = ({
  type,
  inputRef,
  handleInputChange,
  fontSize,
  fontWeight,
  fontFamily,
  lineHeight,
  letterSpacing,
  textAlignment,
}: TypographyProps) => {
  return (
    <div className="border-b py-3 px-3">
      <div className="flex flex-col">
        <div className="flex justify-between items-center py-1">
          <h3 className="text-xs font-semibold">Typography</h3>
          <FontAwesomeIcon size="xs" icon={faPlus} className="text-primary-grey-300" />
        </div>
      </div>
  
      <FontOptions inputRef={inputRef} handleInputChange={handleInputChange} fontFamily={fontFamily} />
  
      <div className="flex gap-4">
        <FontWeight inputRef={inputRef} handleInputChange={handleInputChange} weight={fontWeight} />
        <FontSize inputRef={inputRef} handleInputChange={handleInputChange} textSize={fontSize} />
      </div>
  
      <div className="py-1 mt-2">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-[10px] text-gray-600 pb-2">Line Height</div>
            <ScrubInput
              id="lineHeight"
              value={Math.round(lineHeight * 100)}
              suffix="%"
              onChange={(e) => handleInputChange('lineHeight', e / 100)}
              min={0}
              max={Infinity}
              onBlur={() => {}}
              icon="="
            />
          </div>
          <div>
            <div className="text-[10px] text-gray-600 pb-2">Letter Spacing</div>
            <ScrubInput
              id="letterSpacing"
              value={letterSpacing}
              onChange={(e) => handleInputChange('letterSpacing', e)}
              suffix="%"
              min={0}
              max={Infinity}
              sensitivity={0.4}
              onBlur={() => {}}
              icon="::"
            />
          </div>
        </div>
      </div>
  
      <div className="mt-2">
        <div className="text-[10px] text-gray-600 pb-1">Alignments</div>
        <div className="flex justify-between mb-2">
          <div className="flex flex-start items-center gap-[1px] p-[2px] bg-muted rounded">
            <Button
              variant={textAlignment === 'left' ? 'outline' : 'ghost'}
              className="w-8 h-7 text-primary-grey-300 px-2 hover:bg-white"
              onClick={() => handleInputChange('textAlignment', 'left')}
            >
              <FontAwesomeIcon
                icon={faAlignLeft}
                className={textAlignment === 'left' ? 'text-foreground' : 'text-gray-400'}
              />
            </Button>
            <Button
              variant={textAlignment === 'center' ? 'outline' : 'ghost'}
              className="w-8 h-7 text-primary-grey-300 px-2 hover:bg-white"
              onClick={() => handleInputChange('textAlignment', 'center')}
            >
              <FontAwesomeIcon
                icon={faAlignCenter}
                className={textAlignment === 'center' ? 'text-foreground' : 'text-gray-400'}
              />
            </Button>
            <Button
              variant={textAlignment === 'right' ? 'outline' : 'ghost'}
              className="w-8 h-7 text-primary-grey-300 px-2 hover:bg-white"
              onClick={() => handleInputChange('textAlignment', 'right')}
            >
              <FontAwesomeIcon
                icon={faAlignRight}
                className={textAlignment === 'right' ? 'text-foreground' : 'text-gray-400'}
              />
            </Button>
          </div>
  
          <div className="flex flex-start items-center gap-[1px]">
            <Button variant="secondary" className="w-8 h-8 text-primary-grey-300 px-2">
              <FontAwesomeIcon icon={faAlignLeft} />
            </Button>
            <Button variant="secondary" className="w-8 h-8 text-primary-grey-300 px-2">
              <FontAwesomeIcon icon={faAlignCenter} />
            </Button>
            <Button variant="secondary" className="w-8 h-8 text-primary-grey-300 px-2">
              <FontAwesomeIcon icon={faAlignRight} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default memo(Typography);
