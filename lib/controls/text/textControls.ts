import * as fabric from 'fabric';
import {
  createCornerControl,
  createSideControl,
  defaultControls as customControl,
} from '@/lib/controls/defaultControls';
import { changeLength } from '@/lib/controls/utils/changeObjectLength';
import { changeLayoutDimensions } from '@/lib/controls/utils/changeLayoutDimension';

export const textControls = (text: fabric.IText) => {
  return {
    ...customControl(text),
    ml: createSideControl(
      'ml',
      {
        x: -0.5,
        y: 0,
        sizeX: () => 20, // Fixed width for the control
        sizeY: (obj) => text.getScaledHeight(), // Dynamic height based on the object's scaled height
      },
      45,
      fabric.controlsUtils.changeWidth // Use the Fabric.js scaling handler
    ),
    mr: createSideControl(
      'mr',
      {
        x: 0.5,
        y: 0,
        sizeX: () => 20,
        sizeY: (obj) => text.getScaledHeight(),
      },
      45,
      fabric.controlsUtils.changeWidth
    ),
    mt: createSideControl(
      'mt',
      {
        x: 0,
        y: -0.5,
        sizeX: (obj) => text.getScaledWidth(),
        sizeY: () => 20,
      },
      135,
      changeLength
    ),
    mb: createSideControl(
      'mb',
      {
        x: 0,
        y: 0.5,
        sizeX: (obj) => text.getScaledWidth(),
        sizeY: () => 20,
      },
      135,
      changeLength
    ),
    tl: createCornerControl(
      {
        x: -0.5,
        y: -0.5,
        sizeX: (obj) => 20,
        sizeY: (obj) => 20,
      },
      90,
      changeLayoutDimensions
    ),
    tr: createCornerControl(
      {
        x: 0.5,
        y: -0.5,
        sizeX: (obj) => 20,
        sizeY: (obj) => 20,
      },
      0,
      changeLayoutDimensions
    ),
    bl: createCornerControl(
      {
        x: -0.5,
        y: 0.5,
        sizeX: (obj) => 20,
        sizeY: (obj) => 20,
      },
      0,
      changeLayoutDimensions
    ),
    br: createCornerControl(
      {
        x: 0.5,
        y: 0.5,
        sizeX: (obj) => 20,
        sizeY: (obj) => 20,
      },
      90,
      changeLayoutDimensions
    ),
  };
};
