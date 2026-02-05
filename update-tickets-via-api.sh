#!/bin/bash

API_KEY="sk_LUwqG6ZqsUhOhcCfPQanuhi1lWSlz7ci"
BASE_URL="http://localhost:8081/api"

echo "Updating tickets via API..."

# Ticket 115: Settings - Complete
curl -X PATCH "$BASE_URL/tickets/115" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "description": "Settings page already exists and is fully functional with hearts, mold, and various site configuration options."}'

echo -e "\n"

# Ticket 117: Fishing game - Complete
curl -X PATCH "$BASE_URL/tickets/117" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "description": "Fishing game already exists and is fully functional with 3D graphics, multiple fish types, and scoring system."}'

echo -e "\n"

# Ticket 118: bunny - Declined
curl -X PATCH "$BASE_URL/tickets/118" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "declined", "description": "Ticket appears to be a joke or non-serious request. No meaningful implementation provided."}'

echo -e "\n"

# Ticket 119: orange juice - Declined
curl -X PATCH "$BASE_URL/tickets/119" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "declined", "description": "Ticket appears to be a joke or non-serious request. No meaningful implementation provided."}'

echo -e "\n"

# Ticket 121: Car page - Complete
curl -X PATCH "$BASE_URL/tickets/121" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "description": "Created CarPage.vue - a car-sized display page with speedometer, fuel gauge, weather, time, and large touch-friendly buttons suitable for in-car displays. Added route at /car."}'

echo -e "\n"
echo "All tickets updated via API!"
