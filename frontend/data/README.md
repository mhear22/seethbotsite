# QLD Electoral Boundary Data

This directory contains real Queensland state electoral boundary data for the QLD Electoral Redistribution page.

## Files

### qld-income.json
- **Purpose**: Electorate boundaries with median household income data
- **Source**: Queensland Government ArcGIS Server (boundaries) + ABS Census 2021 (income)
- **Format**: GeoJSON FeatureCollection
- **Size**: ~11MB
- **Properties per feature**:
  - `name`: Electorate name (e.g., "ALGESTER")
  - `median_income`: Median household income in AUD
  - `electorate_id`: Unique identifier

### qld-electorates-current.geojson
- **Purpose**: Current state electoral boundaries (effective since 2017)
- **Source**: Queensland Government ArcGIS Server
- **Layer**: State electorate (Layer 5)
- **API**: https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdministrativeBoundaries/MapServer/5
- **Size**: ~11MB
- **Properties per feature**:
  - `adminareaname`: Electorate name
  - `id`: Unique identifier
  - `date_effective`: When boundary became effective (Unix timestamp)

### qld-electorates-proposed.geojson
- **Purpose**: Proposed redistribution boundaries (2026 proposal)
- **Source**: Queensland Government ArcGIS Server
- **Layer**: State electorate future (Layer 9)
- **Status**: Currently empty - redistribution proposal not yet in official database
- **Note**: The 2026 redistribution is still a proposal and may not be available in the official government spatial database yet

## Update Instructions

To refresh the boundary data from the Queensland Government source:

```bash
cd /home/seethbotsite/frontend/data
bash fetch-boundaries.sh
node generate-income-data.js
cp *.json *.geojson /home/seethbotsite/frontend/public/data/
```

Then rebuild the Docker container:

```bash
cd /home/seethbotsite
docker compose build server
docker compose up -d server --force-recreate
```

## Data Sources

- **Queensland Government Spatial Catalogue**: http://qldspatial.information.qld.gov.au/catalogue/
- **ArcGIS REST API**: https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdministrativeBoundaries/MapServer
- **ABS Census 2021**: https://www.abs.gov.au/census

## License

- **Boundaries**: © State of Queensland (Department of Resources) 2024
- **Usage**: Free for public information purposes with attribution

## Attribution

When using this data, please attribute:
> Administrative Boundaries © Geoscape Australia licensed by the Commonwealth of Australia under Creative Commons Attribution 4.0 International licence (CC BY 4.0).
