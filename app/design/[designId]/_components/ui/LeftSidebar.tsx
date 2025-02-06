'use client';

import { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import * as fabric from 'fabric';

import { getShapeInfo } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheck,
  faEye,
  faEyeDropper,
  faEyeSlash,
  faHamburger,
  faList,
  faLock,
  faSliders,
  faUnlock,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import InlineEditableLabel from '@/components/ui/inlineEditableLabel';
import Layers from '../leftSidebar/Layers';
import { ScrollBar, ScrollArea } from '@/components/ui/scroll-area';

const LeftSidebar = ({
  allShapes,
  highlightedShape,
  handleSelectionFromLayer,
  handleSaveShapeName,
  handleShapeLock,
  handleShapePresence,
  handleShapeHighlight,
}: {
  allShapes: Array<any>;
  highlightedShape: fabric.Object | null;
  handleSelectionFromLayer: (objectId: string) => void;
  handleSaveShapeName: (id: string, name: string) => void;
  handleShapeLock: (id: string) => void;
  handleShapePresence: (id: string) => void;
  handleShapeHighlight: (id: string, isHighlight: boolean) => void;
}) => {
  const leftUpperSidebar = useRef<HTMLDivElement | null>(null);
  const leftUpperSidebarHeight = useRef<number>(0);

  useEffect(() => {
    if (leftUpperSidebar.current) {
      leftUpperSidebarHeight.current = leftUpperSidebar.current.offsetHeight;
    }
  }, []);
  // Memoize the sidebar content to avoid unnecessary re-renders
  const memoizedShapes = useMemo(
    () => (
      <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[250px] w-[250px] sticky left-0 h-full max-sm:hidden select-none overflow-none bg-white">
        <div id="leftUpperSidebar" ref={leftUpperSidebar}>
          <div className="flex justify-between items-center mt-2 py-2 px-5">
            <Image
              src="/assets/logo.svg"
              alt="FigPro Logo"
              width={58}
              height={24}
            />
            <div className="flex float-end items-center">
              <Button variant="ghost" className="h-8 w-8">
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-green-600"
                  size="lg"
                />
              </Button>
              <Button variant="ghost" className="h-8 w-8" size="icon">
                <FontAwesomeIcon icon={faSliders} size="lg" />
              </Button>
              <Button variant="ghost" className="h-8 w-8" size="icon">
                <FontAwesomeIcon icon={faList} size="lg" />
              </Button>
            </div>
          </div>
          <div className="px-5 py-4">
            <h3 className="text-base font-semibold mb-2">Basic Tutorial</h3>
            <span className="text-gray-500 text-xs text-clip max-w-52">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              eget lacus in velit.
            </span>
          </div>
          <div className="border border-primary-grey-200 px-3 py-2">
            <h4 className="text-sm font-semibold mb-2 px-2">Pages</h4>
            <ul>
              <li className="text-xs py-1 bg-muted px-2 rounded">
                My sample Page
              </li>
              <li className="text-xs mt-2 pt-1 px-2">Design Basics</li>
              <li className="text-xs mt-2 pt-1 px-2">Web Design</li>
              <li className="text-xs mt-2 pt-1 px-2">Logo Design</li>
            </ul>
          </div>

          <h3 className="text-sm font-semibold px-4 py-2">Layers</h3>
        </div>
        <ScrollArea
          type="hover"
          //className={`h-[calc(100%-${leftUpperSidebarHeight.current}px)] w-full whitespace-nowrap`}
          className="h-full w-full pb-4"
        >
          {allShapes?.map((shape: any) => (
            <Layers
              key={shape.objectId}
              shape={shape.properties.shapeData}
              highlightedShape={highlightedShape}
              handleSelectionFromLayer={handleSelectionFromLayer}
              handleSaveShapeName={handleSaveShapeName}
              handleShapeLock={handleShapeLock}
              handleShapePresence={handleShapePresence}
              handleShapeHighlight={handleShapeHighlight}
            />
          ))}
          <ScrollBar
            orientation="vertical"
            className="absolute scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-sky-700 scrollbar-track-sky-300"
          />
        </ScrollArea>
      </section>
    ),
    [allShapes]
  );

  return memoizedShapes;
};

export default LeftSidebar;