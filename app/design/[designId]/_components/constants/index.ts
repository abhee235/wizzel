export const COLORS = ['#DC2626', '#D97706', '#059669', '#7C3AED', '#DB2777'];

export const shapeElements = [
  {
    icon: '/assets/rectangle.svg',
    name: 'Rectangle',
    value: 'rectangle',
  },
  {
    icon: '/assets/circle.svg',
    name: 'Circle',
    value: 'circle',
  },
  {
    icon: '/assets/triangle.svg',
    name: 'Triangle',
    value: 'triangle',
  },
  {
    icon: '/assets/line.svg',
    name: 'Line',
    value: 'line',
  },
  {
    icon: '/assets/arrow-up-right.svg',
    name: 'Arrow',
    value: 'arrow',
  },
  {
    icon: '/assets/pentagon.svg',
    name: 'Polygon',
    value: 'polygon',
  },
  {
    icon: '/assets/star.svg',
    name: 'Star',
    value: 'star',
  },
  {
    icon: '/assets/image.svg',
    name: 'Image',
    value: 'image',
  },
  {
    icon: '/assets/freeform.svg',
    name: 'Free Drawing',
    value: 'freeform',
  },
];

export const selectionElements = [
  {
    icon: '/assets/select.svg',
    name: 'Select',
    value: 'select',
  },
  {
    icon: '/assets/hand.svg',
    name: 'Hand',
    value: 'hand',
  },
];

export const groupingElements = [
  {
    icon: '/assets/frame.svg',
    name: 'Frame',
    value: 'frame',
  },
  {
    icon: '/assets/select.svg',
    name: 'Crop',
    value: 'crop',
  },
];

export const removingElements = [
  {
    icon: '/assets/delete.svg',
    value: 'delete',
    name: 'Delete',
  },
  {
    icon: '/assets/reset.svg',
    value: 'reset',
    name: 'Reset',
  },
];

export const navElements = [
  {
    icon: '/assets/select.svg',
    name: 'Select',
    value: selectionElements,
  },
  {
    icon: '/assets/circle.svg',
    name: 'Card',
    value: groupingElements,
  },

  {
    icon: '/assets/rectangle.svg',
    name: 'Rectangle',
    value: shapeElements,
  },
  {
    icon: '/assets/text.svg',
    value: 'text',
    name: 'Text',
  },
  {
    icon: '/assets/delete.svg',
    value: removingElements,
    name: 'Delete',
  },

  {
    icon: '/assets/comments.svg',
    value: 'comments',
    name: 'Comments',
  },
];

export const defaultNavElement = {
  icon: '/assets/select.svg',
  name: 'Select',
  value: 'select',
};

export const directionOptions = [
  { label: 'Bring to Front', value: 'front', icon: '/assets/front.svg' },
  { label: 'Send to Back', value: 'back', icon: '/assets/back.svg' },
];

export const fontFamilyOptions = [
  { value: 'Inter, sans serif', label: 'Inter' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Brush Script MT', label: 'Brush Script MT' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Lucida Console', label: 'Lucida Console' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Segoe UI', label: 'Segoe UI' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Raleway', label: 'Raleway' },
];

export const fontSizeOptions = [
  {
    value: '10',
    label: '10',
  },
  {
    value: '11',
    label: '11',
  },
  {
    value: '12',
    label: '12',
  },
  {
    value: '13',
    label: '13',
  },
  {
    value: '14',
    label: '14',
  },
  {
    value: '16',
    label: '16',
  },
  {
    value: '18',
    label: '18',
  },
  {
    value: '20',
    label: '20',
  },
  {
    value: '22',
    label: '22',
  },
  {
    value: '24',
    label: '24',
  },
  {
    value: '28',
    label: '28',
  },
  {
    value: '32',
    label: '32',
  },
  {
    value: '36',
    label: '36',
  },
  {
    value: '40',
    label: '40',
  },
  {
    value: '48',
    label: '48',
  },
  {
    value: '54',
    label: '54',
  },
  {
    value: '64',
    label: '64',
  },
  {
    value: '72',
    label: '72',
  },
  {
    value: '96',
    label: '96',
  },
  {
    value: '128',
    label: '128',
  },
];

