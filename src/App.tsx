import { useState, useCallback } from 'react';
import { useDuckDB } from './hooks/useDuckDB';
import {
  Header,
  Legend,
  LoadingOverlay,
  ErrorMessage,
  GlassPointsMap
} from './components';

// Import des fichiers CSV via Parcel
import csvUrlPlaineCommune from 'url:../inputs/2025-02-18-200057867-points-apport-volontaire-verre-plainecommune.csv';
import csvUrlPav93 from 'url:../inputs/pav_verre_93.csv';
import csvUrlOsm from 'url:../inputs/osm_pav_verre.csv';

interface LayerVisibility {
  plaineCommune: boolean;
  pav93: boolean;
  osm: boolean;
}

function App() {
  const { points: pointsPlaineCommune, loading: loadingPlaineCommune, error: errorPlaineCommune } = useDuckDB(csvUrlPlaineCommune);
  const { points: pointsPav93, loading: loadingPav93, error: errorPav93 } = useDuckDB(csvUrlPav93);
  const { points: pointsOsm, loading: loadingOsm, error: errorOsm } = useDuckDB(csvUrlOsm);
  const [mapReady, setMapReady] = useState(false);
  const [visibility, setVisibility] = useState<LayerVisibility>({
    plaineCommune: true,
    pav93: true,
    osm: true
  });

  const dataLoading = loadingPlaineCommune || loadingPav93 || loadingOsm;
  const error = errorPlaineCommune || errorPav93 || errorOsm;
  const totalPoints = pointsPlaineCommune.length + pointsPav93.length + pointsOsm.length;
  const isLoading = dataLoading || (totalPoints > 0 && !mapReady);

  const handleToggle = useCallback((id: string) => {
    setVisibility(prev => ({
      ...prev,
      [id]: !prev[id as keyof LayerVisibility]
    }));
  }, []);

  const legendItems = [
    {
      id: 'plaineCommune',
      color: '#22c55e',
      borderColor: '#166534',
      label: 'Plaine Commune',
      visible: visibility.plaineCommune
    },
    {
      id: 'pav93',
      color: '#f97316',
      borderColor: '#c2410c',
      label: 'PAV Verre 93 (CITEO)',
      visible: visibility.pav93
    },
    {
      id: 'osm',
      color: '#3b82f6',
      borderColor: '#1d4ed8',
      label: 'OpenStreetMap',
      visible: visibility.osm
    }
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GlassPointsMap 
        pointsPlaineCommune={pointsPlaineCommune}
        pointsPav93={pointsPav93}
        pointsOsm={pointsOsm}
        visibility={visibility}
        onMapReady={() => setMapReady(true)}
      />

      <Header
        title="Points d'apport volontaire - Verre"
        subtitle="Plaine Commune - Seine-Saint-Denis"
        pointCount={totalPoints}
        loading={isLoading}
        error={!!error}
      />

      {isLoading && (
        <LoadingOverlay message="Chargement des données avec DuckDB..." />
      )}

      {error && <ErrorMessage message={error} />}

      <Legend items={legendItems} onToggle={handleToggle} />
    </div>
  );
}

export default App;
