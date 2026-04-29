# Quick Reference: QLD Electoral Boundary Data

## Current Status
✅ **WORKING** - Real electoral boundaries from Queensland Government

## Data Files

| File | Size | Purpose | Source |
|------|------|---------|--------|
| `qld-income.json` | 11MB | Electoral boundaries + income data | Qld Gov + ABS |
| `qld-electorates-current.geojson` | 11MB | Current boundaries (2017) | Qld Gov ArcGIS |
| `qld-electorates-proposed.geojson` | 42B | Proposed boundaries (empty) | Qld Gov ArcGIS |

## Access

**Live Data:** http://localhost:8081/data/qld-income.json
**Component:** `QldRedistributionPage.vue`
**Map Library:** Leaflet

## Update Data

```bash
# One-command update:
cd /home/seethbotsite/frontend/data && bash fetch-boundaries.sh && node generate-income-data.js && cp *.json *.geojson ../public/data/ && cd ../../.. && docker compose build server && docker compose up -d server --force-recreate
```

## Data Sources

- **Boundaries:** Queensland Government ArcGIS Server
  - https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdministrativeBoundaries/MapServer
- **Income:** ABS Census 2021

## Troubleshooting

### Map not loading?
```bash
# Check data endpoint
curl -I http://localhost:8081/data/qld-income.json

# Check container logs
docker logs seethbot-server --tail 50

# Restart container
cd /home/seethbotsite && docker compose restart server
```

### Electorates not showing?
- Check browser console for JavaScript errors
- Verify case-insensitive matching in component
- Ensure electorate names match (uppercase in data)

### Data too slow?
- Consider GeoJSON simplification
- Enable gzip compression in Express
- Use TopoJSON format instead

## Key Electorates (Task)

✅ = In current boundaries
⚠️ = New seat (not in 2017 boundaries)

1. ✅ Gaven
2. ✅ Moggill
3. ✅ Mount Ommaney
4. ✅ Woodridge
5. ✅ Ashgrove (as "COOPER")
6. ✅ Broadwater
7. ⚠️ Caboolture (NEW - not in current data)
8. ✅ Greenbank (as "JORDAN")
9. ✅ Hinchinbrook
10. ✅ Inala
11. ✅ Indooroopilly (as "MAIWAR")
12. ✅ Mansfield
13. ✅ Mulgrave
14. ✅ Nicklin
15. ⚠️ Springfield (NEW - not in current data)

## Contact

- **Issue:** Check `IMPLEMENTATION_SUMMARY.md` for full details
- **Source Code:** `/home/seethbotsite/frontend/components/pages/QldRedistributionPage.vue`
- **Data Scripts:** `/home/seethbotsite/frontend/data/`
