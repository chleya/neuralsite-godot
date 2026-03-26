// Scene Registry - Maps node IDs to Three.js objects for fast lookup
import type { Object3D } from 'three';

interface RegistryEntry {
  objects: Set<Object3D>;
  type: string;
}

class SceneRegistry {
  private nodes: Map<string, RegistryEntry> = new Map();
  private byType: Map<string, Set<string>> = new Map();

  register(id: string, type: string, object: Object3D) {
    let entry = this.nodes.get(id);
    
    if (!entry) {
      entry = { objects: new Set(), type };
      this.nodes.set(id, entry);
      
      if (!this.byType.has(type)) {
        this.byType.set(type, new Set());
      }
      this.byType.get(type)!.add(id);
    }
    
    entry.objects.add(object);
  }

  unregister(id: string, object?: Object3D) {
    const entry = this.nodes.get(id);
    if (!entry) return;
    
    if (object) {
      entry.objects.delete(object);
      if (entry.objects.size === 0) {
        this.nodes.delete(id);
        const typeSet = this.byType.get(entry.type);
        if (typeSet) typeSet.delete(id);
      }
    } else {
      this.nodes.delete(id);
      const typeSet = this.byType.get(entry.type);
      if (typeSet) typeSet.delete(id);
    }
  }

  get(id: string): Object3D | undefined {
    const entry = this.nodes.get(id);
    if (!entry) return undefined;
    return [...entry.objects][0];
  }

  getAll(id: string): Object3D[] {
    const entry = this.nodes.get(id);
    return entry ? [...entry.objects] : [];
  }

  getEntry(id: string): RegistryEntry | undefined {
    return this.nodes.get(id);
  }

  getByType(type: string): string[] {
    const set = this.byType.get(type);
    return set ? [...set] : [];
  }

  getAllIds(): string[] {
    return [...this.nodes.keys()];
  }

  has(id: string): boolean {
    return this.nodes.has(id);
  }

  clear() {
    this.nodes.clear();
    this.byType.clear();
  }

  get size(): number {
    return this.nodes.size;
  }
}

export const sceneRegistry = new SceneRegistry();
