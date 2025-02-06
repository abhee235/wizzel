
'use client';

import Image from 'next/image';

import { ShapesMenuProps } from '../types/type';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
} from '../../../../../components/ui/dropdown-menu';
import { Button } from '../../../../../components/ui/button';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
}: ShapesMenuProps) => {
  const isDropdownElem = item.value.some(
    (elem) => elem?.value === activeElement.value
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-ring border-none">
          {/* <Button variant={"ghost"} className="w-10 h-10 rounded-lg flex items-center justify-center px-2 py-2 hover:bg-gray-200" onClick={() => handleActiveElement(item)}>
            <Image
              src={isDropdownElem ? activeElement.icon : item.icon}
              alt={item.name}
              width={100}
              height={100}
              style={{color: "white"}}
              className={isDropdownElem ? "" : ""}
            />
          </Button> */}
          <span className="text-xs h-10 w-4 font-semibold hover:bg-gray-200 rounded text-center content-center">
            <FontAwesomeIcon icon={faChevronDown} size="xs" />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="py-3 px-2 mb-2 w-60 bg-black text-white">
          {item.value.map((elem, index) => (
            <DropdownMenuCheckboxItem
              key={index}
              checked={activeElement.value === elem?.value}
              onCheckedChange={() => {
                handleActiveElement(elem);
              }}
              className="text-white focus:text-white focus:bg-[#0d99ff] py-2 text-sm"
            >
              <div className="group ml-1 flex items-center gap-2">
                <Image
                  src={elem?.icon as string}
                  alt={elem?.name as string}
                  width={16}
                  height={16}
                  className={`mr-2 invert ${activeElement.value === elem?.value ? '' : ''}`}
                />
                {elem?.name}
              </div>
              <DropdownMenuShortcut>W</DropdownMenuShortcut>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        className="hidden"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </>
  );
};

export default ShapesMenu;
