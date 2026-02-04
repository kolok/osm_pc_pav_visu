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
  const mapLoaded = useRef(false);
  const interactionsSetup = useRef<Set<string>>(new Set());

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

    map.current.on('load', () => {
      mapLoaded.current = true;
    });

    return () => {
      map.current?.remove();
      map.current = null;
      mapLoaded.current = false;
      interactionsSetup.current.clear();
    };
  }, [config]);

  // Fonction pour ajouter/mettre à jour une couche
  const updateLayer = (
    sourceId: string,
    layerId: string,
    points: GlassPoint[],
    color: string,
    strokeColor: string
  ) => {
    if (!map.current || !mapLoaded.current) return;

    const source = map.current.getSource(sourceId) as maplibregl.GeoJSONSource;
    const geojson = pointsToGeoJSON(points);

    if (source) {
      // Mettre à jour les données existantes
      source.setData(geojson);
    } else if (points.length > 0) {
      // Créer la source et la couche
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geojson
      });
      map.current.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 8,
          'circle-color': color,
          'circle-stroke-width': 2,
          'circle-stroke-color': strokeColor
        }
      });

      // Configurer les interactions une seule fois
      if (!interactionsSetup.current.has(layerId)) {
        setupMapInteractions(layerId);
        interactionsSetup.current.add(layerId);
      }
    }
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

  // Ajouter/mettre à jour les points à la carte
  useEffect(() => {
    if (!map.current) return;

    const addAllLayers = () => {
      updateLayer(SOURCE_PLAINE_COMMUNE, LAYER_PLAINE_COMMUNE, pointsPlaineCommune, '#22c55e', '#166534');
      updateLayer(SOURCE_PAV93, LAYER_PAV93, pointsPav93, '#f97316', '#c2410c');
      updateLayer(SOURCE_OSM, LAYER_OSM, pointsOsm, '#3b82f6', '#1d4ed8');
      
      const totalPoints = pointsPlaineCommune.length + pointsPav93.length + pointsOsm.length;
      if (totalPoints > 0) {
        onMapReady?.();
      }
    };

    if (mapLoaded.current) {
      addAllLayers();
    } else {
      map.current.on('load', addAllLayers);
    }
  }, [pointsPlaineCommune, pointsPav93, pointsOsm, onMapReady]);

  // Gérer la visibilité des couches
  useEffect(() => {
    if (!map.current || !mapLoaded.current) return;

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
