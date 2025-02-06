import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getShapeInfo = (shapeType: string) => {
  switch (shapeType) {
    case 'rect':
      return {
        icon: '/assets/rectangle.svg',
        name: 'Rectangle',
      };

    case 'circle':
      return {
        icon: '/assets/circle.svg',
        name: 'Circle',
      };

    case 'triangle':
      return {
        icon: '/assets/triangle.svg',
        name: 'Triangle',
      };

    case 'line':
      return {
        icon: '/assets/line.svg',
        name: 'Line',
      };

    case 'i-text':
      return {
        icon: '/assets/text.svg',
        name: 'Text',
      };

    case 'image':
      return {
        icon: '/assets/image.svg',
        name: 'Image',
      };

    case 'freeform':
      return {
        icon: '/assets/freeform.svg',
        name: 'Free Drawing',
      };

    default:
      return {
        icon: '/assets/rectangle.svg',
        name: shapeType,
      };
  }
};

// export const exportToPdf = () => {
//   const canvas = document.querySelector("canvas");

//   if (!canvas) return;

//   // use jspdf
//   const doc = new jsPDF({
//     orientation: "landscape",
//     unit: "px",
//     format: [canvas.width, canvas.height],
//   });

//   // get the canvas data url
//   const data = canvas.toDataURL();

//   // add the image to the pdf
//   doc.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);

//   // download the pdf
//   doc.save("canvas.pdf");
// };

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;

  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
    }
  };
};
