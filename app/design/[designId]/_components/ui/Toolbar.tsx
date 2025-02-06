
'use client';

import Image from 'next/image';
import { memo } from 'react';

import { navElements } from '../constants';
import { ActiveElement, NavbarProps } from '../types/type';

import { Button } from '@/components/ui/button';
import SubMenu  from './../../toolbar/SubMenu';

//import NewThread from './NewThread';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Toolbar = ({
  activeElement,
  imageInputRef,
  handleImageUpload,
  handleActiveElement,
}: NavbarProps) => {
  console.log('Navabar Active Element : ', activeElement);
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) &&
      value.some((val) => val?.value === activeElement?.value));

  return (
    <>
      <nav className="flex justify-between fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 items-center p-2 bg-transparent space-x-4 border-b pb-4">
        <ul className="flex flex-row border shadow-md rounded-xl px-3 py-1.5 bg-white">
          {navElements.map((item: ActiveElement | any) => (
            <li
              key={item.name}
              onClick={() => {
                if (Array.isArray(item.value)) return;
                handleActiveElement(item);
              }}
              className={`group pr-2 flex justify-center items-center
            ${isActive(item.value) ? 'bg-primary-green' : 'hover:bg-primary-grey-200'}
            `}
            >
              {/* If value is an array means it's a nav element with sub options i.e., dropdown */}
              {Array.isArray(item.value) ? (
                <>
                  <Button
                    variant="ghost"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center px-2 py-2 hover:bg-gray-200 ${isActive(item.value) ? 'bg-[#0d99ff]' : ''}`}
                    onClick={() => {
                      handleActiveElement(
                        item.value.filter(
                          (elem: any) => elem?.value === activeElement?.value
                        )[0] || item.value[0]
                      );
                    }}
                  >
                    <Image
                      src={
                        item.value.filter(
                          (elem: any) => elem?.value === activeElement?.value
                        )[0]?.icon || item.value[0]?.icon
                      }
                      alt={
                        item.value.filter(
                          (elem: any) => elem?.value === activeElement?.value
                        )[0]?.name || 'shape'
                      }
                      width={100}
                      height={100}
                      style={{
                        color: 'white',
                        height: '24px !important',
                        width: '24px !important',
                        maxWidth: 'none',
                      }}
                      className={`${isActive(item.value) ? 'invert' : ''}`}
                    />
                  </Button>
                  <SubMenu
                    item={item}
                    activeElement={activeElement}
                    imageInputRef={imageInputRef}
                    handleActiveElement={handleActiveElement}
                    handleImageUpload={handleImageUpload}
                  />
                </>
              ) : (
                //: item?.value === 'comments' ? (
                //   // If value is comments, trigger the NewThread component

                //   <Button
                //     variant="ghost"
                //     className={`w-10 h-10 rounded-lg flex items-center justify-center px-2 py-2 hover:bg-gray-200 ${isActive(item.value) ? 'bg-[#0d99ff]' : ''}`}
                //   >
                //     <Image
                //       src={item.icon}
                //       alt={item.name}
                //       width={100}
                //       height={100}
                //       style={{
                //         color: 'white',
                //         height: '24px !important',
                //         width: '24px !important',
                //         maxWidth: 'none',
                //       }}
                //       className={`${isActive(item.value) ? 'invert' : ''}`}
                //     />
                //   </Button>
                // ) :
                <Button
                  variant="ghost"
                  className={`w-10 h-10 rounded-lg flex items-center justify-center px-2 py-2 hover:bg-gray-200 ${isActive(item.value) ? 'bg-[#0d99ff]' : ''}`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={24}
                    height={24}
                    style={{
                      color: 'white',
                      height: '24px !important',
                      width: '24px !important',
                      maxWidth: 'none',
                    }}
                    className={`${isActive(item.value) ? 'invert' : ''}`}
                  />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default memo(
  Toolbar,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
