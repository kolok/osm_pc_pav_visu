export interface GlassPoint {
  identifiant_unique: string;
  nom: string;
  latitude: number;
  longitude: number;
  adresse: string;
  code_postal: string;
  ville: string;
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  style: string;
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  center: [2.38, 48.92],
  zoom: 12,
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
};
