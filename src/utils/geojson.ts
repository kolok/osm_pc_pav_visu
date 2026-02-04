import { GlassPoint } from '../types';

export function pointsToGeoJSON(points: GlassPoint[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map(point => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude]
      },
      properties: {
        id: point.identifiant_unique,
        nom: point.nom,
        adresse: point.adresse,
        code_postal: point.code_postal,
        ville: point.ville
      }
    }))
  };
}
