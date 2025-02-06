import * as fabric from 'fabric';
import { v4 as uuid4 } from 'uuid';

interface ITextInputOptions extends fabric.ITextProps {
  hasFixedHeight: boolean;
  hasFixedWidth: boolean;
  fixedHeight: number;
  fixedWidth: number;
  objectId?: string;
}

export class TextInput extends fabric.Textbox {
  static type: string = 'textInput';
  declare fixedHeight: number;
  declare fixedWidth: number;
  declare hasFixedHeight: boolean;
  declare hasFixedWidth: boolean;
  declare objectId: string;

  constructor(text: string, options: ITextInputOptions) {
    super(text, options);
    this.fixedHeight = options.fixedHeight;
    this.fixedWidth = options.fixedWidth;
    this.hasFixedHeight = options.hasFixedHeight;
    this.hasFixedWidth = options.hasFixedWidth;
    this.objectId = options.objectId || uuid4();
  }

  getMinWidth() {
    if (this.hasFixedWidth) return this.fixedWidth;
    return super.getMinWidth();
  }

  calcTextHeight() {
    if (this.hasFixedHeight) return this.fixedHeight;
    return super.calcTextHeight();
  }

  //   // Override the toObject method to include custom properties
  //   toObject() {
  //     return {
  //       ...super.toObject(),
  //       customProperty: 'custom',
  //     };
  //   }

  //   // Static method for JSON deserialization
  //   static fromObject(object) {
  //     return new Promise((resolve) => {
  //       const { customProperty, ...rest } = object;

  //       // Recreate the text input
  //       const textInput = new TextInput(object.text, rest);

  //       resolve(textInput);
  //     });
  //   }
}

fabric.classRegistry.setClass(TextInput);