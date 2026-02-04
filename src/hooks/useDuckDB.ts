import { useState, useEffect } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { GlassPoint } from '../types';

interface UseDuckDBResult {
  points: GlassPoint[];
  loading: boolean;
  error: string | null;
}

export function useDuckDB(csvUrl: string): UseDuckDBResult {
  const [points, setPoints] = useState<GlassPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Initialiser DuckDB
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
        );

        const worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(worker_url);

        // Charger le fichier CSV
        const csvResponse = await fetch(csvUrl);
        const csvText = await csvResponse.text();

        // Enregistrer le CSV dans DuckDB
        await db.registerFileText('points.csv', csvText);

        const conn = await db.connect();

        // Créer une table à partir du CSV
        await conn.query(`
          CREATE TABLE points AS 
          SELECT * FROM read_csv_auto('points.csv', delim=',', header=true)
        `);

        // Requêter les données
        const result = await conn.query(`
          SELECT 
            identifiant_unique,
            nom,
            latitude,
            longitude,
            adresse,
            code_postal,
            ville
          FROM points
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        `);

        const loadedPoints: GlassPoint[] = result.toArray().map((row: any) => ({
          identifiant_unique: String(row.identifiant_unique || ''),
          nom: String(row.nom || ''),
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          adresse: String(row.adresse || ''),
          code_postal: String(row.code_postal || ''),
          ville: String(row.ville || '')
        }));

        await conn.close();
        await db.terminate();

        if (isMounted) {
          setPoints(loadedPoints);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [csvUrl]);

  return { points, loading, error };
}
