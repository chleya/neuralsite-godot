// API Service - Backend Entity API integration
import axios from 'axios';
import type { Entity, EntityType } from './schema';

// Use environment variable or fallback to localhost
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

const TOKEN_KEY = 'neuralsite_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);
export const isAuthenticated = (): boolean => !!getToken();

const api = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.detail || error.message || '请求失败';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export interface EntityCreate {
  section_id?: string | null;
  entity_type: string;
  code?: string | null;
  name: string;
  start_station: string;
  end_station: string;
  lateral_offset?: number;
  width?: number | null;
  height?: number | null;
  lanes?: number | null;
  design_elevation?: number | null;
  progress?: number;
  construction_phase?: string;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  cost_budget?: number | null;
  quality_status?: string;
  safety_level?: string;
  notes?: string | null;
  alignment_type?: 'straight' | 'circular' | 'spiral';
  curve_radius?: number | null;
  curve_length?: number | null;
  start_azimuth?: number;
  vertical_type?: 'level' | 'grade' | 'vertical_curve';
  start_elevation?: number;
  end_elevation?: number;
  vertical_curve_length?: number | null;
  grade_in?: number;
  grade_out?: number;
  cross_section_type?: 'fill' | 'cut' | 'mixed';
  formation_width?: number;
  side_slope_fill?: number;
  side_slope_cut?: number;
  pavement_thickness?: number;
}

export interface EntityUpdate {
  section_id?: string | null;
  code?: string | null;
  name?: string | null;
  start_station?: string | null;
  end_station?: string | null;
  lateral_offset?: number | null;
  width?: number | null;
  height?: number | null;
  lanes?: number | null;
  design_elevation?: number | null;
  progress?: number | null;
  construction_phase?: string | null;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  cost_budget?: number | null;
  quality_status?: string | null;
  safety_level?: string | null;
  status?: string | null;
  notes?: string | null;
  alignment_type?: 'straight' | 'circular' | 'spiral' | null;
  curve_radius?: number | null;
  curve_length?: number | null;
  start_azimuth?: number | null;
  vertical_type?: 'level' | 'grade' | 'vertical_curve' | null;
  start_elevation?: number | null;
  end_elevation?: number | null;
  vertical_curve_length?: number | null;
  grade_in?: number | null;
  grade_out?: number | null;
  cross_section_type?: 'fill' | 'cut' | 'mixed' | null;
  formation_width?: number | null;
  side_slope_fill?: number | null;
  side_slope_cut?: number | null;
  pavement_thickness?: number | null;
}

// ============ Space API Types ============

export interface StationToCoordRequest {
  station: string;
  lateral_offset?: number;
  elevation?: number | null;
}

export interface StationToCoordResponse {
  station: string;
  x: number;
  y: number;
  z: number;
  lateral_offset: number;
}

export interface CoordToStationRequest {
  x: number;
  y: number;
  z?: number;
  lateral_offset?: number;
}

export interface CoordToStationResponse {
  x: number;
  y: number;
  z: number;
  station: string;
  distance: number;
}

export interface RangeToCoordsRequest {
  start_station: string;
  end_station: string;
  lateral_offset?: number;
  interval?: number;
}

export interface RangeToCoordsResponse {
  start_station: string;
  end_station: string;
  length: number;
  points: Array<{ x: number; y: number; z: number }>;
  start_coord: { x: number; y: number; z: number };
  end_coord: { x: number; y: number; z: number };
}

export interface RouteInfoResponse {
  route_id: string;
  route_name: string;
  start_station: string;
  end_station: string;
  start_coord: { x: number; y: number; z: number };
  start_azimuth: number;
  has_horizontal_curves: boolean;
  has_vertical_curves: boolean;
}