export const fontWeightOptions = [
  {
    value: '100',
    label: 'Thin',
  },
  {
    value: '200',
    label: 'Extra Thin',
  },
  {
    value: '300',
    label: 'Light',
  },

  {
    value: '400',
    label: 'Normal',
  },
  {
    value: '500',
    label: 'Medium',
  },
  {
    value: '600',
    label: 'Semi Bold',
  },
  {
    value: '700',
    label: 'Bold',
  },
  {
    value: '800',
    label: 'Extra Bold',
  },
];

export const alignmentOptions = [
  { value: 'left', label: 'Align Left', icon: '/assets/align-left.svg' },
  {
    value: 'horizontalCenter',
    label: 'Align Horizontal Center',
    icon: '/assets/align-horizontal-center.svg',
  },
  { value: 'right', label: 'Align Right', icon: '/assets/align-right.svg' },
  { value: 'top', label: 'Align Top', icon: '/assets/align-top.svg' },
  {
    value: 'verticalCenter',
    label: 'Align Vertical Center',
    icon: '/assets/align-vertical-center.svg',
  },
  { value: 'bottom', label: 'Align Bottom', icon: '/assets/align-bottom.svg' },
];

export const shortcuts = [
  {
    key: '1',
    name: 'Save',
    value: 'save',
    shortcut: '',
    active: true,
  },
  {
    key: '2',
    name: 'Share',
    value: 'share',
    shortcut: '',
    active: true,
  },
  {
    key: '10',
    name: 'Copy',
    value: 'copy',
    shortcut: 'Ctrl/⌘+C',
    active: false,
  },
  {
    key: '11',
    name: 'Paste',
    value: 'paste',
    shortcut: 'Ctrl/⌘+V',
    active: false,
  },
  {
    key: '12',
    name: 'Cut',
    value: 'cut',
    shortcut: 'Ctrl/⌘+X',
    active: false,
  },
  {
    key: '13',
    name: 'Undo',
    value: 'undo',
    shortcut: 'Ctrl/⌘+Z',
    active: true,
  },
  {
    key: '14',
    name: 'Redo',
    value: 'redo',
    shortcut: 'Ctrl/⌘+Y',
    active: true,
  },
  {
    key: '20',
    name: 'Group Selection',
    value: 'groupSelection',
    shortcut: 'Alt+G',
    active: false,
  },
  {
    key: '21',
    name: 'Ungroup Selection',
    value: 'ungroupSelection',
    shortcut: 'Alt+U',
    active: false,
  },
  {
    key: '22',
    name: 'Frame Selection',
    value: 'frameSelection',
    shortcut: 'Ctrl+Alt+F',
    active: false,
  },
  { Key: '23', name: 'Unframe', value: 'unframe', active: false },
  {
    key: '24',
    name: 'Crop Selection',
    value: 'cropSelection',
    shortcut: 'Alt+C',
    active: false,
  },
  {
    key: '25',
    name: 'Bring to Front',
    value: 'front',
    shortcut: '',
    active: false,
  },
  {
    key: '26',
    name: 'Send to Back',
    value: 'back',
    shortcut: '',
    active: false,
  },

  {
    key: '30',
    name: 'Auto Layout',
    value: 'autoLayout',
    shortcut: 'Ctrl+Alt+L',
    active: false,
  },
  {
    key: '31',
    name: 'Remove AutoLayout',
    value: 'removeAutoLayout',
    shortcut: 'Ctrl+Alt+R',
    active: false,
  },
  {
    key: '32',
    name: 'Select All',
    value: 'selectAll',
    shortcut: '',
    active: true,
  },
  {
    key: '33',
    name: 'Delete',
    value: 'delete',
    shortcut: 'Delete',
    active: false,
  },
  {
    key: '40',
    name: 'Lock/Unlock',
    value: 'lock',
    shortcut: 'Ctrl+Alt+K',
    active: false,
  },
  {
    key: '41',
    name: 'Hide/Show',
    value: 'hide',
    shortcut: 'Ctrl+Alt+H', 
    active: false,
  },
];
