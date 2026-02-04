import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GlassPoint, MapConfig, DEFAULT_MAP_CONFIG } from '../types';
import { pointsToGeoJSON } from '../utils/geojson';

interface LayerVisibility {
  plaineCommune: boolean;
  pav93: boolean;
  osm: boolean;
}

interface GlassPointsMapProps {
  pointsPlaineCommune: GlassPoint[];
  pointsPav93: GlassPoint[];
  pointsOsm: GlassPoint[];
  visibility: LayerVisibility;
  config?: MapConfig;
  onMapReady?: () => void;
}

const LAYER_PLAINE_COMMUNE = 'plaine-commune-layer';
const SOURCE_PLAINE_COMMUNE = 'plaine-commune-source';
const LAYER_PAV93 = 'pav93-layer';
const SOURCE_PAV93 = 'pav93-source';
const LAYER_OSM = 'osm-layer';
const SOURCE_OSM = 'osm-source';

export function GlassPointsMap({ 
  pointsPlaineCommune,
  pointsPav93,
  pointsOsm,
  visibility,
  config = DEFAULT_MAP_CONFIG,
  onMapReady 
}: GlassPointsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pointsAdded = useRef(false);

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: config.style,
      center: config.center,
      zoom: config.zoom
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
      pointsAdded.current = false;
    };
  }, [config]);

  // Ajouter les points à la carte
  useEffect(() => {
    const totalPoints = pointsPlaineCommune.length + pointsPav93.length + pointsOsm.length;
    if (!map.current || totalPoints === 0) return;

    const addPointsToMap = () => {
      if (!map.current || pointsAdded.current) return;

      // Supprimer les couches/sources existantes si présentes
      [LAYER_PLAINE_COMMUNE, LAYER_PAV93, LAYER_OSM].forEach(layerId => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });
      [SOURCE_PLAINE_COMMUNE, SOURCE_PAV93, SOURCE_OSM].forEach(sourceId => {
        if (map.current!.getSource(sourceId)) {
          map.current!.removeSource(sourceId);
        }
      });

      // Ajouter les points Plaine Commune (vert)
      if (pointsPlaineCommune.length > 0) {
        const geojsonPlaineCommune = pointsToGeoJSON(pointsPlaineCommune);
        map.current!.addSource(SOURCE_PLAINE_COMMUNE, {
          type: 'geojson',
          data: geojsonPlaineCommune
        });
        map.current!.addLayer({
          id: LAYER_PLAINE_COMMUNE,
          type: 'circle',
          source: SOURCE_PLAINE_COMMUNE,
          paint: {
            'circle-radius': 8,
            'circle-color': '#22c55e',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#166534'
          }
        });
      }

      // Ajouter les points PAV 93 (orange)
      if (pointsPav93.length > 0) {
        const geojsonPav93 = pointsToGeoJSON(pointsPav93);
        map.current!.addSource(SOURCE_PAV93, {
          type: 'geojson',
          data: geojsonPav93
        });
        map.current!.addLayer({
          id: LAYER_PAV93,
          type: 'circle',
          source: SOURCE_PAV93,
          paint: {
            'circle-radius': 8,
            'circle-color': '#f97316',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#c2410c'
          }
        });
      }

      // Ajouter les points OSM (bleu)
      if (pointsOsm.length > 0) {
        const geojsonOsm = pointsToGeoJSON(pointsOsm);
        map.current!.addSource(SOURCE_OSM, {
          type: 'geojson',
          data: geojsonOsm
        });
        map.current!.addLayer({
          id: LAYER_OSM,
          type: 'circle',
          source: SOURCE_OSM,
          paint: {
            'circle-radius': 8,
            'circle-color': '#3b82f6',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#1d4ed8'
          }
        });
      }

      // Ajouter les interactions pour les trois couches
      setupMapInteractions(LAYER_PLAINE_COMMUNE);
      setupMapInteractions(LAYER_PAV93);
      setupMapInteractions(LAYER_OSM);
      
      pointsAdded.current = true;
      onMapReady?.();
    };

    const setupMapInteractions = (layerId: string) => {
      if (!map.current) return;

      // Curseur pointer au survol
      map.current.on('mouseenter', layerId, () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', layerId, () => {
        map.current!.getCanvas().style.cursor = '';
      });

      // Popup au clic
      map.current.on('click', layerId, (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        const props = feature.properties;

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(createPopupContent(props))
          .addTo(map.current!);
      });
    };

    if (map.current.isStyleLoaded()) {
      addPointsToMap();
    } else {
      map.current.on('load', addPointsToMap);
    }
  }, [pointsPlaineCommune, pointsPav93, pointsOsm, onMapReady]);

  // Gérer la visibilité des couches
  useEffect(() => {
    if (!map.current || !pointsAdded.current) return;

    if (map.current.getLayer(LAYER_PLAINE_COMMUNE)) {
      map.current.setLayoutProperty(
        LAYER_PLAINE_COMMUNE,
        'visibility',
        visibility.plaineCommune ? 'visible' : 'none'
      );
    }

    if (map.current.getLayer(LAYER_PAV93)) {
      map.current.setLayoutProperty(
        LAYER_PAV93,
        'visibility',
        visibility.pav93 ? 'visible' : 'none'
      );
    }

    if (map.current.getLayer(LAYER_OSM)) {
      map.current.setLayoutProperty(
        LAYER_OSM,
        'visibility',
        visibility.osm ? 'visible' : 'none'
      );
    }
  }, [visibility]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}

function createPopupContent(props: any): string {
  return `
    <div style="padding: 8px; max-width: 250px;">
      <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 14px;">
        ${props?.nom || 'Point de collecte'}
      </h3>
      <p style="margin: 4px 0; font-size: 13px;">
        <strong>Adresse:</strong> ${props?.adresse || 'Non renseigné'}
      </p>
      <p style="margin: 4px 0; font-size: 13px;">
        <strong>Code postal:</strong> ${props?.code_postal || 'Non renseigné'}
      </p>
      <p style="margin: 4px 0; font-size: 13px;">
        <strong>Ville:</strong> ${props?.ville || 'Non renseigné'}
      </p>
    </div>
  `;
}
