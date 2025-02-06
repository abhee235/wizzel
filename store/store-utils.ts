interface FlatObject {
    id: string;
    parentId: string | null;
    [key: string]: any; // Additional properties
  }
  
  export class HierarchyUtils {
    private flatList: FlatObject[];
  
    constructor(flatList: FlatObject[]) {
      this.flatList = flatList;
    }
  
    /**
     * Get an object by ID.
     * @param id The ID of the object to fetch.
     * @returns The object if found, or `null` if not found.
     */
    getObject(id: string): FlatObject | null {
      return this.flatList.find((obj) => obj.id === id) || null;
    }
  
    /**
     * Get all children of a given object, including nested children.
     * @param id The ID of the parent object.
     * @returns An array of child objects (flattened).
     */
    getObjectsIncludingChildren(id: string): FlatObject[] {
      const children = [];
  
      const addChildren = (parentId: string) => {
        const directChildren = this.flatList.filter(
          (obj) => obj.parentId === parentId
        );
        children.push(...directChildren);
        directChildren.forEach((child) => addChildren(child.id));
      };
  
      addChildren(id);
      return children;
    }
  
    /**
     * Find the topmost parent of a given object in the hierarchy.
     * @param id The ID of the object.
     * @returns The topmost parent object or the object itself if it is already a top-level object.
     */
    findTopParent(id: string): FlatObject | null {
      let current = this.getObject(id);
      while (current && current.parentId) {
        current = this.getObject(current.parentId);
      }
      return current;
    }
  
    /**
     * Build a nested hierarchy starting from a specific node.
     * @param id The ID of the root node for the hierarchy.
     * @returns A nested hierarchy object.
     */
    getHierarchyFromNode(id: string): FlatObject | null {
      const node = this.getObject(id);
      if (!node) return null;
  
      const buildHierarchy = (parentId: string): FlatObject => {
        const node = this.getObject(parentId);
        if (!node) throw new Error(`Object with ID "${parentId}" not found`);
        const children = this.flatList.filter((obj) => obj.parentId === parentId);
        return {
          ...node,
          children: children.map((child) => buildHierarchy(child.id)),
        };
      };
  
      return buildHierarchy(id);
    }
  
    /**
     * Build a full hierarchy from the flat list.
     * @returns A nested hierarchy starting from the topmost objects.
     */
    buildFullHierarchy(): FlatObject[] {
      const rootObjects = this.flatList.filter((obj) => obj.parentId === null);
      return rootObjects.map((root) => this.getHierarchyFromNode(root.id)!);
    }
  
    /**
     * Move an object to a new parent.
     * @param id The ID of the object to move.
     * @param newParentId The ID of the new parent (or `null` for top-level).
     * @returns `true` if the move was successful, `false` otherwise.
     */
    moveObject(id: string, newParentId: string | null): boolean {
      const object = this.getObject(id);
      if (!object) return false;
      if (id === newParentId)
        throw new Error('An object cannot be its own parent');
  
      object.parentId = newParentId;
      return true;
    }
  
    /**
     * Find all sibling objects of a given object.
     * @param id The ID of the object.
     * @returns An array of sibling objects (excluding the given object).
     */
    getSiblings(id: string): FlatObject[] {
      const object = this.getObject(id);
      if (!object) return [];
      return this.flatList.filter(
        (obj) => obj.parentId === object.parentId && obj.id !== id
      );
    }
  
    /**
     * Find all top-level objects (objects with no parent).
     * @returns An array of top-level objects.
     */
    getTopLevelObjects(): FlatObject[] {
      return this.flatList.filter((obj) => obj.parentId === null);
    }
  
    /**
     * Find all leaf nodes in the hierarchy (objects with no children).
     * @returns An array of leaf node objects.
     */
    getLeafNodes(): FlatObject[] {
      const parentIds = new Set(
        this.flatList.map((obj) => obj.parentId).filter(Boolean)
      );
      return this.flatList.filter((obj) => !parentIds.has(obj.id));
    }
  
    /**
     * Remove a node and reassign its children to the parent's parent or as top-level.
     * @param id The ID of the node to remove.
     * @returns `true` if the node was removed, `false` if it was not found.
     */
    removeNodeAndPreserveChildren(id: string): boolean {
      const node = this.getObject(id);
      if (!node) return false;
  
      const parentId = node.parentId;
      const children = this.flatList.filter((obj) => obj.parentId === id);
  
      // Reassign children to the parent's parent or make them top-level
      children.forEach((child) => {
        child.parentId = parentId;
      });
  
      // Remove the node
      this.flatList = this.flatList.filter((obj) => obj.id !== id);
      return true;
    }
  
    /**
     * Add a new object to the hierarchy.
     * @param newObject The object to add.
     */
    addObject(newObject: FlatObject): void {
      this.flatList.push(newObject);
    }
  
    /**
     * Modify an existing object by merging updates.
     * @param id The ID of the object to modify.
     * @param updates The updates to apply to the object.
     * @returns `true` if the object was found and modified, `false` otherwise.
     */
    modifyObject(id: string, updates: Partial<FlatObject>): boolean {
      const object = this.getObject(id);
      if (!object) return false;
  
      Object.assign(object, updates);
      return true;
    }
  
    /**
     * Remove a node and all its children from the hierarchy.
     * @param id The ID of the node to remove.
     * @returns The removed objects.
     */
    removeNodeAndChildren(id: string): FlatObject[] {
      const objectsToRemove = [
        id,
        ...this.getObjectsIncludingChildren(id).map((obj) => obj.id),
      ];
      const removedObjects = this.flatList.filter((obj) =>
        objectsToRemove.includes(obj.id)
      );
  
      this.flatList = this.flatList.filter(
        (obj) => !objectsToRemove.includes(obj.id)
      );
      return removedObjects;
    }
  }
