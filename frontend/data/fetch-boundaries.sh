#!/bin/bash
# Script to fetch QLD electoral boundaries from Queensland Government ArcGIS Server
# This downloads real boundary data for current and proposed electorates

set -e

DATA_DIR="/home/seethbotsite/frontend/data"
mkdir -p "$DATA_DIR"

echo "Fetching current QLD state electoral boundaries..."
# Layer 5 = State electorate (current)
curl -s "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdministrativeBoundaries/MapServer/5/query?where=1%3D1&outFields=*&f=geoJSON&returnGeometry=true&outSR=4326" \
  -o "$DATA_DIR/qld-electorates-current.geojson"

echo "Fetching proposed/future QLD state electoral boundaries..."
# Layer 9 = State electorate future (proposed redistribution)
curl -s "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdministrativeBoundaries/MapServer/9/query?where=1%3D1&outFields=*&f=geoJSON&returnGeometry=true&outSR=4326" \
  -o "$DATA_DIR/qld-electorates-proposed.geojson"

echo "Boundary data fetched successfully!"
echo "Files created:"
echo "  - $DATA_DIR/qld-electorates-current.geojson"
echo "  - $DATA_DIR/qld-electorates-proposed.geojson"
