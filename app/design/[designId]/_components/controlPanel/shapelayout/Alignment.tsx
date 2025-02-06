import React, { useState } from 'react';
import ScrubInput from '@/components/ui/scrub-input';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowDownZA,
  faArrowRight,
  faArrowTurnDown,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';

type Props = {
  direction: string;
  alignment: string;
  type: string;
  spacingType: string;
  horizontalGap: number;
  verticalGap: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  strategy: any;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const AutoLayoutAlignments = ({
  direction,
  alignment,
  spacingType,
  horizontalGap,
  verticalGap,
  type,
  width,
  height,
  scaleX,
  scaleY,
  isEditingRef,
  strategy,
  handleInputChange,
}: Props) => {
  const [spacingTypes, setSpacingTypes] = useState(spacingType);

  //console.log('Strategy of layout', strategy);
  const handleSpacingTypeChange = (value: string) => {
    if (value === 'auto') {
      setSpacingTypes('auto');
      handleInputChange('spacingType', 'auto');
    } else {
      setSpacingTypes('manual');
      handleInputChange('spacingType', 'manual');
    }
  };
  return (
    <div className="py-1 mt-1">
      <div className="flex flex-col">
        <div className="flex justify-between item-center mb-2">
          <div>
            <div className="text-[10px] text-gray-600 pb-2">
              Direction & Gap
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-start items-center gap-[1px] p-[1px] bg-muted rounded">
                <Button
                  variant={`${direction === 'column' ? 'outline' : 'ghost'}`}
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('direction', 'column');
                  }}
                >
                  <FontAwesomeIcon
                    icon={faArrowDown}
                    className={`${strategy.layoutDirection === 'column' ? 'text-foreground' : 'text-gray-400'}`}
                  />
                </Button>
                <Button
                  variant={`${strategy.layoutDirection === 'row' ? 'outline' : 'ghost'}`}
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('direction', 'row');
                  }}
                >
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className={`${direction === 'row' ? 'text-foreground' : 'text-gray-400'}`}
                  />
                </Button>
                <Button
                  variant={`${strategy.layoutDirection === 'column' ? 'outline' : 'ghost'}`}
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('direction', 'wrap');
                  }}
                >
                  <FontAwesomeIcon
                    icon={faArrowTurnDown}
                    className={`${direction === 'wrap' ? 'text-foreground' : 'text-gray-400'}`}
                  />
                </Button>
              </div>

              {(strategy.layoutDirection === 'row' ||
                strategy.layoutDirection === 'column') && (
                <div className="group flex flex-start">
                  {/* Input Field */}
                  {spacingTypes !== 'auto' ? (
                    <ScrubInput
                      id="width"
                      value={Math.floor(
                        strategy.layoutDirection === 'row'
                          ? horizontalGap
                          : verticalGap
                      )}
                      onChange={(e) => {
                        handleInputChange(
                          strategy.layoutDirection === 'row'
                            ? 'horizontalGap'
                            : 'verticalGap',
                          e
                        );
                      }}
                      onBlur={() => (isEditingRef.current = false)}
                      icon="]|["
                      className={
                        'text-xs w-[76px] h-6 bg-gray-100 rounded-l-md rounded-r-none border-r-0 text-gray-800 focus:outline-none'
                      }
                    />
                  ) : (
                    <Label className="pl-1 group-hover:border-blue-500 text-xs mr-[2px] pr-2 py-1 w-full h-6 bg-gray-100 rounded-l-md rounded-r-none border-r-0 text-gray-800 focus:outline-none">
                      <span className="text-xs text-gray-400 mr-2">]|[</span>
                      Auto
                    </Label>
                  )}

                  {/* Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="pl-1 text-xs pr-2 py-1 w-6 h-6 mt-[1px] bg-gray-100 rounded-l-none rounded-r-md hover:bg-border text-gray-800 focus:outline-none">
                      <FontAwesomeIcon icon={faChevronDown} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-black w-24 z-50 p-1 rounded-md"
                    >
                      <DropdownMenuCheckboxItem
                        className="text-[13px] text-white focus:bg-[#0d99ff] focus:rounded-md focus:text-white px-2 h-6"
                        checked={spacingTypes === 'Auto'}
                        onCheckedChange={(value) =>
                          handleSpacingTypeChange('auto')
                        }
                      >
                        <span className="ml-6">Auto</span>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        className="text-[13px] text-white focus:bg-[#0d99ff] focus:rounded-md focus:text-white px-2 h-6"
                        checked={spacingTypes !== 'Auto'}
                        onCheckedChange={(value) =>
                          handleSpacingTypeChange('manual')
                        }
                      >
                        <span className="ml-6">
                          {direction === 'row' ? horizontalGap : verticalGap}
                        </span>
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-gray-600 pb-2">Alignment</div>

            <div className="flex flex-col bg-secondary rounded">
              <div className="flex flex-start items-center">
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'top-left');
                  }}
                >
                  <div className="flex gap-0.5 ">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'top-center');
                  }}
                >
                  <div className="flex gap-0.5 ">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'top-right');
                  }}
                >
                  <div className="flex gap-0.5 ">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
              </div>
              <div className="flex flex-start items-center">
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'middle-left');
                  }}
                >
                  <div className="flex gap-0.5 items-center">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'middle-center');
                  }}
                >
                  <div className="flex gap-0.5 items-center">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'middle-right');
                  }}
                >
                  <div className="flex gap-0.5 items-center">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
              </div>
              <div className="flex flex-start items-center">
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'bottom-left');
                  }}
                >
                  <div className="flex gap-0.5 items-end ">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'bottom-center');
                  }}
                >
                  <div className="flex gap-0.5 items-end">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="w-8 h-6 text-primary-grey-300 px-2"
                  onClick={() => {
                    handleInputChange('alignment', 'bottom-right');
                  }}
                >
                  <div className="flex gap-0.5 items-end">
                    <i className="block w-0.5 h-2 bg-[#999]"></i>
                    <i className="block w-0.5 h-3 bg-[#999]"></i>
                    <i className="block w-0.5 h-1.5 bg-[#999]"></i>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {direction === 'wrap' && (
        <div className="py-1">
          <div className="text-[10px] text-gray-600 pb-1">Gap</div>
          <div className="flex justify-between mb-2">
            <div className="relative">
              <span className="absolute text-xs left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                X
              </span>
              <ScrubInput
                id="x"
                value={Math.round(horizontalGap)}
                onChange={(e) => {
                  handleInputChange('horizontalGap', e);
                }}
                min={-Infinity}
                max={Infinity}
                onBlur={() => {}}
                icon="X"
              />
            </div>
            <div className="relative">
              <span className="absolute text-xs left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                Y
              </span>
              <ScrubInput
                id="y"
                value={Math.round(verticalGap)}
                onChange={(e) => {
                  handleInputChange('verticalGap', e);
                }}
                min={-Infinity}
                max={Infinity}
                //onBlur={() => (isEditingRef.current = false)}
                onBlur={() => {}}
                icon="Y"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoLayoutAlignments;