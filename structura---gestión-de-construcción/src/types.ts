export interface Material {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost?: number;
}

export interface Structure {
  id: string;
  name: string;
  materials: Material[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectStructure {
  structureId: string;
  quantity: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: 'proyecto' | 'cotización';
  structures: ProjectStructure[];
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'completed' | 'archived';
  completionDate?: number;
}

export interface ConsolidatedMaterial {
  name: string;
  unit: string;
  totalQuantity: number;
  totalCost: number;
}
