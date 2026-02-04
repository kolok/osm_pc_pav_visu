# Comparateur de Points d'Apport Volontaire Verre

Application web permettant de visualiser et comparer les points d'apport volontaire (PAV) de verre entre différentes sources de données sur le territoire de Plaine Commune (Seine-Saint-Denis, 93).

## Objectif

L'objectif de ce projet est de faciliter la comparaison des données de localisation des conteneurs à verre entre plusieurs sources :

- **Données officielles** de collectivités (Plaine Commune)
- **Données collaboratives** (OpenStreetMap)
- **Données nationales** (Que Faire de Mes Objets et Déchets - CITEO)

Cette comparaison permet d'identifier les écarts entre les bases de données et d'améliorer la qualité des données ouvertes.

## Sources de données

| Source | Description | Fichier | URL | Points |
|--------|-------------|---------|-----|--------|
| **Plaine Commune** | Open data de l'établissement public territorial | `2025-02-18-200057867-points-apport-volontaire-verre-plainecommune.csv` | https://explore.data.gouv.fr/fr/datasets/65b237f21850d941e2ebcccc/#/resources/3f100f9c-f896-4f7a-a57a-5635d3943613 | ~638 |
| **OpenStreetMap** | Données collaboratives extraites via Overpass Turbo | `osm_pav_verre.csv` | https://overpass-turbo.eu/ |  ~30 |
| **QFDMOD** | Base nationale "Que Faire de Mes Objets et Déchets" | `pav_verre_93.csv` | https://quefairedemesdechets.fr/ | ~13 |

## Fonctionnalités

- Affichage des points de collecte sur une carte interactive
- Différenciation visuelle par source (couleurs distinctes)
- Activation/désactivation de chaque couche via des cases à cocher
- Popup d'information au clic sur chaque point
- Chargement performant des données CSV avec DuckDB

## Technologies

- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **MapLibre GL** - Rendu cartographique
- **DuckDB WASM** - Requêtage SQL des fichiers CSV dans le navigateur
- **Parcel** - Bundler et serveur de développement

## Installation et lancement

### Prérequis

- Node.js >= 18
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Lancement en développement

```bash
npm start
```

L'application sera accessible sur [http://localhost:1234](http://localhost:1234)

### Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## Structure du projet

```
osm_tests/
├── inputs/                    # Fichiers de données
│   ├── *-plainecommune.csv    # Données Plaine Commune
│   ├── pav_verre_93.csv       # Données CITEO
│   ├── osm_pav_verre.csv      # Données OSM (CSV)
│   └── osm.geojson            # Données OSM (GeoJSON original)
├── src/
│   ├── components/
│   │   ├── GlassPointsMap.tsx # Composant carte MapLibre
│   │   ├── Legend.tsx         # Légende avec toggles
│   │   ├── Header.tsx         # En-tête avec compteur
│   │   ├── LoadingOverlay.tsx # Écran de chargement
│   │   └── ErrorMessage.tsx   # Affichage des erreurs
│   ├── hooks/
│   │   └── useDuckDB.ts       # Hook de chargement CSV via DuckDB
│   ├── types/
│   │   └── index.ts           # Types TypeScript (GlassPoint, etc.)
│   ├── utils/
│   │   └── geojson.ts         # Conversion vers GeoJSON
│   ├── App.tsx                # Composant principal
│   └── index.tsx              # Point d'entrée React
├── script/
│   └── extract_pav_plaine-commune.sql  # Requête SQL d'extraction
└── package.json
```

## Implémentation

### Chargement des données

Les fichiers CSV sont chargés via **DuckDB WASM**, une base de données analytique compilée en WebAssembly. Cela permet d'exécuter des requêtes SQL directement dans le navigateur :

```typescript
// Hook useDuckDB.ts
const result = await conn.query(`
  SELECT identifiant_unique, nom, latitude, longitude, adresse, code_postal, ville
  FROM points
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL
`);
```

### Format de données unifié

Toutes les sources sont normalisées vers un format CSV commun :

```csv
identifiant_unique,nom,latitude,longitude,adresse,code_postal,ville
```

### Affichage cartographique

La carte utilise **MapLibre GL JS** avec un fond de carte CartoDB Positron. Chaque source de données est représentée par une couche GeoJSON distincte :

| Couche | Couleur | Code hexadécimal |
|--------|---------|------------------|
| Plaine Commune | Vert | `#22c55e` |
| CITEO | Orange | `#f97316` |
| OpenStreetMap | Bleu | `#3b82f6` |

### Gestion de la visibilité

La visibilité des couches est gérée via l'API MapLibre `setLayoutProperty` :

```typescript
map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
```

## Extraction des données OSM

Les données OpenStreetMap peuvent être extraites via [Overpass Turbo](https://overpass-turbo.eu/) avec la requête suivante :

```overpass
[out:json][timeout:25];
area["name"="Plaine Commune"]->.searchArea;
(
  node["amenity"="recycling"]["recycling:glass"="yes"](area.searchArea);
);
out body;
>;
out skel qt;
```

## Licence

Les données sont issues de sources ouvertes :
- Plaine Commune : Licence Ouverte / Open Licence
- OpenStreetMap : ODbL (Open Database License)
- CITEO : Licence Ouverte
