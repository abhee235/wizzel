import { shapeCustomProperties } from '@/lib/shapeBuilder';

export enum DesignStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export type shapeProperties = {
  shapeData: any;
  shapeCustomProperties: typeof shapeCustomProperties;
};

// Interface for a canvas object with an ID
export type CanvasObject = {
  objectId: string;
  properties: shapeProperties;
};

export type DesignInput = {
  designId: string; // Unique string identifier for each design
  title: string; // Name of the design
  description: string;
  userId?: string; // User identifier
};

export type DesignObjectstInput = {
  objectId: string; // Unique identifier for each Fabric object
  shapeData: string; // JSON data as a string
  shapeCustomProperties: string; // JSON data for custom properties
  nodeId: string; // Node identifier based on tile
};

export interface UserPreferenceInput {
  userId: string; // ID of the user associated with these preferences
  designId: string; // ID of the design associated with these preferences
  canvasData?: string; // JSON stringified data of the canvas (e.g., layers, shapes)
  theme?: 'light' | 'dark'; // Theme preference, limited to "light" or "dark"
  zoomLevel?: number; // Last zoom level (1.0 = 100%), default is 1.0 if not provided
  lastActiveLayerId?: string; // ID of the last active layer or object on the canvas
  viewportTransform?: string; // JSON stringified viewport transformation matrix
  gridVisibility?: boolean; // Whether the grid is visible on the canvas
}

export interface UpdateDesignData {
  title?: string;
  description?: string;
  status?: string;
  previewImage?: string; // For storing a preview as a data URL or an image URL
  isDeleted?: boolean;
}

export interface Design {
  id: number; // Primary key for the design
  designId: string; // Unique identifier for the design
  title: string; // Name of the design
  description: string; // Description of the design
  status: string; // Status (e.g., Draft, Published)
  previewImage: string; // Base64 data URL or image URL

  userId?: string; // Optional user ID associated with the design
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Update timestamp
  isDeleted: boolean; // Soft delete flag
}