export const apiService = {
  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await api.get('/health');
      return true;
    } catch {
      return false;
    }
  },

  // ============ Project API ============
  async getProjects(): Promise<Array<{
    id: string;
    code: string;
    name: string;
    construction_unit: string;
    supervision_unit: string;
    design_unit: string;
    planned_start_date: string;
    planned_end_date: string;
    total_budget: number;
    status: string;
  }>> {
    const response = await api.get('/projects');
    return response.data;
  },

  // ============ Entity CRUD ============

  // Get all entities
  async getEntities(params?: {
    skip?: number;
    limit?: number;
    entity_type?: EntityType;
  }): Promise<{ items: Entity[]; total: number; skip: number; limit: number }> {
    const response = await api.get('/entities', { params });
    return response.data;
  },

  // Get single entity
  async getEntity(id: string): Promise<Entity> {
    const response = await api.get(`/entities/${id}`);
    return response.data;
  },

  // Create entity
  async createEntity(data: EntityCreate): Promise<Entity> {
    const response = await api.post('/entities', data);
    return response.data;
  },

  // Batch create entities (up to 100)
  async createEntitiesBatch(dataList: EntityCreate[]): Promise<{
    success: number;
    failed: number;
    created: string[];
    errors: Array<{ index: number; id: string; error: string }> | null;
  }> {
    if (dataList.length > 100) {
      throw new Error('单次批量创建最多100个实体');
    }
    const response = await api.post('/entities/batch', { entities: dataList });
    return response.data;
  },

  // Update entity (partial update)
  async updateEntity(id: string, data: EntityUpdate): Promise<Entity> {
    const response = await api.put(`/entities/${id}`, data);
    return response.data;
  },

  // Delete entity
  async deleteEntity(id: string): Promise<void> {
    await api.delete(`/entities/${id}`);
  },

  // Query entities at location (by station)
  async queryEntitiesAtLocation(station: string, entity_type?: EntityType): Promise<{
    station: string;
    count: number;
    entities: Array<{
      id: string;
      entity_type: string;
      name: string;
      start_station: string;
      end_station: string;
      lateral_offset: number;
    }>;
  }> {
    const response = await api.get('/entities/at-location', {
      params: { station, entity_type },
    });
    return response.data;
  },

  // ============ Space Service API ============

  // Station to Coordinate
  async stationToCoord(req: StationToCoordRequest): Promise<StationToCoordResponse> {
    const response = await api.post('/space/station-to-coord', req);
    return response.data;
  },

  // Coordinate to Station
  async coordToStation(req: CoordToStationRequest): Promise<CoordToStationResponse> {
    const response = await api.post('/space/coord-to-station', req);
    return response.data;
  },

  // Station Range to Coordinates
  async rangeToCoords(req: RangeToCoordsRequest): Promise<RangeToCoordsResponse> {
    const response = await api.post('/space/range-to-coords', req);
    return response.data;
  },

  // Get Route Info
  async getRouteInfo(): Promise<RouteInfoResponse> {
    const response = await api.get('/space/route-info');
    return response.data;
  },

  // Get Nearby Stations
  async getNearbyStations(station: string, count: number = 5, interval: number = 1000): Promise<string[]> {
    const response = await api.get('/space/nearby', {
      params: { station, count, interval }
    });
    return response.data.stations || [];
  },

  // Validate Station Format
  async validateStation(station: string): Promise<{ valid: boolean; error?: string }> {
    const response = await api.post('/space/validate-station', { station });
    return response.data;
  },

  // Get Cross Section
  async getCrossSection(station: string, width: number = 20, interval: number = 1): Promise<{
    station: string;
    width: number;
    points: Array<{ x: number; y: number; z: number }>;
  }> {
    const response = await api.get(`/space/cross-section/${station}`, {
      params: { width, interval }
    });
    return response.data;
  },

  // ============ Work Areas (legacy support) ============
  async getWorkAreas(): Promise<unknown[]> {
    const response = await api.get('/work-areas');
    return response.data.work_areas || response.data;
  },

  // ============ State Snapshots (for time travel) ============
  async getEntityHistory(entityId: string): Promise<unknown[]> {
    const response = await api.get(`/states/entity/${entityId}`);
    return response.data;
  },

  // ============ Data Import/Export ============
  async exportData(): Promise<Blob> {
    const response = await api.get('/data/export', { responseType: 'blob' });
    return response.data;
  },

  async importData(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/data/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async importEntitiesCSV(file: File): Promise<{ success: boolean; imported: number; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/entities/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ============ Semantic Tags (9 Categories) ============
  async getTags(category?: string): Promise<Array<{
    id: string;
    code: string;
    name: string;
    name_en: string | null;
    category: string;
    description: string | null;
    color: string;
    icon: string | null;
    parent_id: string | null;
    sort_order: number;
  }>> {
    const response = await api.get('/tags', category ? { params: { category } } : {});
    return response.data;
  },

  async getTagCategories(): Promise<string[]> {
    const response = await api.get('/tags/categories');
    return response.data;
  },

  async getEntityTags(entityId: string): Promise<Array<{
    id: string;
    code: string;
    name: string;
    color: string;
    icon: string | null;
  }>> {
    const response = await api.get(`/entities/${entityId}/tags`);
    return response.data;
  },

  async addEntityTag(entityId: string, tagId: string): Promise<{ success: boolean }> {
    const response = await api.post(`/entities/${entityId}/tags/${tagId}`);
    return response.data;
  },

  async removeEntityTag(entityId: string, tagId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/entities/${entityId}/tags/${tagId}`);
    return response.data;
  },

  async updateEntityTags(entityId: string, tagIds: string[]): Promise<Array<{
    id: string;
    code: string;
    name: string;
  }>> {
    const response = await api.put(`/entities/${entityId}/tags`, tagIds);
    return response.data;
  },

  async getEntitiesByTag(tagId: string): Promise<Entity[]> {
    const response = await api.get(`/tags/${tagId}/entities`);
    return response.data;
  },

  // ============ Entity Versions (State Snapshots) ============
  async getEntityVersions(entityId: string, limit = 50, skip = 0): Promise<{
    total: number;
    items: Array<{
      id: string;
      entity_id: string;
      version_number: number;
      state_data: Record<string, any>;
      change_description: string | null;
      created_by: string | null;
      created_at: string;
    }>;
    limit: number;
    skip: number;
  }> {
    const response = await api.get(`/entities/${entityId}/versions`, { params: { limit, skip } });
    return response.data;
  },

  async getEntityVersion(entityId: string, versionId: string): Promise<{
    id: string;
    entity_id: string;
    version_number: number;
    state_data: Record<string, any>;
    change_description: string | null;
    created_by: string | null;
    created_at: string;
  }> {
    const response = await api.get(`/entities/${entityId}/versions/${versionId}`);
    return response.data;
  },

  async createEntityVersion(entityId: string, changeDescription?: string, createdBy?: string): Promise<{
    id: string;
    version_number: number;
    success: boolean;
  }> {
    const response = await api.post(`/entities/${entityId}/versions`, {
      change_description: changeDescription,
      created_by: createdBy,
    });
    return response.data;
  },

  async batchCreateVersions(entityIds: string[], changeDescription?: string, createdBy?: string): Promise<{
    created: number;
    versions: Array<{ entity_id: string; version_id: string; version_number: number }>;
  }> {
    const response = await api.post('/entities/versions/batch', {
      entity_ids: entityIds,
      change_description: changeDescription,
      created_by: createdBy,
    });
    return response.data;
  },

  async restoreEntityVersion(entityId: string, versionId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/entities/${entityId}/versions/${versionId}/restore`);
    return response.data;
  },

  async deleteEntityVersion(entityId: string, versionId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/entities/${entityId}/versions/${versionId}`);
    return response.data;
  },

  async deleteAllEntityVersions(entityId: string, keepLatest = false): Promise<{ success: boolean; deleted: number }> {
    const response = await api.delete(`/entities/${entityId}/versions`, { params: { keep_latest: keepLatest } });
    return response.data;
  },

  // ============ Dashboard ============
  async getDashboardSummary(): Promise<{
    project_count: number;
    section_count: number;
    entity_by_type: Array<{ entity_type: string; count: number; avg_progress: number }>;
    overall_progress: number;
    open_quality_issues: number;
    open_safety_issues: number;
    quantity_completion: number;
  }> {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },

  // ============ Quality Records ============
  async createQualityRecord(data: {
    entity_id: string;
    record_date: string;
    inspection_type: string;
    issue_found?: string;
    issue_severity?: string;
    inspector?: string;
    result?: string;
  }): Promise<{ id: string; success: boolean }> {
    const response = await api.post('/quality', data);
    return response.data;
  },

  async getQualityRecords(entityId?: string): Promise<Array<{
    id: string;
    entity_id: string;
    record_date: string;
    inspection_type: string;
    issue_found: string;
    issue_severity: string;
    status: string;
  }>> {
    const response = await api.get('/quality', { params: entityId ? { entity_id: entityId } : undefined });
    return response.data;
  },

  // ============ Safety Records ============
  async createSafetyRecord(data: {
    entity_id: string;
    record_date: string;
    inspection_type: string;
    hazard_description?: string;
    risk_level?: string;
    corrective_action?: string;
    responsible_person?: string;
    deadline?: string;
  }): Promise<{ id: string; success: boolean }> {
    const response = await api.post('/safety', data);
    return response.data;
  },

  async getSafetyRecords(entityId?: string): Promise<Array<{
    id: string;
    entity_id: string;
    record_date: string;
    inspection_type: string;
    hazard_description: string;
    risk_level: string;
    status: string;
  }>> {
    const response = await api.get('/safety', { params: entityId ? { entity_id: entityId } : undefined });
    return response.data;
  },

  // ============ Progress Records ============
  async createProgressRecord(data: {
    entity_id: string;
    record_date: string;
    planned_progress?: number;
    actual_progress: number;
    work_description?: string;
    worker_count?: number;
    equipment_count?: number;
    weather?: string;
    issues?: string;
  }): Promise<{ id: string; success: boolean }> {
    const response = await api.post('/progress', data);
    return response.data;
  },

  // ============ Resource APIs ============

  // Personnel
  async createPersonnel(data: {
    entity_id: string;
    name: string;
    work_type?: string;
    team?: string;
    qualification?: string;
  }): Promise<{ id: string; success: boolean }> {
    const response = await api.post('/resources/personnel', data);
    return response.data;
  },

  async getPersonnel(entityId?: string): Promise<Array<{
    id: string;
    entity_id: string;
    name: string;
    work_type: string;
    team: string;
    qualification: string;
    status: string;
    created_at: string;
  }>> {
    const response = await api.get('/resources/personnel', { params: entityId ? { entity_id: entityId } : undefined });
    return response.data;
  },

  async deletePersonnel(id: string): Promise<void> {
    await api.delete(`/resources/personnel/${id}`);
  },

  // Equipment
  async createEquipment(data: {
    entity_id: string;
    equipment_type: string;
    usage_hours?: number;
  }): Promise<{ id: string; success: boolean }> {
    const response = await api.post('/resources/equipment', data);
    return response.data;
  },

  async getEquipment(entityId?: string): Promise<Array<{
    id: string;
    entity_id: string;
    equipment_type: string;
    usage_hours: number;
    status: string;
    created_at: string;
  }>> {
    const response = await api.get('/resources/equipment', { params: entityId ? { entity_id: entityId } : undefined });
    return response.data;
  },

  async deleteEquipment(id: string): Promise<void> {
    await api.delete(`/resources/equipment/${id}`);
  },

  // Materials
  async createMaterial(data: {
    entity_id: string;
    material_type: string;
    quantity: number;
    unit?: string;
  }): Promise<{ id: string; success: boolean }> {
    const response = await api.post('/resources/materials', data);
    return response.data;
  },

  async getMaterials(entityId?: string): Promise<Array<{
    id: string;
    entity_id: string;
    material_type: string;
    quantity: number;
    unit: string;
    created_at: string;
  }>> {
    const response = await api.get('/resources/materials', { params: entityId ? { entity_id: entityId } : undefined });
    return response.data;
  },

  async deleteMaterial(id: string): Promise<void> {
    await api.delete(`/resources/materials/${id}`);
  },

  // Funds
  async createFund(data: {
    entity_id: string;
    budget_category: string;
    amount: number;
    used_amount?: number;
  }): Promise<{ id: string; success: boolean }> {
    const response = await api.post('/resources/funds', data);
    return response.data;
  },

  async getFunds(entityId?: string): Promise<Array<{
    id: string;
    entity_id: string;
    budget_category: string;
    amount: number;
    used_amount: number;
    status: string;
    created_at: string;
  }>> {
    const response = await api.get('/resources/funds', { params: entityId ? { entity_id: entityId } : undefined });
    return response.data;
  },

  async deleteFund(id: string): Promise<void> {
    await api.delete(`/resources/funds/${id}`);
  },

  // Auth
  async login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
  }): Promise<{
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
  }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<{
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
  }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/change-password', null, {
      params: { old_password: oldPassword, new_password: newPassword },
    });
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};

export default api;
