<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  BarChart3, Scale, Home, Landmark, Ruler, Link as LinkIcon, ExternalLink, Map as MapIcon, Info, Calendar,
  Users, AlertTriangle, Sparkles, XCircle, PlusCircle, Clock, User, Wrench, ThumbsUp, Lightbulb, PenLine, 
  Quote, PersonStanding, Vote, Gavel, MessageCircleWarning, FileWarning, MapPin
} from 'lucide-vue-next'

const store = useAppStore()

const selectedParty = ref<string>('all')
const selectedMap = ref<any>(null)
const selectedElectorate = ref<any>(null)
const boothData = ref<Record<string, any[]> | null>(null)
const boothLoading = ref(false)
const searchQuery = ref<string>('')

// Leaflet map state
const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const incomeLayer = ref<L.GeoJSON | null>(null)
const electionLayer = ref<L.GeoJSON | null>(null)
const mapMode = ref<'base' | 'income' | 'election'>('base')
const incomeData = ref<any>(null)
const incomeLoading = ref(false)
const electionLoading = ref(false)
const mapExpanded = ref(false)
const mapZoomed = ref(false)

// Income color scale function (green -> yellow -> red)
const getIncomeColor = (income: number): string => {
  const minIncome = 35000
  const maxIncome = 95000
  const normalized = Math.max(0, Math.min(1, (income - minIncome) / (maxIncome - minIncome)))
  
  if (normalized < 0.5) {
    // Green to Yellow
    const t = normalized * 2
    const r = Math.round(76 + (255 - 76) * t)
    const g = Math.round(175 + (204 - 175) * t)
    const b = Math.round(80 - 80 * t)
    return `rgb(${r}, ${g}, ${b})`
  } else {
    // Yellow to Red
    const t = (normalized - 0.5) * 2
    const r = 255
    const g = Math.round(204 - 140 * t)
    const b = Math.round(0)
    return `rgb(${r}, ${g}, ${b})`
  }
}

// Initialize Leaflet map
const initMap = () => {
  if (!mapContainer.value || map.value) return
  
  map.value = L.map(mapContainer.value).setView([-20.5, 145], 6)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map.value)
}

// Load income data
const loadIncomeData = async () => {
  if (incomeData.value) return incomeData.value
  incomeLoading.value = true
  try {
    const response = await fetch('/data/qld-income.json')
    incomeData.value = await response.json()
    return incomeData.value
  } catch (e) {
    console.error('Failed to load income data:', e)
    return null
  } finally {
    incomeLoading.value = false
  }
}

// Show income overlay
const showIncomeOverlay = async () => {
  if (!map.value) return
  
  const data = await loadIncomeData()
  if (!data) return
  
  // Remove existing layer
  if (incomeLayer.value) {
    map.value.removeLayer(incomeLayer.value)
  }
  
  incomeLayer.value = L.geoJSON(data, {
    style: (feature) => ({
      fillColor: getIncomeColor(feature?.properties?.median_income || 50000),
      weight: 1,
      opacity: 0.8,
      color: 'rgba(0,0,0,0.3)',
      fillOpacity: 0.6
    }),
    onEachFeature: (feature, layer) => {
      const name = feature.properties?.name || 'Unknown'
      const income = feature.properties?.median_income || 0
      // Convert name to title case for display
      const displayName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
      layer.bindPopup(`
        <div style="font-family: system-ui; min-width: 150px;">
          <strong style="font-size: 1.1em;">${displayName}</strong><br>
          <span style="color: #666;">Median Household Income:</span><br>
          <strong style="font-size: 1.2em; color: ${getIncomeColor(income)};">$${income.toLocaleString()}</strong>
        </div>
      `)
      layer.on({
        mouseover: (e) => {
          const layer = e.target
          layer.setStyle({ weight: 3, fillOpacity: 0.8 })
        },
        mouseout: (e) => {
          if (incomeLayer.value) incomeLayer.value.resetStyle(e.target)
        }
      })
    }
  }).addTo(map.value)
}

// Hide income overlay
const hideIncomeOverlay = () => {
  if (incomeLayer.value && map.value) {
    map.value.removeLayer(incomeLayer.value)
    incomeLayer.value = null
  }
}

// Show election results overlay with donut popups
const showElectionOverlay = async () => {
  if (!map.value) return
  
  electionLoading.value = true
  try {
    // Load income data which has electorate boundaries
    const data = await loadIncomeData()
    if (!data) return
    
    // Remove existing layer
    if (electionLayer.value) {
      map.value.removeLayer(electionLayer.value)
    }
    
    electionLayer.value = L.geoJSON(data, {
      style: (feature) => {
        const name = feature?.properties?.name || ''
        // Match case-insensitive and also check formerName
        const elect = electorates.find(e => 
          e.name.toUpperCase() === name.toUpperCase() ||
          (e.formerName && e.formerName.toUpperCase() === name.toUpperCase())
        )
        let fillColor = '#718096'
        if (elect) {
          switch (elect.party) {
            case 'Labor': fillColor = '#c53030'; break
            case 'LNP': fillColor = '#2b6cb0'; break
            case 'Greens': fillColor = '#2f855a'; break
            case 'KAP': fillColor = '#b78126'; break
            default: fillColor = '#718096'
          }
        }
        return {
          fillColor,
          weight: 1,
          opacity: 0.8,
          color: 'rgba(0,0,0,0.4)',
          fillOpacity: 0.5
        }
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || 'Unknown'
        // Match case-insensitive and also check formerName
        const elect = electorates.find(e => 
          e.name.toUpperCase() === name.toUpperCase() ||
          (e.formerName && e.formerName.toUpperCase() === name.toUpperCase())
        )
        
        layer.on('click', async () => {
          if (!elect) {
            // Convert name to title case for display
            const displayName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
            layer.bindPopup(`<div style="font-family: system-ui; padding: 8px;"><strong>${displayName}</strong><br>No election data available</div>`).openPopup()
            return
          }
          
          // Load booth data for this electorate
          const data = await loadBoothData()
          let booths = data?.[elect.name]
          if (!booths && elect.formerName) {
            booths = data?.[elect.formerName]
          }
          
          // Build popup content with donut chart
          const votes = elect.votes
          let popupContent = `
            <div style="font-family: system-ui; min-width: 200px; padding: 12px;">
              <strong style="font-size: 1.1em;">${elect.name}</strong>
              <span style="display: inline-block; padding: 2px 6px; border-radius: 8px; font-size: 0.75rem; background: rgba(0,0,0,0.1); margin-left: 6px;">${elect.party}</span>
              <br><br>
              <div style="display: flex; height: 12px; border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
          `
          
          if (votes) {
            const colors: Record<string, string> = {
              ALP: '#c53030', LNP: '#2b6cb0', GRN: '#2f855a',
              KAP: '#b78126', ONP: '#c05621', IND: '#536471'
            }
            for (const [party, pct] of Object.entries(votes)) {
              if (pct && pct > 0) {
                popupContent += `<div style="width: ${pct}%; background: ${colors[party] || '#718096'}; min-width: 2px;"></div>`
              }
            }
          }
          popupContent += `</div>`
          
          if (votes) {
            popupContent += `<div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.8rem;">`
            const partyOrder = ['ALP', 'LNP', 'GRN', 'KAP', 'ONP', 'IND']
            const partyNames: Record<string, string> = { ALP: 'Labor', LNP: 'LNP', GRN: 'Greens', KAP: 'KAP', ONP: 'One Nation', IND: 'Ind' }
            for (const party of partyOrder) {
              const pct = votes[party]
              if (pct && pct > 0) {
                const colors: Record<string, string> = {
                  ALP: '#c53030', LNP: '#2b6cb0', GRN: '#2f855a',
                  KAP: '#b78126', ONP: '#c05621', IND: '#536471'
                }
                popupContent += `<span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 2px; background: ${colors[party]};"></span>${partyNames[party]}: ${pct}%</span>`
              }
            }
            popupContent += `</div>`
          }
          
          popupContent += `</div>`
          layer.bindPopup(popupContent, { maxWidth: 280 }).openPopup()
        })
        
        layer.on({
          mouseover: (e) => {
            const layer = e.target
            layer.setStyle({ weight: 2, fillOpacity: 0.7 })
          },
          mouseout: (e) => {
            if (electionLayer.value) electionLayer.value.resetStyle(e.target)
          }
        })
      }
    }).addTo(map.value)
  } catch (e) {
    console.error('Failed to load election overlay:', e)
  } finally {
    electionLoading.value = false
  }
}

// Hide election overlay
const hideElectionOverlay = () => {
  if (electionLayer.value && map.value) {
    map.value.removeLayer(electionLayer.value)
    electionLayer.value = null
  }
}

// Watch for map mode changes
watch(mapMode, (newMode) => {
  if (newMode === 'income') {
    hideElectionOverlay()
    showIncomeOverlay()
  } else if (newMode === 'election') {
    hideIncomeOverlay()
    showElectionOverlay()
  } else {
    hideIncomeOverlay()
    hideElectionOverlay()
  }
})

onMounted(() => {
  // Override body background for this page
  const bg = '#8B1A1A'
  document.body.style.background = bg
  document.body.style.setProperty('--theme-background', bg)
  document.body.classList.add('qld-page-active')
  // Hide breadcrumbs
  const bc = document.querySelector('.breadcrumbs') as HTMLElement
  if (bc) bc.style.display = 'none'
  initMap()
})

onUnmounted(() => {
  // Restore body background
  document.body.style.background = ''
  document.body.style.removeProperty('--theme-background')
  document.body.classList.remove('qld-page-active')
  const bc = document.querySelector('.breadcrumbs') as HTMLElement
  if (bc) bc.style.display = ''
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// Party colors for donut charts
const partyColors: Record<string, string> = {
  ALP: '#e53e3e',
  LNP: '#3182ce',
  GRN: '#38a169',
  ONP: '#dd6b20',
  KAP: '#d69e2e',
  IND: '#718096'
}

// Load booth data on demand
const loadBoothData = async () => {
  if (boothData.value) return boothData.value
  boothLoading.value = true
  try {
    const response = await fetch('/data/booth-data-2024.json')
    boothData.value = await response.json()
    return boothData.value
  } catch (e) {
    console.error('Failed to load booth data:', e)
    return null
  } finally {
    boothLoading.value = false
  }
}

// Helper to get booth data (used by map overlay)
const getBoothData = loadBoothData

// Open booth modal for an electorate
const openBoothModal = async (electorate: any) => {
  selectedElectorate.value = { ...electorate, booths: null }
  const data = await loadBoothData()
  if (!data) return
  
  // Try matching by name first, then formerName
  let booths = data[electorate.name]
  if (!booths && electorate.formerName) {
    booths = data[electorate.formerName]
  }
  selectedElectorate.value = { ...electorate, booths: booths || [] }
}

// Generate SVG donut chart segments
const getDonutSegments = (percentages: Record<string, number>) => {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const segments: { party: string; color: string; dash: string; dashOffset: string }[] = []
  let currentOffset = 0
  
  const partyOrder = ['ALP', 'LNP', 'GRN', 'KAP', 'ONP', 'IND']
  
  for (const party of partyOrder) {
    const pct = percentages[party]
    if (!pct || pct <= 0) continue
    
    const segmentLength = (pct / 100) * circumference
    segments.push({
      party,
      color: partyColors[party] || '#718096',
      dash: `${segmentLength} ${circumference - segmentLength}`,
      dashOffset: `${-currentOffset}`
    })
    currentOffset += segmentLength
  }
  
  return segments
}

// 2024 QLD Election margins data (null = marginal seat, <= 10%)
const margins2024: Record<string, number | null> = {
  'Algester': 15.2,
  'Annerley': 18.5,
  'Ashgrove': 11.2, // Labor (formerly Cooper)
  'Aspley': 0.04, // Labor won by 31 votes
  'Barron River': null,
  'Beaudesert': 11.2,
  'Beenleigh': null,
  'Brisbane Central': 8.8, // Labor (formerly McConnel)
  'Broadwater': 15.7,
  'Buderim': null,
  'Bulimba': 16.8,
  'Bundaberg': null,
  'Burdekin': 14.5,
  'Burnett': 22.3,
  'Cairns': null,
  'Callide': 46.4,
  'Caloundra': 18.9,
  'Capalaba': 12.7,
  'Carindale': null,
  'Clayfield': null,
  'Cleveland': null,
  'Coolum': 13.4,
  'Condamine': 19.2,
  'Cook': null,
  'Currumbin': 17.6,
  'Deception Bay': null,
  'Eight Mile Plains': null,
  'Everton': 14.3,
  'Ferny Grove': null,
  'Flinders': 8.9,
  'Gaven': null,
  'Gladstone': null,
  'Glass House': null,
  'Gordon': 24.5,
  'Greenbank': 19.8,
  'Greenslopes': 9.8, // Labor
  'Gregory': 35.7,
  'Gympie': 16.2,
  'Hervey Bay': 13.8,
  'Hinchinbrook': null,
  'Inala': 28.0,
  'Indooroopilly': 3.4, // Greens (formerly Maiwar)
  'Ipswich': null,
  'Ipswich West': null,
  'Kawana': null,
  'Keppel': null,
  'Kurwongbah': null,
  'Labrador': 11.5,
  'Lockyer': 21.3,
  'Logan': null,
  'Lytton': 14.6,
  'Mackay': null,
  'Mansfield': null,
  'Maroochydore': 15.3,
  'Marsden': 17.4,
  'Maryborough': null,
  'Mermaid Beach': 26.2,
  'Mirani': null,
  'Moggill': null,
  'Morayfield': null,
  'Mount Ommaney': null,
  'Mudgeeraba': 27.8,
  'Mulgrave': null,
  'Mundingburra': 18.7,
  'Murrumba': null,
  'Nambour': null,
  'Nanango': 45.8,
  'Noosa': 12.9,
  'Nudgee': null,
  'Oxenford': 15.1,
  'Pimpama': 13.7,
  'Pine Rivers': null,
  'Pumicestone': null,
  'Redbank': 27.6,
  'Redcliffe': null,
  'Redlands': null,
  'Rockhampton': null,
  'Sandgate': null,
  'South Brisbane': 6.1, // Labor gain from Greens
  'Southern Downs': 37.2,
  'Southport': 14.1,
  'Springwood': null,
  'Stafford': 10.6,
  'Surfers Paradise': 18.4,
  'Thuringowa': null,
  'Toowoomba North': 16.5,
  'Toowoomba South': 19.8,
  'Townsville': null,
  'Warrego': 55.6,
  'Whitsunday': 14.2,
  'Woodridge': 22.1
}

const electorates = [
  // ABOLISHED
  { name: 'Hill', formerName: null, party: 'KAP', status: 'abolished', added: [], removed: [], hasChanges: false, note: 'Absorbed into Flinders, Hinchinbrook, Mulgrave', votes: null },
  { name: 'Stretton', formerName: null, party: 'Labor', status: 'abolished', added: [], removed: [], hasChanges: false, note: 'Absorbed into Eight Mile Plains, Algester', votes: null },
  // NEW
  { name: 'Caboolture', formerName: null, party: 'LNP', status: 'new', added: ['🔴 Caboolture', '🔴 Bellmere', '🔴 Moodlu', '🔴 Elimbah', '🔴 Wamuran', '🔴 Woodford', "🔴 D'Aguilar", '🔴 Waraba', "🔴 Campbell's Pocket", '🔴 Mount Mee', '🔴 Corymbia', '🔴 Wagtail Grove'], removed: [], hasChanges: true, votes: null },
  { name: 'Springfield', formerName: null, party: 'Labor', status: 'new', added: ['🔴 Springfield', '🔴 Springfield Lakes', '🔴 Springfield Central', '🔴 Brookwater', '🔴 Augustine Heights', '🔴 Camira', '🔴 Gailes', '🔴 Bellbird Park', '🔴 Carole Park', '🔴 Spring Mountain'], removed: [], hasChanges: true, votes: null },
  // CHANGED ELECTORATES
  { name: 'Algester', formerName: null, party: 'Labor', added: ['🔴 Stretton', '🔴 Karawatha', '🔴 Drewvale', '🔴 Calamvale', '🔴 Coopers Plains (west)', '🔴 Heathwood', '🔴 Forest Lake'], removed: ['🔴 Hillcrest', '🔴 Forestdale', '🔴 Browns Plains', '🔴 Regents Park'], hasChanges: true, votes: { ALP: 52, LNP: 30, GRN: 8, ONP: 5, IND: 5 } },
  { name: 'Annerley', formerName: 'Miller', party: 'Labor', added: ['🔴 Annerley', '🔴 Nathan', '🔴 Salisbury', '🔴 Moorooka', '🔴 Rocklea'], removed: ['🔵 Chelmer', '🔵 Graceville', '🔵 Sherwood'], hasChanges: true, votes: { ALP: 50, LNP: 25, GRN: 15, ONP: 5, IND: 5 } },
  { name: 'Ashgrove', formerName: 'Cooper', party: 'Labor', added: ['🔵 Mount Coot-tha', '🔵 Bardon', '🔵 Petrie Terrace', '🔵 Ashgrove', '🔵 Jollys Lookout'], removed: [], hasChanges: true, votes: { ALP: 37.2, LNP: 34.2, GRN: 25.5, ONP: 2.1, FF: 1.0 } },
  { name: 'Aspley', formerName: null, party: 'Labor', added: ['🔵 Chermside (north)'], removed: ['🔵 Geebung', '🔵 McDowall', '🔵 Albany Creek'], hasChanges: true, votes: { ALP: 39.1, LNP: 43.9, GRN: 10.7, ONP: 4.3, FF: 2.0 } },
  { name: 'Barron River', formerName: null, party: 'LNP', added: ['🔵 Brinsmead', '🔵 Aeroglen'], removed: ['🔴 Kuranda', '🔴 Speewah', '🔴 Mona Mona', '🔴 Koah'], hasChanges: true, votes: { ALP: 35, LNP: 42, GRN: 8, ONP: 8, IND: 7 } },
  { name: 'Beaudesert', formerName: 'Scenic Rim', party: 'LNP', added: [], removed: ['🔴 Goolman', '🔴 Purga', '🔴 Willowbank', '🔴 Ebenezer', '🔴 Calvert', '🔴 Grandchester'], hasChanges: true, votes: { ALP: 22, LNP: 48, GRN: 5, ONP: 12, IND: 13 } },
  { name: 'Beenleigh', formerName: 'Macalister', party: 'Labor', added: ['🔴 Yatala', '🔴 Luscombe', '🔴 Ormeau Hills', '🔴 Ormeau (west)'], removed: ['🔴 Carbrook', '🔴 Cornubia', '🔴 Loganholme', '🔴 Waterford'], hasChanges: true, votes: { ALP: 45, LNP: 35, GRN: 6, ONP: 8, IND: 6 } },
  { name: 'Brisbane Central', formerName: 'McConnel', party: 'Labor', added: [], removed: ['🔵 Herston', '🔵 Kelvin Grove', '🔵 Petrie Terrace'], hasChanges: true, votes: { ALP: 42, LNP: 22, GRN: 25, ONP: 3, IND: 8 } },
  { name: 'Broadwater', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 20, LNP: 55, GRN: 6, ONP: 10, IND: 9 } },
  { name: 'Buderim', formerName: null, party: 'LNP', added: [], removed: ['🔵 Mountain Creek (south)'], hasChanges: true, votes: { ALP: 25, LNP: 45, GRN: 12, ONP: 8, IND: 10 } },
  { name: 'Bulimba', formerName: null, party: 'LNP', added: [], removed: ['🔵 Camp Hill'], hasChanges: true, votes: { ALP: 35, LNP: 42, GRN: 12, ONP: 5, IND: 6 } },
  { name: 'Bundaberg', formerName: null, party: 'Labor', added: ['🔴 Kensington', '🔴 Branyan'], removed: ['🔴 Woongarra'], hasChanges: true, votes: { ALP: 42, LNP: 38, GRN: 5, ONP: 8, IND: 7 } },
  { name: 'Burdekin', formerName: null, party: 'LNP', added: ['🔴 Charters Towers', '🔴 Wulguru', '🔴 Murray', '🔴 Roseneath', '🔴 Stuart'], removed: ['🔴 Nebo', '🔴 Coppabella', '🔴 Moranbah', '🔴 Isaac LGA'], hasChanges: true, votes: { ALP: 18, LNP: 45, GRN: 4, ONP: 15, IND: 18 } },
  { name: 'Burnett', formerName: null, party: 'LNP', added: ['🔴 Howard', '🔴 Torbanlea', '🔴 Pacific Haven', '🔴 Burrum Heads', '🔴 Woongarra'], removed: ['🔴 Kensington', '🔴 Branyan', '🔴 Monduran'], hasChanges: true, votes: { ALP: 22, LNP: 52, GRN: 4, ONP: 12, IND: 10 } },
  { name: 'Cairns', formerName: null, party: 'Labor', added: ['🔴 Woree', '🔴 Bayview Heights', '🔴 White Rock'], removed: ['🔵 Brinsmead', '🔵 Aeroglen'], hasChanges: true, votes: { ALP: 42, LNP: 35, GRN: 8, ONP: 7, IND: 8 } },
  { name: 'Callide', formerName: null, party: 'LNP', added: ['🔴 Rosedale', '🔴 Miriam Vale', '🔴 Agnes Water', '🔴 Proston', '🔴 Durong', '🔴 Kilkivan', '🔴 Goomeri'], removed: ['🔵 Jandowae', '🔵 Bell', '🔴 Calliope', '🔴 Benarby'], hasChanges: true, votes: { ALP: 15, LNP: 55, GRN: 3, ONP: 15, IND: 12 } },
  { name: 'Caloundra', formerName: null, party: 'LNP', added: [], removed: ['🔵 Beerwah', '🔵 Landsborough', '🔵 Glenview', '🔵 Palmview', '🔴 Coochin Creek'], hasChanges: true, votes: { ALP: 28, LNP: 45, GRN: 10, ONP: 8, IND: 9 } },
  { name: 'Capalaba', formerName: null, party: 'Labor', added: ['🔵 Sheldon', '🔵 Birkdale'], removed: [], hasChanges: true, votes: { ALP: 48, LNP: 35, GRN: 6, ONP: 5, IND: 6 } },
  { name: 'Carindale', formerName: 'Chatsworth', party: 'LNP', added: ['🔴 Camp Hill', '🔴 Carindale'], removed: [], hasChanges: true, votes: { ALP: 35, LNP: 42, GRN: 10, ONP: 6, IND: 7 } },
  { name: 'Clayfield', formerName: null, party: 'LNP', added: [], removed: ['🔵 Gordon Park'], hasChanges: true, votes: { ALP: 30, LNP: 45, GRN: 10, ONP: 8, IND: 7 } },
  { name: 'Cleveland', formerName: 'Oodgeroo', party: 'LNP', added: ['🔴 Thornlands'], removed: ['🔵 Birkdale'], hasChanges: true, votes: { ALP: 30, LNP: 48, GRN: 8, ONP: 7, IND: 7 } },
  { name: 'Coolum', formerName: 'Ninderry', party: 'LNP', added: [], removed: ['🔵 Eumundi'], hasChanges: true, votes: { ALP: 25, LNP: 42, GRN: 15, ONP: 8, IND: 10 } },
  { name: 'Condamine', formerName: null, party: 'LNP', added: [], removed: ['🔵 Drayton', '🔴 Crows Nest', '🔴 Ravensbourne'], hasChanges: true, votes: { ALP: 12, LNP: 52, GRN: 3, ONP: 18, IND: 15 } },
  { name: 'Cook', formerName: null, party: 'Labor', added: ['🔴 Kuranda', '🔴 Speewah', '🔴 Mona Mona', '🔴 Koah', '🔴 Yagoonya'], removed: ['🔴 Mareeba LGA'], hasChanges: true, votes: { ALP: 48, LNP: 25, GRN: 5, ONP: 8, IND: 14 } },
  { name: 'Currumbin', formerName: null, party: 'LNP', added: ['🔵 Tallebudgera'], removed: [], hasChanges: true, votes: { ALP: 22, LNP: 52, GRN: 10, ONP: 8, IND: 8 } },
  { name: 'Deception Bay', formerName: 'Bancroft', party: 'Labor', added: ['🔴 Rothwell', '🔴 Kippa-Ring'], removed: ['🔴 Burpengary East', '🔴 Morayfield'], hasChanges: true, votes: { ALP: 45, LNP: 32, GRN: 6, ONP: 8, IND: 9 } },
  { name: 'Eight Mile Plains', formerName: 'Toohey', party: 'Labor', added: ['🔴 Kuraby', '🔴 Runcorn', '🔴 Sunnybank Hills', '🔴 Acacia Ridge', '🔴 Stretton'], removed: ['🔴 MacGregor', '🔴 Coopers Plains', '🔴 Nathan', '🔴 Salisbury', '🔴 Moorooka', '🔴 Rocklea'], hasChanges: true, votes: { ALP: 42, LNP: 35, GRN: 8, ONP: 7, IND: 8 } },
  { name: 'Everton', formerName: null, party: 'LNP', added: ['🔵 McDowall', '🔵 Albany Creek', '🔵 Bunya'], removed: ['🔵 Enoggera', '🔵 Gaythorne', '🔵 Mitchelton', '🔵 Bridgeman Downs'], hasChanges: true, votes: { ALP: 28, LNP: 50, GRN: 10, ONP: 6, IND: 6 } },
  { name: 'Ferny Grove', formerName: null, party: 'Labor', added: ['🔵 Enoggera', '🔵 Gaythorne', '🔵 Mitchelton'], removed: ['🔵 Ashgrove', '🔵 Bunya'], hasChanges: true, votes: { ALP: 42, LNP: 38, GRN: 10, ONP: 5, IND: 5 } },
  { name: 'Flinders', formerName: 'Traeger', party: 'KAP', added: ['🔴 Malanda', '🔴 Millaa Millaa', '🔴 Ravenshoe', '🔴 Hill (western)'], removed: ['🔴 Charters Towers'], hasChanges: true, votes: { ALP: 15, LNP: 30, GRN: 3, KAP: 35, ONP: 10, IND: 7 } },
  { name: 'Gaven', formerName: null, party: 'Labor', added: ['🔵 Pacific Pines', '🔵 Maudsland', '🔵 Guanaba', '🔵 Carrara', '🔵 Merrimac'], removed: ['🔵 Mount Nathan', '🔵 Worongary', '🔵 Gilston', '🔵 Highland Park'], hasChanges: true, votes: { ALP: 38, LNP: 42, GRN: 6, ONP: 8, IND: 6 } },
  { name: 'Gladstone', formerName: null, party: 'Labor', added: ['🔴 Calliope', '🔴 Benarby', '🔴 Taragoola', '🔴 River Ranch'], removed: [], hasChanges: true, votes: { ALP: 45, LNP: 35, GRN: 5, ONP: 8, IND: 7 } },
  { name: 'Glass House', formerName: null, party: 'LNP', added: ['🔵 Beerwah', '🔵 Landsborough', '🔵 Glenview', '🔵 Palmview', '🔵 Palmwoods', '🔵 Chevallum', '🔵 Ilkley', '🔵 Hunchy', '🔵 Tanawha'], removed: ['🔵 Ocean View', '🔴 Coochin Creek', '🔵 Beerburrum', '🔴 Flaxton', '🔴 Kenilworth', '🔴 Obi Obi'], hasChanges: true, votes: { ALP: 30, LNP: 42, GRN: 8, ONP: 10, IND: 10 } },
  { name: 'Gordon', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 22, LNP: 55, GRN: 5, ONP: 10, IND: 8 } },
  { name: 'Greenbank', formerName: 'Jordan', party: 'Labor', added: ['🔴 Boronia Heights', '🔴 Hillcrest', '🔴 Greenbank', '🔴 Park Ridge', '🔴 Park Ridge South', '🔴 Munruben', '🔴 North Maclean', '🔴 South Maclean', '🔴 Riverbend', '🔴 Forestdale', '🔴 South Ripley', '🔴 Spring Mountain'], removed: ['🔴 Springfield', '🔴 Brookwater', '🔴 Augustine Heights', '🔴 Camira', '🔴 Carole Park', '🔴 Gailes'], hasChanges: true, votes: { ALP: 48, LNP: 30, GRN: 5, ONP: 8, IND: 9 } },
  { name: 'Greenslopes', formerName: null, party: 'Labor', added: ['🔵 Woolloongabba', '🔵 Camp Hill'], removed: ['🔴 Camp Hill'], hasChanges: true, votes: { ALP: 35.5, LNP: 34.1, GRN: 26.4, ONP: 2.7, FF: 1.3 } },
  { name: 'Gregory', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 12, LNP: 58, GRN: 2, ONP: 18, IND: 10 } },
  { name: 'Gympie', formerName: null, party: 'LNP', added: [], removed: ['🔴 Traveston', '🔴 Amamoor'], hasChanges: true, votes: { ALP: 18, LNP: 50, GRN: 5, ONP: 15, IND: 12 } },
  { name: 'Hervey Bay', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 32, LNP: 40, GRN: 6, ONP: 10, IND: 12 } },
  { name: 'Hinchinbrook', formerName: null, party: 'KAP', added: ['🔴 Cassowary Coast', '🔴 Babinda', '🔴 Cairns LGA (south)'], removed: ['🔴 Burdell', '🔴 Bushland Beach', '🔴 Shaw', '🔴 Bohle Plains', '🔴 Deeragun'], hasChanges: true, votes: { ALP: 22, LNP: 30, GRN: 3, KAP: 32, ONP: 5, IND: 8 } },
  { name: 'Inala', formerName: null, party: 'Labor', added: ['🔴 Darra', '🔴 Sumner', '🔴 Forest Lake'], removed: [], hasChanges: true, votes: { ALP: 58, LNP: 20, GRN: 5, ONP: 8, IND: 9 } },
  { name: 'Indooroopilly', formerName: 'Maiwar', party: 'Greens', added: ['🔵 Indooroopilly'], removed: ['🔵 Mount Coot-tha', '🔵 Bardon'], hasChanges: true, votes: { ALP: 25.2, LNP: 37.7, GRN: 34.0, ONP: 3.1 } },
  { name: 'Ipswich', formerName: null, party: 'Labor', added: ['🔴 Blackstone', '🔴 Bundamba', '🔴 Ebbw Vale', '🔴 Dinmore', '🔴 Riverview', '🔴 Yamanto'], removed: ['🔴 Ripley', '🔴 South Ripley', '🔴 Deebing Heights'], hasChanges: true, votes: { ALP: 52, LNP: 25, GRN: 5, ONP: 8, IND: 10 } },
  { name: 'Ipswich West', formerName: null, party: 'Labor', added: ['🔴 Goolman', '🔴 Purga', '🔴 Willowbank', '🔴 Ebenezer', '🔴 Calvert', '🔴 Grandchester', '🔴 Deebing Heights'], removed: ['🔵 Chuwar', '🔵 Karalee', '🔵 Barellan Point', '🔵 North Ipswich', '🔵 Tivoli', '🔴 Yamanto'], hasChanges: true, votes: { ALP: 48, LNP: 30, GRN: 4, ONP: 8, IND: 10 } },
  { name: 'Kawana', formerName: null, party: 'LNP', added: ['🔵 Sippy Downs', '🔵 Palmview'], removed: [], hasChanges: true, votes: { ALP: 25, LNP: 48, GRN: 8, ONP: 10, IND: 9 } },
  { name: 'Keppel', formerName: null, party: 'Labor', added: [], removed: [], hasChanges: false, votes: { ALP: 42, LNP: 38, GRN: 5, ONP: 8, IND: 7 } },
  { name: 'Kurwongbah', formerName: null, party: 'LNP', added: ['🔴 Dakabin'], removed: ['🔴 Narangba', '🔴 Burpengary', '🔴 Petrie'], hasChanges: true, votes: { ALP: 35, LNP: 45, GRN: 7, ONP: 7, IND: 6 } },
  { name: 'Labrador', formerName: 'Bonney', party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 28, LNP: 45, GRN: 8, ONP: 10, IND: 9 } },
  { name: 'Lockyer', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 15, LNP: 48, GRN: 3, ONP: 18, IND: 16 } },
  { name: 'Logan', formerName: null, party: 'Labor', added: ['🔴 Waterford', '🔴 Waterford West', '🔴 Bethania'], removed: ['🔴 Boronia Heights', '🔴 Hillcrest', '🔴 Greenbank', '🔴 Park Ridge South', '🔴 Munruben', '🔴 North Maclean', '🔴 South Maclean', '🔴 Riverbend'], hasChanges: true, votes: { ALP: 48, LNP: 30, GRN: 5, ONP: 8, IND: 9 } },
  { name: 'Lytton', formerName: null, party: 'Labor', added: [], removed: [], hasChanges: false, votes: { ALP: 45, LNP: 35, GRN: 7, ONP: 6, IND: 7 } },
  { name: 'Mackay', formerName: null, party: 'Labor', added: ['🔴 Paget', '🔴 Ooralea', '🔴 Racecourse'], removed: [], hasChanges: true, votes: { ALP: 45, LNP: 32, GRN: 5, ONP: 8, IND: 10 } },
  { name: 'Mansfield', formerName: null, party: 'LNP', added: ['🔴 MacGregor', '🔴 Eight Mile Plains (east)'], removed: ['🔴 Carindale'], hasChanges: true, votes: { ALP: 35, LNP: 45, GRN: 8, ONP: 6, IND: 6 } },
  { name: 'Maroochydore', formerName: null, party: 'LNP', added: ['🔵 Mountain Creek'], removed: [], hasChanges: true, votes: { ALP: 25, LNP: 48, GRN: 10, ONP: 8, IND: 9 } },
  { name: 'Marsden', formerName: 'Waterford', party: 'Labor', added: ['🔴 Marsden', '🔴 Crestmead', '🔴 Heritage Park', '🔴 Browns Plains', '🔴 Regents Park', '🔴 Berrinba', '🔴 Park Ridge'], removed: ['🔴 Underwood', '🔴 Waterford', '🔴 Waterford West', '🔴 Bethania', '🔴 Slacks Creek', '🔴 Meadowbrook', '🔴 Tanah Merah', '🔴 Loganlea', '🔴 Loganholme', '🔴 Kingston'], hasChanges: true, votes: { ALP: 50, LNP: 28, GRN: 5, ONP: 8, IND: 9 } },
  { name: 'Maryborough', formerName: null, party: 'Independent', added: ['🔴 Eli Waters', '🔴 Urraween'], removed: ['🔴 Duckinwilla', '🔴 Howard', '🔴 Torbanlea', '🔴 Pacific Haven', '🔴 Burrum Heads', '🔴 Bunya Creek'], hasChanges: true, votes: { ALP: 30, LNP: 30, GRN: 5, ONP: 10, IND: 25 } },
  { name: 'Mermaid Beach', formerName: null, party: 'LNP', added: ['🔵 Robina'], removed: ['🔵 Varsity Lakes'], hasChanges: true, votes: { ALP: 22, LNP: 50, GRN: 10, ONP: 10, IND: 8 } },
  { name: 'Mirani', formerName: null, party: 'LNP', added: ['🔴 Wowan', '🔴 Nebo', '🔴 Coppabella', '🔴 Moranbah', '🔴 Shoalwater', '🔴 Isaac LGA'], removed: ['🔴 Paget', '🔴 Ooralea', '🔴 Racecourse'], hasChanges: true, votes: { ALP: 28, LNP: 42, GRN: 4, ONP: 14, IND: 12 } },
  { name: 'Moggill', formerName: null, party: 'LNP', added: ['🔵 Chuwar', '🔵 Barellan Point', '🔵 Karalee', '🔵 Tivoli', '🔵 North Ipswich'], removed: ['🔵 Indooroopilly'], hasChanges: true, votes: { ALP: 25, LNP: 50, GRN: 12, ONP: 6, IND: 7 } },
  { name: 'Morayfield', formerName: null, party: 'Labor', added: ['🔴 Burpengary', '🔴 Narangba', '🔴 Upper Caboolture', '🔴 Moorina', '🔴 Lilywood', '🔴 Rocksberg'], removed: ['🔴 Caboolture', '🔴 Bellmere'], hasChanges: true, votes: { ALP: 48, LNP: 32, GRN: 5, ONP: 8, IND: 7 } },
  { name: 'Mount Ommaney', formerName: null, party: 'LNP', added: ['🔵 Chelmer', '🔵 Graceville', '🔵 Sherwood'], removed: ['🔴 Darra', '🔴 Sumner'], hasChanges: true, votes: { ALP: 35, LNP: 42, GRN: 10, ONP: 6, IND: 7 } },
  { name: 'Mudgeeraba', formerName: null, party: 'LNP', added: ['🔵 Mount Nathan', '🔵 Worongary', '🔵 Gilston', '🔵 Highland Park', '🔵 Clagiraba'], removed: ['🔵 Robina', '🔵 Merrimac', '🔵 Carrara'], hasChanges: true, votes: { ALP: 22, LNP: 52, GRN: 8, ONP: 10, IND: 8 } },
  { name: 'Mulgrave', formerName: null, party: 'Labor', added: ['🔴 Atherton', '🔴 Tolga', '🔴 Yungaburra'], removed: ['🔴 Woree', '🔴 Bayview Heights', '🔴 White Rock'], hasChanges: true, votes: { ALP: 42, LNP: 35, GRN: 6, ONP: 8, IND: 9 } },
  { name: 'Mundingburra', formerName: null, party: 'LNP', added: ['🔴 Currajong', '🔴 Pimlico', '🔴 Hyde Park', '🔴 Mysterton', '🔴 Hermit Park', '🔴 Rosslea', '🔴 Gulliver', '🔴 Heatley'], removed: ['🔴 Wulguru', '🔴 Murray', '🔴 Roseneath', '🔴 Stuart'], hasChanges: true, votes: { ALP: 30, LNP: 42, GRN: 5, ONP: 12, IND: 11 } },
  { name: 'Murrumba', formerName: null, party: 'LNP', added: ['🔴 Petrie'], removed: ['🔴 Dakabin', '🔴 Rothwell', '🔴 Kippa-Ring'], hasChanges: true, votes: { ALP: 42, LNP: 38, GRN: 6, ONP: 7, IND: 7 } },
  { name: 'Nambour', formerName: 'Nicklin', party: 'LNP', added: ['🔴 Flaxton', '🔴 Kenilworth', '🔴 Obi Obi', '🔴 Traveston', '🔴 Amamoor', '🔴 Eumundi'], removed: ['🔵 Palmwoods', '🔵 Chevallum', '🔵 Ilkley', '🔵 Hunchy', '🔵 Tanawha'], hasChanges: true, votes: { ALP: 30, LNP: 40, GRN: 10, ONP: 10, IND: 10 } },
  { name: 'Nanango', formerName: null, party: 'LNP', added: ['🔴 Crows Nest', '🔴 Ravensbourne'], removed: ['🔴 Kilkivan', '🔴 Goomeri', '🔴 Proston', '🔴 Durong'], hasChanges: true, votes: { ALP: 12, LNP: 52, GRN: 3, ONP: 18, IND: 15 } },
  { name: 'Noosa', formerName: null, party: 'LNP', added: ['🔴 Federal'], removed: [], hasChanges: true, votes: { ALP: 25, LNP: 35, GRN: 20, ONP: 8, IND: 12 } },
  { name: 'Nudgee', formerName: null, party: 'Labor', added: ['🔴 Taigum', '🔴 Geebung'], removed: ['🔴 Zillmere'], hasChanges: true, votes: { ALP: 45, LNP: 35, GRN: 8, ONP: 5, IND: 7 } },
  { name: 'Oxenford', formerName: 'Theodore', party: 'LNP', added: ['🔵 Upper Coomera', '🔵 Cedar Creek', '🔵 Wongawallan', '🔵 Kingsholme', '🔵 Willow Vale', '🔵 Pimpama (west)'], removed: ['🔵 Guanaba', '🔵 Maudsland', '🔵 Pacific Pines', '🔵 Clagiraba', '🔵 Coomera'], hasChanges: true, votes: { ALP: 25, LNP: 50, GRN: 6, ONP: 10, IND: 9 } },
  { name: 'Pimpama', formerName: 'Coomera', party: 'LNP', added: ['🔵 Coomera', '🔵 Helensvale (north)'], removed: ['🔴 Ormeau Hills', '🔴 Luscombe', '🔴 Yatala', '🔴 Ormeau', '🔴 Willow Vale', '🔴 Wongawallan', '🔴 Cedar Creek', '🔴 Pimpama (west)', '🔴 Upper Coomera'], hasChanges: true, votes: { ALP: 30, LNP: 48, GRN: 6, ONP: 8, IND: 8 } },
  { name: 'Pine Rivers', formerName: null, party: 'LNP', added: ['🔵 Ocean View'], removed: ['🔵 Jollys Lookout'], hasChanges: true, votes: { ALP: 35, LNP: 42, GRN: 8, ONP: 8, IND: 7 } },
  { name: 'Pumicestone', formerName: null, party: 'LNP', added: ['🔴 Burpengary East', '🔴 Morayfield', '🔴 Coochin Creek', '🔴 Beerburrum'], removed: ['🔴 Moodlu', '🔴 Caboolture', '🔴 Elimbah'], hasChanges: true, votes: { ALP: 38, LNP: 38, GRN: 6, ONP: 8, IND: 10 } },
  { name: 'Redbank', formerName: 'Bundamba', party: 'Labor', added: ['🔴 Ripley'], removed: ['🔴 Bellbird Park', '🔴 Blackstone', '🔴 Bundamba', '🔴 Ebbw Vale', '🔴 Dinmore', '🔴 Riverview', '🔴 Spring Mountain', '🔴 South Ripley'], hasChanges: true, votes: { ALP: 52, LNP: 25, GRN: 5, ONP: 8, IND: 10 } },
  { name: 'Redcliffe', formerName: null, party: 'Labor', added: ['🔵 Newport'], removed: ['🔴 Kippa-Ring'], hasChanges: true, votes: { ALP: 42, LNP: 38, GRN: 8, ONP: 5, IND: 7 } },
  { name: 'Redlands', formerName: null, party: 'LNP', added: ['🔴 Carbrook', '🔴 Mount Cotton'], removed: ['🔴 Thornlands'], hasChanges: true, votes: { ALP: 30, LNP: 48, GRN: 8, ONP: 7, IND: 7 } },
  { name: 'Rockhampton', formerName: null, party: 'Labor', added: ['🔴 Pink Lily', '🔴 Frenchville', '🔴 Koongal'], removed: [], hasChanges: true, votes: { ALP: 45, LNP: 35, GRN: 5, ONP: 8, IND: 7 } },
  { name: 'Sandgate', formerName: null, party: 'Labor', added: ['🔴 Zillmere'], removed: ['🔴 Taigum'], hasChanges: true, votes: { ALP: 48, LNP: 30, GRN: 10, ONP: 5, IND: 7 } },
  { name: 'South Brisbane', formerName: null, party: 'Labor', added: [], removed: ['🔴 Annerley', '🔵 Woolloongabba'], hasChanges: true, votes: { ALP: 32.0, LNP: 29.9, GRN: 34.7, ONP: 3.4 } },
  { name: 'Southern Downs', formerName: null, party: 'LNP', added: ['🔴 Ellangowan', '🔴 Ryeford'], removed: [], hasChanges: true, votes: { ALP: 12, LNP: 55, GRN: 3, ONP: 18, IND: 12 } },
  { name: 'Southport', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 22, LNP: 50, GRN: 10, ONP: 10, IND: 8 } },
  { name: 'Springwood', formerName: null, party: 'Labor', added: ['🔴 Underwood', '🔴 Cornubia', '🔴 Loganholme (east)'], removed: ['🔴 Mount Cotton', '🔵 Sheldon'], hasChanges: true, votes: { ALP: 42, LNP: 35, GRN: 6, ONP: 8, IND: 9 } },
  { name: 'Stafford', formerName: null, party: 'Labor', added: ['🔵 Gordon Park', '🔵 Kelvin Grove', '🔵 Herston'], removed: ['🔵 Chermside'], hasChanges: true, votes: { ALP: 42, LNP: 35, GRN: 12, ONP: 5, IND: 6 } },
  { name: 'Surfers Paradise', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 18, LNP: 52, GRN: 10, ONP: 12, IND: 8 } },
  { name: 'Thuringowa', formerName: null, party: 'Labor', added: ['🔴 Shaw', '🔴 Bohle Plains', '🔴 Deeragun', '🔴 Jensen', '🔴 Rangewood', '🔴 Alice River', '🔴 Hervey Range', '🔴 Black River'], removed: ['🔴 Heatley'], hasChanges: true, votes: { ALP: 42, LNP: 32, GRN: 5, ONP: 10, IND: 11 } },
  { name: 'Toowoomba North', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 28, LNP: 45, GRN: 5, ONP: 12, IND: 10 } },
  { name: 'Toowoomba South', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 22, LNP: 50, GRN: 5, ONP: 12, IND: 11 } },
  { name: 'Townsville', formerName: null, party: 'Labor', added: ['🔴 Burdell', '🔴 Bushland Beach', '🔴 Mount Low'], removed: ['🔴 Currajong', '🔴 Pimlico', '🔴 Hyde Park', '🔴 Mysterton', '🔴 Hermit Park', '🔴 Rosslea', '🔴 Gulliver'], hasChanges: true, votes: { ALP: 38, LNP: 38, GRN: 5, ONP: 10, IND: 9 } },
  { name: 'Warrego', formerName: null, party: 'LNP', added: ['🔵 Jandowae', '🔵 Bell', '🔴 Tambo'], removed: [], hasChanges: true, votes: { ALP: 10, LNP: 55, GRN: 2, ONP: 18, IND: 15 } },
  { name: 'Whitsunday', formerName: null, party: 'LNP', added: [], removed: [], hasChanges: false, votes: { ALP: 22, LNP: 48, GRN: 4, ONP: 14, IND: 12 } },
  { name: 'Woodridge', formerName: null, party: 'Labor', added: ['🔴 Slacks Creek', '🔴 Meadowbrook', '🔴 Tanah Merah', '🔴 Bethania', '🔴 Loganlea', '🔴 Loganholme', '🔴 Kingston'], removed: ['🔴 Marsden', '🔴 Crestmead', '🔴 Heritage Park', '🔴 Browns Plains', '🔴 Regents Park'], hasChanges: true, votes: { ALP: 50, LNP: 28, GRN: 5, ONP: 8, IND: 9 } }
]

const filteredElectorates = computed(() => {
  const withMargins = electorates.map(e => ({
    ...e,
    margin: margins2024[e.name] !== undefined ? margins2024[e.name] : margins2024[e.formerName] ?? null
  }))
  
  // Filter by search query first
  let results = withMargins
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(e => 
      e.name.toLowerCase().includes(query) ||
      (e.formerName && e.formerName.toLowerCase().includes(query))
    )
  }
  
  // Then filter by party/status
  if (selectedParty.value === 'all') return results
  if (selectedParty.value === 'abolished') return results.filter(e => e.status === 'abolished')
  if (selectedParty.value === 'new') return results.filter(e => e.status === 'new')
  return results.filter(e => e.party === selectedParty.value)
})

const openAbcResults = (name: string) => {
  const slug = name.toLowerCase().replace(/[^a-z]/g, '-')
  window.open(`https://www.abc.net.au/news/elections/qld/2024/guide/${slug}`, '_blank')
}

const getPartyClass = (party: string) => {
  switch (party) {
    case 'Labor': return 'party-labor'
    case 'LNP': return 'party-lnp'
    case 'Greens': return 'party-greens'
    case 'KAP': return 'party-kap'
    case 'Independent': return 'party-independent'
    default: return ''
  }
}

const controversialChanges = [
  {
    name: 'Hill',
    status: 'abolished',
    party: 'KAP',
    region: 'North QLD',
    image: null,
    description: 'Atherton Tablelands lumped with Mount Isa 1000km away. Communities with nothing in common forced together.',
    color: 'red'
  },
  {
    name: 'Stretton',
    status: 'abolished',
    party: 'Labor',
    region: 'Brisbane South',
    image: null,
    description: 'Safe Labor seat removed from the map entirely. No clear justification provided for targeting this specific seat.',
    color: 'red'
  },
  {
    name: 'Springfield',
    status: 'new',
    party: 'New',
    region: 'SEQ Growth Corridor',
    image: '/maps/springfield.png',
    description: 'New seat created for booming Springfield area. Reflects genuine population growth in south-east Queensland.',
    color: 'green'
  },
  {
    name: 'Caboolture',
    status: 'new',
    party: 'New',
    region: 'SEQ Growth Corridor',
    image: '/maps/caboolture.png',
    description: 'New seat recognizing population growth in the Moreton Bay region. Long overdue representation.',
    color: 'green'
  },
  {
    name: 'Mulgrave',
    status: 'changed',
    party: 'Labor',
    region: 'Cairns',
    image: '/maps/mulgrave.png',
    description: 'Urban Cairns seat suddenly gains Atherton Tablelands. City interests will dominate rural concerns.',
    color: 'orange'
  },
  {
    name: 'Hinchinbrook',
    status: 'changed',
    party: 'Independent',
    region: 'North QLD Coast',
    image: '/maps/hinchinbrook.png',
    description: 'Babinda moved against community wishes. Sugar cane communities split apart.',
    color: 'orange'
  },
  {
    name: 'Nicklin',
    status: 'changed',
    party: 'LNP',
    region: 'Sunshine Coast',
    image: '/maps/nicklin.png',
    description: 'Significant boundary changes affecting Nambour and hinterland communities.',
    color: 'orange'
  },
  {
    name: 'Mansfield',
    status: 'changed',
    party: 'LNP',
    region: 'Brisbane East',
    image: '/maps/mansfield.png',
    description: 'Boundaries shifted significantly. Traditional voting patterns disrupted.',
    color: 'orange'
  },
  {
    name: 'Broadwater',
    status: 'changed',
    party: 'LNP',
    region: 'Gold Coast',
    image: '/maps/broadwater.png',
    description: 'Coastal boundaries redrawn. Tourism communities reorganized.',
    color: 'orange'
  },
  {
    name: 'Ashgrove',
    status: 'changed',
    party: 'Greens/Labor',
    region: 'Brisbane Inner-West',
    image: '/maps/ashgrove.png',
    description: 'Renamed back from Cooper to its original name. Electorate too long — stretches from Jolly\'s Lookout in Mt Nebo to Milton. Inner-urban and outer-suburban residents have very different interests.',
    color: 'orange'
  },
  {
    name: 'Indooroopilly',
    status: 'changed',
    party: 'Greens/Labor',
    region: 'Brisbane West',
    image: '/maps/indooroopilly.png',
    description: 'Boundaries cross the highway to take bites out of Chapel Hill and former Moggill areas, ignoring natural borders to compensate for population lost from Mt Coot-tha removal.',
    color: 'orange'
  },
  {
    name: 'Inala',
    status: 'changed',
    party: 'Labor',
    region: 'Brisbane South-West',
    image: '/maps/inala.png',
    description: "Absorbed Darra from neighbouring Mt Ommaney — but Darra sits on the other side of the Ipswich Motorway, separated from Inala by a natural boundary. Darra's community ties run westward toward Oxley and the Centenary corridor, not across the highway. This move breaks existing community connections.",
    color: 'orange'
  },
  {
    name: 'Greenbank',
    status: 'new',
    party: 'Labor',
    region: 'Ipswich/Springfield',
    image: '/maps/greenbank.png',
    description: "Newly created as a distinct entity from the former Bundamba and Jordan split. Part of the Springfield-Redbank-Greenbank reshuffle to accommodate rapid population growth in the Ipswich corridor.",
    color: 'green'
  },
  {
    name: 'Gaven',
    status: 'changed',
    party: 'LNP',
    region: 'Gold Coast Hinterland',
    image: '/maps/gaven.png',
    description: 'Electorate stretched even further along its already excessive length with little regard for natural borders like highways and rivers.',
    color: 'orange'
  },
  {
    name: 'Moggill',
    status: 'changed',
    party: 'Greens/Labor',
    region: 'Brisbane West',
    image: '/maps/moggill.png',
    description: 'Boundaries now cross the Brisbane River to include Karalee — grouping Brisbane City Council residents with Ipswich City Council residents. These communities are separated by the river with limited crossings and fundamentally different council representation needs.',
    color: 'red'
  },
  {
    name: 'Mount Ommaney',
    status: 'changed',
    party: 'Labor',
    region: 'Brisbane West',
    image: '/maps/mt_ommaney.png',
    description: 'Removes working-class Darra ($1,600/week) and adds affluent Chelmer ($3,100/week) — a $1,500/week gap. Creates a socio-economic discontinuity that shifts the electorate\'s priorities dramatically.',
    color: 'red'
  },
  {
    name: 'Woodridge',
    status: 'changed',
    party: 'Labor',
    region: 'Brisbane South',
    image: '/maps/woodridge.png',
    description: 'Significant portion of the former Woodridge community now sits outside the new Woodridge boundaries, fragmenting an established community.',
    color: 'orange'
  }
]

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'abolished': return '❌ ABOLISHED'
    case 'new': return '✨ NEW SEAT'
    case 'changed': return '⚠️ CHANGED'
    default: return status.toUpperCase()
  }
}

const sources = [
  {
    title: 'ECQ Official Proposal',
    url: 'https://redistribution.ecq.qld.gov.au/public-consultation/the-commissions-proposed-redistribution',
    description: 'Official Queensland Redistribution Commission proposal and consultation documents'
  },
  {
    title: 'ABC News: QLD Boundary Review',
    url: 'https://www.abc.net.au/news/2026-03-10/queensland-electoral-boundaries-review-changes-proposed/106435294',
    description: 'Analysis of proposed changes and their political implications'
  },
  {
    title: 'ABC North QLD: Community Response',
    url: 'https://www.abc.net.au/news/2026-03-12/north-queensland-residents-disbelief-electoral-boundaries/106441626',
    description: 'North Queensland residents express disbelief at proposed boundaries'
  },
  {
    title: 'The Poll Bludger: Analysis',
    url: 'https://www.pollbludger.net/2026/03/10/queensland-state-redistribution-proposal/',
    description: 'Detailed two-candidate preferred and primary vote estimates for new boundaries'
  },
  {
    title: 'Reddit: Queensland Gerrymandering Analysis',
    url: 'https://old.reddit.com/r/queensland/comments/1rzotqa/queensland_is_currently_being_gerrymandered_and/',
    description: 'Community breakdown of John Sosso appointment and QRC oversight concerns'
  },
  {
    title: 'Independent Australia: Crisafulli Appointment',
    url: 'https://independentaustralia.net/politics/politics-display/crisafulli-jobs-for-mates-appointment-sparks-vote-rigging-allegations,19678',
    description: 'Vote rigging allegations over the Electoral Commissioner appointment'
  }
]
</script>

<template>
  <div class="qld-page" :class="{ dark: store.darkMode }">
    <section class="hero">
      <h1>Queensland Electoral Redistribution 2026</h1>
      <p class="hero-subtitle">The first comprehensive boundary review since 2017 raises questions about fairness and representation</p>
    </section>

    <section class="section">
      <h2>How It Works</h2>
      <div class="info-cards">
        <div class="info-card">
          <Scale :size="32" class="info-icon-svg" />
          <h3>Independent Commission</h3>
          <p>The Queensland Redistribution Commission reviews electoral boundaries for fair representation. Its independence has been questioned after the Crisafulli Government appointed former LNP director-general John Sosso as Electoral Commissioner.</p>
          <a href="#sosso-section" class="read-more-link">Read more about the Sosso appointment controversy →</a>
        </div>
        <div class="info-card">
          <Calendar :size="32" class="info-icon-svg" />
          <h3>First Review Since 2017</h3>
          <p>This is the first comprehensive redistribution in nearly a decade, reflecting significant demographic changes across Queensland.</p>
        </div>
        <div class="info-card">
          <BarChart3 :size="32" class="info-icon-svg" />
          <h3>Seat Count: 93</h3>
          <p>Queensland maintains 93 seats, but boundaries have shifted significantly to reflect population movements from rural areas to the south-east.</p>
        </div>
        <div class="info-card">
          <MessageCircleWarning :size="32" class="info-icon-svg" />
          <h3>Public Consultation</h3>
          <p>The public consultation period is open for objections. Queenslanders can submit feedback on proposed boundary changes.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Controversial Changes</h2>
      <div class="changes-grid">
        <div 
          v-for="change in controversialChanges" 
          :key="change.name"
          class="change-card"
          :class="change.color"
          @click="change.image && ((selectedMap = change), (mapExpanded = true))"
          :style="change.image ? 'cursor: pointer' : ''"
        >
          <div class="change-header">
            <h3>{{ change.name }}</h3>
            <span class="status-badge" :class="change.color">
              {{ getStatusLabel(change.status) }}
            </span>
          </div>
          <div class="change-meta">
            <span class="party">{{ change.party }}</span>
            <span class="region"><MapPin :size="14" style="display: inline;" /> {{ change.region }}</span>
          </div>
          <p class="change-description">{{ change.description }}</p>
          <div v-if="change.image" class="map-hint"><ExternalLink :size="12" style="display: inline;" /> Map available</div>
        </div>
      </div>

      <!-- Map Modal -->
      <Teleport to="body">
        <div v-if="selectedMap" class="map-modal-overlay" :class="{ 'dark-overlay': store.darkMode }" @click="selectedMap = null">
          <div class="map-modal" :class="{ 'map-modal-dark': store.darkMode }" @click.stop>
            <div class="map-modal-header" :class="{ 'map-modal-header-dark': store.darkMode }">
              <h3 :class="{ 'map-modal-title-dark': store.darkMode }">{{ selectedMap.name }} — Proposed Boundaries</h3>
              <button class="map-modal-close" :class="{ 'map-modal-close-dark': store.darkMode }" @click="selectedMap = null">✕</button>
            </div>
            <img 
              :src="selectedMap.image" 
              :alt="selectedMap.name + ' map'"
              class="map-modal-image"
              @click="mapExpanded = true"
              style="cursor: zoom-in;"
            />
            <div class="map-modal-footer" :class="{ 'map-modal-footer-dark': store.darkMode }">
              <span class="status-badge" :class="selectedMap.color">{{ getStatusLabel(selectedMap.status) }}</span>
              <span class="party">{{ selectedMap.party }}</span>
              <span class="region"><MapPin :size="14" style="display: inline;" /> {{ selectedMap.region }}</span>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Expanded Map View -->
      <Teleport to="body">
        <div v-if="mapExpanded && selectedMap" class="map-expanded-overlay" @click="(mapExpanded = false), (selectedMap = null)">
          <div class="map-expanded-container" @click.stop>
            <button class="map-expanded-close" @click="(mapExpanded = false), (selectedMap = null)">✕</button>
            <img 
              :src="selectedMap.image" 
              :alt="selectedMap.name + ' map'"
              class="map-expanded-image"
              :class="{ 'map-zoomed': mapZoomed }"
              @click="mapZoomed = !mapZoomed"
              style="cursor: zoom-in;"
            />
          </div>
        </div>
      </Teleport>
    </section>

    <section class="section">
      <h2>Historical Context: The Bjelkemander</h2>
      <div class="history-section">
        <div class="history-content">
          <div class="history-item">
            <Clock :size="20" class="history-icon-svg" />
            <div>
              <h4>1949-1989: Joh Bjelke-Petersen Era</h4>
              <p>For 40 years, Queensland operated under one of the most notorious gerrymanders in Australian history. The system systematically over-represented rural areas at the expense of urban voters.</p>
            </div>
          </div>
          <div class="history-item">
            <BarChart3 :size="20" class="history-icon-svg" />
            <div>
              <h4>Blatant Malapportionment</h4>
              <p>Rural seats had as few as 5,000 voters while urban seats contained up to 25,000. This meant a rural vote was worth up to 5 times an urban vote.</p>
            </div>
          </div>
          <div class="history-item">
            <Vote :size="20" class="history-icon-svg" />
            <div>
              <h4>Stolen Elections</h4>
              <p>Labor repeatedly won over 50% of the popular vote but could not form government. The system was designed specifically to prevent Labor from ever winning.</p>
            </div>
          </div>
          <div class="history-item">
            <Scale :size="20" class="history-icon-svg" />
            <div>
              <h4>1989: Fitzgerald Inquiry</h4>
              <p>The corruption inquiry that brought down the National Party government also led to electoral reform. The gerrymander was finally dismantled.</p>
            </div>
          </div>
        </div>
        <div class="quote-box">
          <blockquote>
            "The majority will be ruled by the minority. [The government is telling] the people whether you like it or not, we will be the Government."
          </blockquote>
          <cite>— Joh Bjelke-Petersen, 1949, speaking against Labor's malapportionment (Source: Wikipedia, Bjelkemander)</cite>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 id="sosso-section">The Sosso Appointment Controversy</h2>
      <div class="history-section">
        <div class="history-content">
          <div class="history-item">
            <User :size="20" class="history-icon-svg" />
            <div>
              <h4>John Sosso: A History with the LNP</h4>
              <p>Joined the Young Liberals in 1974. Personally recruited into the Bjelke-Petersen government in 1984. Appointed Director-General of the Department of Justice under Campbell Newman's LNP government in 2012. Appointed by Crisafulli as Director-General of State Development in 2024 — without merit process.</p>
            </div>
          </div>
          <div class="history-item">
            <Wrench :size="20" class="history-icon-svg" />
            <div>
              <h4>Weakening the Watchdog</h4>
              <p>As Director-General under Newman, Sosso oversaw the termination of the independent Crime and Misconduct Commission (CMC) — the body responsible for ensuring the QRC operated without partisan interference. It was replaced with the Crime and Corruption Commission (CCC), which had greatly reduced powers. Crucially, this included removing the requirement for bipartisan support for the Electoral Commissioner appointment.</p>
            </div>
          </div>
          <div class="history-item">
            <Calendar :size="20" class="history-icon-svg" />
            <div>
              <h4>April 2025: Sosso Appointed Electoral Commissioner</h4>
              <p>One of the Crisafulli government's first acts was appointing John Sosso as Electoral Commissioner — the very role responsible for redrawing electoral boundaries. The same man who removed bipartisan oversight requirements a decade earlier now holds the position those protections were designed to safeguard.</p>
            </div>
          </div>
          <div class="history-item">
            <AlertTriangle :size="20" class="history-icon-svg" />
            <div>
              <h4>Fitzgerald's Warning</h4>
              <p>Tony Fitzgerald, who led the landmark 1987 corruption inquiry, warned directly: "I'm concerned that Queensland might be reverting to the bad old days of biased electoral boundaries — the notorious Queensland gerrymander." The Labor opposition and media also raised concerns, but without the requirement for bipartisan support, the appointment proceeded regardless.</p>
            </div>
          </div>
        </div>
        <div class="quote-box">
          <blockquote>
            "I'm concerned that Queensland might be reverting to the bad old days of biased electoral boundaries — the notorious Queensland gerrymander."
          </blockquote>
          <cite>— Tony Fitzgerald QC, on the Sosso appointment (Source: archived media reports)</cite>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Section 46 — Matters to be Considered</h2>
      <p class="section-subtitle">Under the Electoral Act 1992, the Commission must consider these matters when preparing the proposed redistribution.</p>
      
      <div class="info-cards">
        <div class="info-card">
          <Home :size="32" class="info-icon-svg" />
          <h3>Section 46(1)(a) — Community of Interest</h3>
          <p>The Commission must consider the extent to which there is a community of <strong>economic, social, regional or other interests</strong> within each proposed electoral district. Submissions highlighted that Woodridge, Hill, and Gaven have had their communities fragmented — splitting neighbourhoods that share schools, shopping centres, and community identity across different electorates.</p>
        </div>
        <div class="info-card">
          <Landmark :size="32" class="info-icon-svg" />
          <h3>Section 46(1)(b) — Communication & Travel</h3>
          <p>The Commission must consider the <strong>ways of communication and travel</strong> within each proposed district. Moggill now includes Karalee across the Brisbane River, connected only by limited crossings that residents historically opposed. Ashgrove stretches from Jolly's Lookout to Milton — an impractical distance for a single representative to service effectively.</p>
        </div>
        <div class="info-card">
          <BarChart3 :size="32" class="info-icon-svg" />
          <h3>Section 46(1)(c) — Physical Features</h3>
          <p>The Commission must consider the <strong>physical features</strong> of each proposed district. The Brisbane River, Western Freeway, Ipswich Motorway, and council boundaries are natural borders being crossed without clear justification. Indooroopilly crosses the highway to absorb Chapel Hill, while Mount Ommaney loses Darra across the motorway.</p>
        </div>
        <div class="info-card">
          <Ruler :size="32" class="info-icon-svg" />
          <h3>Section 46(1)(d)(e) — Boundaries & Demographics</h3>
          <p>The Commission must consider <strong>existing electoral boundaries</strong> and <strong>demographic trends</strong>. Mount Ommaney's sudden shift from working-class Darra ($1,600/week) to affluent Chelmer ($3,100/week) represents a dramatic socio-economic disruption that overrides the community's established character and future trajectory.</p>
        </div>
        <div class="info-card">
          <Scale :size="32" class="info-icon-svg" />
          <h3>Section 46(2) — Local Government Boundaries</h3>
          <p>The Commission <strong>may also consider</strong> local government area boundaries where there is a community of interest within each LGA. Moggill's inclusion of Karalee crosses from Brisbane City Council into Ipswich City Council — grouping residents under different council jurisdictions with different service priorities and planning frameworks.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Make Your Voice Heard</h2>
      <div class="info-cards">
        <a 
          href="https://submission.redistribution.ecq.qld.gov.au/s/objections"
          target="_blank"
          rel="noopener noreferrer"
          class="info-card cta-card"
        >
          <PenLine :size="32" class="info-icon-svg" />
          <h3>Submit an Objection</h3>
          <p>The QRC is accepting public objections to the proposed boundaries. If you disagree with the changes to your electorate, you can submit feedback directly. Be specific about which boundaries affect your community and why they should be reconsidered.</p>
          <span class="cta-link">Submit your objection <ExternalLink :size="14" style="display: inline;" /></span>
        </a>
        <div class="info-card">
          <Lightbulb :size="32" class="info-icon-svg" />
          <h3>Tips for Submissions</h3>
          <ul class="tip-list">
            <li>Reference specific proposed boundaries (e.g. "Proposed Gaven/Mudgeeraba")</li>
            <li>Focus on communities of interest — explain which suburbs belong together and why</li>
            <li>Use geographic features as logical boundary arguments (rivers, main roads)</li>
            <li>Be specific: name suburbs, streets, or landmarks affected</li>
            <li>Point out areas where the proposal isolates pockets of residents</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Full Electorate Changes</h2>
      <p class="section-subtitle">All 93 Queensland electorates and their boundary changes. Cards are coloured by the party that won the seat at the 2024 QLD state election.</p>
      
      <!-- Search and Filter Section -->
      <div class="search-filter-section">
        <div class="search-container">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search by electorate name..." 
            class="search-input"
          />
        </div>
        
        <div class="filter-label">Filter by party:</div>
        
        <div class="filter-buttons">
        <button 
          v-for="filter in ['all', 'Labor', 'LNP', 'Greens', 'KAP', 'Independent', 'new', 'abolished']" 
          :key="filter"
          class="filter-btn"
          :class="{ active: selectedParty === filter, ['filter-' + filter.toLowerCase()]: true }"
          @click="selectedParty = filter"
        >
          <template v-if="filter === 'new'"><Sparkles :size="14" style="display: inline; margin-right: 4px;" /> New Seats</template>
          <template v-else-if="filter === 'abolished'"><XCircle :size="14" style="display: inline; margin-right: 4px;" /> Abolished</template>
          <template v-else>{{ filter === 'all' ? 'All' : filter }}</template>
        </button>
      </div>
      </div>
      
      <div class="electorates-grid">
        <div 
          v-for="electorate in filteredElectorates" 
          :key="electorate.name"
          class="electorate-card"
          :class="[getPartyClass(electorate.party), { 'abolished-card': electorate.status === 'abolished', 'new-card': electorate.status === 'new' }]"
          @click="openBoothModal(electorate)"
          style="cursor: pointer"
        >
          <div class="electorate-header">
            <h3>{{ electorate.name }}<span v-if="electorate.formerName" class="former-name"> (formerly {{ electorate.formerName }})</span></h3>
            <span v-if="electorate.status === 'abolished'" class="status-indicator abolished"><XCircle :size="12" style="display: inline; margin-right: 2px;" /> ABOLISHED</span>
            <span v-if="electorate.status === 'new'" class="status-indicator new"><Sparkles :size="12" style="display: inline; margin-right: 2px;" /> NEW</span>
          </div>
          
          <div class="party-badge" :class="getPartyClass(electorate.party)">
            {{ electorate.party }}<span v-if="electorate.margin !== undefined" class="margin-badge">{{ electorate.margin !== null ? ' · ' + electorate.margin + '%' : ' · Marginal' }}</span>
          </div>
          
          <div v-if="electorate.note" class="electorate-note">
            {{ electorate.note }}
          </div>
          
          <div v-if="electorate.hasChanges" class="changes-section">
            <div v-if="electorate.added.length > 0" class="change-group">
              <span class="change-label">Gained:</span>
              <div class="suburbs-list">
                <span v-for="suburb in electorate.added" :key="suburb" class="suburb-tag">{{ suburb }}</span>
              </div>
            </div>
            <div v-if="electorate.removed.length > 0" class="change-group">
              <span class="change-label">Lost:</span>
              <div class="suburbs-list">
                <span v-for="suburb in electorate.removed" :key="suburb" class="suburb-tag">{{ suburb }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-changes">
            No boundary changes
          </div>
          
          <!-- Vote composition bar -->
          <div v-if="electorate.votes" class="vote-bar" @click.stop="openAbcResults(electorate.name)">
            <div v-if="electorate.votes.ALP > 0" class="vote-segment alp" :style="{ width: electorate.votes.ALP + '%' }"></div>
            <div v-if="electorate.votes.LNP > 0" class="vote-segment lnp" :style="{ width: electorate.votes.LNP + '%' }"></div>
            <div v-if="electorate.votes.GRN > 0" class="vote-segment grn" :style="{ width: electorate.votes.GRN + '%' }"></div>
            <div v-if="electorate.votes.KAP > 0" class="vote-segment kap" :style="{ width: electorate.votes.KAP + '%' }"></div>
            <div v-if="electorate.votes.ONP > 0" class="vote-segment onp" :style="{ width: electorate.votes.ONP + '%' }"></div>
            <div v-if="electorate.votes.IND > 0" class="vote-segment ind" :style="{ width: electorate.votes.IND + '%' }"></div>
          </div>
        </div>
      </div>
      
      <div class="electorate-count">
        Showing {{ filteredElectorates.length }} of {{ electorates.length }} electorates
      </div>
    </section>

    <section class="section">
      <h2>Redistribution Impact Summary</h2>
      <p class="section-subtitle">Net gains by party and key affected electorates</p>
      
      <!-- Net Gains Summary -->
      <div class="net-gains-row">
        <div class="net-gain-box alp">
          <div class="net-gain-header">🔴 Labor Net Gains</div>
          <div class="net-gain-number">+27</div>
          <div class="net-gain-detail">suburbs from LNP-held seats</div>
          <div class="net-gain-examples">Buderim, Carindale, Mansfield, Cleveland</div>
        </div>
        <div class="net-gain-box lnp">
          <div class="net-gain-header">🔵 LNP Net Gains</div>
          <div class="net-gain-number">+10</div>
          <div class="net-gain-detail">suburbs from ALP-held seats</div>
          <div class="net-gain-examples">Ferny Grove, Gaven, Aspley</div>
        </div>
      </div>

      <!-- Current Holds Breakdown -->
      <div class="holds-section">
        <h4>Current Holds &amp; Changes</h4>
        <div class="holds-grid">
          <div class="holds-card">
            <div class="holds-party alp">🔴 Labor Holds: 47 seats</div>
            <div class="holds-breakdown">
              <div class="holds-row"><span class="badge green">Strengthened</span> 18 marginal seats (+67 ALP suburbs)</div>
              <div class="holds-row"><span class="badge red">Weakened</span> 5 marginal seats (+10 LNP suburbs)</div>
              <div class="holds-row"><span class="badge blue">Consolidated</span> 10 strong seats (+55 ALP suburbs)</div>
            </div>
          </div>
          <div class="holds-card">
            <div class="holds-party lnp">🔵 LNP Holds: 40 seats</div>
            <div class="holds-breakdown">
              <div class="holds-row"><span class="badge green">Strengthened</span> 9 marginal seats (+22 LNP suburbs)</div>
              <div class="holds-row"><span class="badge red">Weakened</span> 9 marginal seats (+27 ALP suburbs)</div>
              <div class="holds-row"><span class="badge blue">Consolidated</span> 10 strong seats (+28 LNP suburbs)</div>
            </div>
          </div>
        </div>
      </div>

      <div class="impact-notes">
        <h4>Key Observations</h4>
        <ul>
          <li><strong>Best outcome for Labor:</strong> 18 marginal ALP seats gained 67 ALP-leaning suburbs</li>
          <li><strong>Best outcome for LNP:</strong> 9 marginal LNP seats gained 22 LNP-leaning suburbs</li>
          <li><strong>LNP more vulnerable:</strong> 9 marginal LNP seats gained 27 ALP voters vs 5 marginal ALP seats gaining 10 LNP voters</li>
        </ul>
      </div>
    </section>

    <section class="section">
      <h2>Interactive Electorate Map</h2>
      <p class="section-subtitle">Queensland state electoral boundaries — click and zoom to explore.</p>
      
      <!-- Map Mode Toggle -->
      <div class="map-controls">
        <div class="map-toggle-group">
          <label class="map-toggle" :class="{ active: mapMode === 'base' }">
            <input type="radio" v-model="mapMode" value="base" />
            <span class="toggle-label"><MapIcon :size="16" style="margin-right: 4px;" /> Base Map</span>
          </label>
          <label class="map-toggle" :class="{ active: mapMode === 'income' }">
            <input type="radio" v-model="mapMode" value="income" />
            <span class="toggle-label"><BarChart3 :size="16" style="margin-right: 4px;" /> Income Heat Map</span>
          </label>
          <label class="map-toggle" :class="{ active: mapMode === 'election' }">
            <input type="radio" v-model="mapMode" value="election" />
            <span class="toggle-label"><Vote :size="16" style="margin-right: 4px;" /> Election Results</span>
          </label>
        </div>
        
        <!-- Income Legend -->
        <div v-if="mapMode === 'income'" class="income-legend">
          <div class="legend-title">Median Household Income</div>
          <div class="legend-scale">
            <div class="legend-gradient"></div>
            <div class="legend-labels">
              <span>$35k</span>
              <span>$55k</span>
              <span>$75k</span>
              <span>$95k+</span>
            </div>
          </div>
          <div class="legend-note">Click regions for details</div>
        </div>
      </div>
      
      <div class="map-embed">
        <div ref="mapContainer" class="leaflet-map"></div>
        <div v-if="incomeLoading || electionLoading" class="map-loading">
          <div class="loading-spinner"></div>
          {{ incomeLoading ? 'Loading income data...' : 'Loading election data...' }}
        </div>
        <small class="map-credit">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</small>
      </div>
    </section>

    <section class="section">
      <h2>Sources & Links</h2>
      <p class="section-subtitle"><LinkIcon :size="14" style="display: inline; vertical-align: middle; margin-right: 6px;" />Official sources and references for this analysis</p>
      <div class="sources-list">
        <a 
          v-for="source in sources" 
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
          class="source-card"
        >
          <ExternalLink :size="16" class="source-icon-svg" />
          <div class="source-content">
            <h4>{{ source.title }}</h4>
            <p>{{ source.description }}</p>
          </div>
        </a>
      </div>
    </section>

    <!-- Booth Results Modal -->
    <Teleport to="body">
      <div v-if="selectedElectorate" class="booth-modal-overlay" @click="selectedElectorate = null">
        <div class="booth-modal" @click.stop>
          <div class="booth-modal-header">
            <div>
              <h3>{{ selectedElectorate.name }}</h3>
              <span v-if="selectedElectorate.formerName" class="former-name-modal">(formerly {{ selectedElectorate.formerName }})</span>
            </div>
            <button class="booth-modal-close" @click="selectedElectorate = null">✕</button>
          </div>
          <div class="booth-modal-subtitle">2024 Election - Booth Results</div>
          
          <div v-if="boothLoading" class="booth-loading">
            <div class="booth-spinner"></div>
            Loading booth data...
          </div>
          
          <div v-else-if="!selectedElectorate.booths?.length" class="booth-empty">
            No booth data available for this electorate.
          </div>
          
          <div v-else class="booth-grid">
            <div 
              v-for="(booth, idx) in selectedElectorate.booths" 
              :key="idx"
              class="booth-card"
            >
              <div class="donut-container">
                <svg viewBox="0 0 100 100" class="donut-chart">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" class="donut-bg-circle" stroke-width="20" />
                  <circle
                    v-for="(seg, i) in getDonutSegments(booth.p)"
                    :key="i"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="20"
                    :stroke-dasharray="seg.dash"
                    :stroke-dashoffset="seg.dashOffset"
                    class="donut-segment"
                  />
                </svg>
                <div class="donut-center">
                  <span class="donut-votes">{{ booth.v.toLocaleString() }}</span>
                  <span class="donut-label">votes</span>
                </div>
              </div>
              <div class="booth-info">
                <span class="booth-name">{{ booth.n }}</span>
                <span class="booth-type">{{ booth.t === 'EV' ? 'Early Voting' : 'Polling Booth' }}</span>
              </div>
              <div class="booth-legend">
                <div 
                  v-for="(seg, i) in getDonutSegments(booth.p)" 
                  :key="i"
                  class="legend-item"
                >
                  <span class="legend-color" :style="{ background: seg.color }"></span>
                  <span class="legend-party">{{ seg.party }}</span>
                  <span class="legend-pct">{{ booth.p[seg.party].toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <footer class="page-footer">
      <p>Data sourced from ECQ and ABC News | Analysis current as of March 2026</p>
    </footer>
  </div>
</template>

<style scoped>
/* ============================================
   GLOBAL RESET - Isolate from site theme
   ============================================ */

.qld-page {
  all: initial;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
  background: #ffffff;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.qld-page.dark {
  background: #161616;
  color: #e7e9ea;
}

/* Reset all descendant elements */
.qld-page *,
.qld-page *::before,
.qld-page *::after {
  box-sizing: border-box;
}

/* Restore display values */
.qld-page h1, .qld-page h2, .qld-page h3,
.qld-page h4, .qld-page h5, .qld-page h6 {
  all: unset;
  display: block;
  font-family: inherit;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}
.qld-page.dark h1, .qld-page.dark h2, .qld-page.dark h3,
.qld-page.dark h4, .qld-page.dark h5, .qld-page.dark h6 {
  color: #ffffff;
}

.qld-page p, .qld-page span, .qld-page section,
.qld-page small, .qld-page cite, .qld-page strong, .qld-page em {
  all: unset;
  display: block;
  font-family: inherit;
  line-height: inherit;
  color: inherit;
}
.qld-page span {
  display: inline;
}
.qld-page em {
  display: inline;
  font-style: italic;
}
.qld-page strong {
  display: inline;
  font-weight: 700;
}

.qld-page a {
  all: unset;
  display: inline;
  color: #8B1A1A;
  cursor: pointer;
  font-family: inherit;
}
/* Source cards need their own display/padding since 'a' reset strips them */
.qld-page a.source-card {
  all: unset;
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: border-color 0.2s ease;
  color: #1a1a1a;
}
.qld-page.dark a.source-card {
  background: #1a1a1a;
  border-color: #2f3336;
  box-shadow: none;
  color: #e7e9ea;
}
.qld-page a.source-card:hover {
  border-color: #8B1A1A;
}
.qld-page.dark a.source-card:hover {
  border-color: #d4565a;
}
.qld-page a:hover {
  text-decoration: underline;
}

.qld-page button {
  all: unset;
  display: inline-block;
  font-family: inherit;
  cursor: pointer;
}

.qld-page input {
  all: unset;
  display: inline-block;
  font-family: inherit;
}

.qld-page ul, .qld-page ol {
  all: unset;
  display: block;
  padding-left: 1.5rem;
  font-family: inherit;
  color: inherit;
}
.qld-page li {
  all: unset;
  display: list-item;
  font-family: inherit;
  color: inherit;
}

.qld-page img {
  all: unset;
  display: block;
  max-width: 100%;
}

.qld-page blockquote {
  all: unset;
  display: block;
  font-style: italic;
}

.qld-page cite {
  display: inline;
  font-style: italic;
  font-size: 0.875rem;
}

/* ============================================
   HERO
   ============================================ */

.hero {
  text-align: center;
  padding: 48px 20px 40px;
  margin-bottom: 48px;
  border-bottom: 1px solid #e2e8f0;
}
.qld-page.dark .hero {
  border-bottom-color: #2f3336;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 auto 12px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  max-width: 800px;
  color: #8B1A1A;
}

.qld-page.dark .hero h1 {
  color: #d4565a;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: #536471;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}
.qld-page.dark .hero-subtitle {
  color: #8b98a5;
}

/* ============================================
   SECTIONS
   ============================================ */

.section {
  margin-bottom: 56px;
}

.section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 40px 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
  color: #8B1A1A;
}
.qld-page.dark .section h2 {
  border-bottom-color: #2f3336;
  color: #d4565a;
}

.section-subtitle {
  margin-bottom: 32px;
  color: #536471;
  font-size: 1rem;
}
.qld-page.dark .section-subtitle {
  color: #8b98a5;
}

/* ============================================
   INFO CARDS
   ============================================ */

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 20px;
}

.info-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.qld-page.dark .info-card {
  background: #1a1a1a;
  border-color: #2f3336;
  box-shadow: none;
}
.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e0;
}
.qld-page.dark .info-card:hover {
  border-color: #3c4145;
}

.info-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.info-icon-svg {
  margin-bottom: 12px;
  color: #8B1A1A;
}
.qld-page.dark .info-icon-svg {
  color: #c0392b;
}

.history-icon-svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #8B1A1A;
}
.qld-page.dark .history-icon-svg {
  color: #c0392b;
}

.source-icon-svg {
  flex-shrink: 0;
  color: #8B1A1A;
}
.qld-page.dark .source-icon-svg {
  color: #d4565a;
}

.external-icon-svg {
  color: #8B1A1A;
}
.qld-page.dark .external-icon-svg {
  color: #d4565a;
}

.info-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.info-card p {
  color: #536471;
  font-size: 0.9375rem;
  line-height: 1.6;
}
.qld-page.dark .info-card p {
  color: #8b98a5;
}

.info-note {
  margin-top: 12px;
  padding: 12px;
  background: #f7f8f9;
  border-left: 3px solid #8B1A1A;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #536471;
}
.qld-page.dark .info-note {
  background: #1a1a1a;
  border-left-color: #d4565a;
  color: #8b98a5;
}
.info-note a {
  color: #8B1A1A;
  text-decoration: underline;
}

.read-more-link {
  display: inline-block;
  margin-top: 12px;
  color: #8B1A1A;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.read-more-link:hover {
  color: #004499;
  text-decoration: underline;
}
.qld-page.dark .read-more-link {
  color: #d4565a;
}

/* ============================================
   CHANGE CARDS (Controversial Changes)
   ============================================ */

.changes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 20px;
}

.change-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-left: 3px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}
.qld-page.dark .change-card {
  background: #1a1a1a;
  border-color: #2f3336;
  box-shadow: none;
}
.change-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.change-card.red { border-left-color: #c53030; }
.change-card.green { border-left-color: #2f855a; }
.change-card.orange { border-left-color: #c05621; }
.qld-page.dark .change-card.red { border-left-color: #e74c4c; }
.qld-page.dark .change-card.green { border-left-color: #48c78e; }
.qld-page.dark .change-card.orange { border-left-color: #e08a45; }

.change-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.change-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  flex: 1;
}

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}
.status-badge.red {
  background: rgba(197, 48, 48, 0.1);
  color: #c53030;
}
.status-badge.green {
  background: rgba(47, 133, 90, 0.1);
  color: #2f855a;
}
.status-badge.orange {
  background: rgba(192, 86, 33, 0.1);
  color: #c05621;
}

.change-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  align-items: center;
}

.party {
  display: inline-block;
  background: #536471;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.region {
  display: inline;
  color: #536471;
  font-size: 0.85rem;
}
.qld-page.dark .region {
  color: #8b98a5;
}

.change-description {
  color: #536471;
  font-size: 0.9375rem;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}
.qld-page.dark .change-description {
  color: #c4cdd4;
}

.map-hint {
  margin-top: auto;
  padding: 4px 0;
  font-size: 0.7rem;
  color: #8b98a5;
  text-align: right;
}
.qld-page.dark .map-hint {
  color: #536471;
}

/* ============================================
   MAP MODAL
   ============================================ */

.map-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.dark-overlay {
  background: rgba(0, 0, 0, 0.8);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.map-modal {
  background: #ffffff;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.map-modal-dark {
  background: #1a1a1a;
  border: 1px solid #2f3336;
}

.map-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.map-modal-header-dark {
  border-bottom-color: #2f3336;
}

.map-modal-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: unset;
  background-clip: unset;
}

.map-modal-title-dark {
  color: #e7e9ea !important;
}

.map-modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #536471;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}
.map-modal-close:hover {
  background: #f0f3f5;
  color: #c53030;
}

.map-modal-close-dark {
  color: #8b98a5;
}
.map-modal-close-dark:hover {
  background: #2f3336;
}

.map-modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.map-modal-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

/* Dark mode footer needs explicit styling since it's teleported */
.map-modal-dark .map-modal-footer,
.map-modal-footer-dark {
  border-top-color: #2f3336;
}

.map-modal-footer-dark .party {
  background: #3c4145;
}

.map-modal-footer-dark .region {
  color: #8b98a5;
}

/* Expanded map view */
.map-expanded-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
  overflow: auto;
}

.map-expanded-container {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
}

.map-expanded-close {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  z-index: 10001;
}
.map-expanded-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.map-expanded-image {
  max-width: 95vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.3s ease;
}
.map-zoomed {
  max-width: none;
  max-height: none;
  width: auto;
  height: auto;
  cursor: zoom-out !important;
}

/* ============================================
   HISTORY SECTION
   ============================================ */

.history-section {
  background: #f7f8f9;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}
.qld-page.dark .history-section {
  background: #1a1a1a;
  border-color: #2f3336;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.history-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.history-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.history-item h4 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.history-item p {
  color: #536471;
  font-size: 0.9375rem;
  line-height: 1.6;
}
.qld-page.dark .history-item p {
  color: #8b98a5;
}

.quote-box {
  background: #f0f3f5;
  border-left: 4px solid #8B1A1A;
  padding: 20px;
  margin-top: 24px;
  border-radius: 8px;
}
.qld-page.dark .quote-box {
  background: #111111;
  border-left-color: #8B1A1A;
}

.quote-box blockquote {
  margin-bottom: 12px;
  color: #1a1a1a;
  font-size: 1.0625rem;
  line-height: 1.6;
}
.qld-page.dark .quote-box blockquote {
  color: #e7e9ea;
}

.quote-box cite {
  color: #536471;
  font-size: 0.875rem;
}
.qld-page.dark .quote-box cite {
  color: #8b98a5;
}

/* ============================================
   CTA CARD
   ============================================ */

.cta-card {
  text-decoration: none !important;
  cursor: pointer;
  background: #ffffff !important;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.cta-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: #8B1A1A !important;
}
.qld-page.dark .cta-card {
  background: #161616 !important;
  border-color: #2f3336;
  box-shadow: none;
}
.qld-page.dark .cta-card:hover {
  border-color: #a6302c !important;
}

.cta-link {
  display: inline-block;
  margin-top: 12px;
  color: #8B1A1A;
  font-weight: 600;
  font-size: 0.9375rem;
}
.qld-page.dark .cta-link {
  color: #d4565a;
}

/* ============================================
   TIPS
   ============================================ */

.tip-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}
.tip-list li {
  padding: 6px 0 6px 24px;
  position: relative;
  color: #536471;
  font-size: 0.9rem;
  line-height: 1.5;
  list-style: none;
}
.qld-page.dark .tip-list li {
  color: #8b98a5;
}
.tip-list li::before {
  content: "•";
  position: absolute;
  left: 4px;
  color: #8B1A1A;
  font-weight: bold;
}

/* ============================================
   SEARCH INPUT
   ============================================ */

.search-filter-section {
  background: #f7f8f9;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.qld-page.dark .search-filter-section {
  background: #1a1a1a;
  border-color: #2f3336;
}

.search-container {
  margin-bottom: 0;
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b98a5;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 10px 14px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1a1a1a;
  background: #ffffff;
  transition: border-color 0.2s ease;
}
.search-input::placeholder {
  color: #8b98a5;
  font-size: 0.875rem;
}
.search-input:focus {
  outline: none;
  border-color: #8B1A1A;
}
.qld-page.dark .search-input {
  background: #161616;
  border-color: #2f3336;
  color: #e7e9ea;
}
.qld-page.dark .search-input:focus {
  border-color: #d4565a;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #536471;
  white-space: nowrap;
}
.qld-page.dark .filter-label {
  color: #8b98a5;
}

/* ============================================
   FILTER BUTTONS
   ============================================ */

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-btn {
  padding: 10px 24px;
  border: 1px solid transparent;
  border-radius: 24px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #1a1a1a;
  line-height: 1.4;
}
.qld-page.dark .filter-btn {
  color: #e7e9ea;
}
.filter-btn:hover {
  opacity: 0.85;
}
.filter-btn.active {
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.qld-page.dark .filter-btn.active {
  color: #ffffff;
}
/* Party-colored backgrounds */
.filter-btn.filter-labor {
  background: rgba(197, 48, 48, 0.12);
  border-color: rgba(197, 48, 48, 0.25);
}
.filter-btn.filter-lnp {
  background: rgba(43, 108, 176, 0.12);
  border-color: rgba(43, 108, 176, 0.25);
}
.filter-btn.filter-greens {
  background: rgba(47, 133, 90, 0.12);
  border-color: rgba(47, 133, 90, 0.25);
}
.filter-btn.filter-kap {
  background: rgba(183, 129, 38, 0.12);
  border-color: rgba(183, 129, 38, 0.25);
}
.filter-btn.filter-independent {
  background: rgba(83, 100, 113, 0.12);
  border-color: rgba(83, 100, 113, 0.25);
}
.filter-btn.filter-new {
  background: rgba(47, 133, 90, 0.12);
  border-color: rgba(47, 133, 90, 0.25);
}
.filter-btn.filter-abolished {
  background: rgba(197, 48, 48, 0.12);
  border-color: rgba(197, 48, 48, 0.25);
}
.qld-page.dark .filter-btn.filter-labor {
  background: rgba(197, 48, 48, 0.2);
  border-color: rgba(197, 48, 48, 0.35);
}
.qld-page.dark .filter-btn.filter-lnp {
  background: rgba(43, 108, 176, 0.2);
  border-color: rgba(43, 108, 176, 0.35);
}
.qld-page.dark .filter-btn.filter-greens {
  background: rgba(47, 133, 90, 0.2);
  border-color: rgba(47, 133, 90, 0.35);
}
.qld-page.dark .filter-btn.filter-kap {
  background: rgba(183, 129, 38, 0.2);
  border-color: rgba(183, 129, 38, 0.35);
}
.qld-page.dark .filter-btn.filter-independent {
  background: rgba(83, 100, 113, 0.2);
  border-color: rgba(83, 100, 113, 0.35);
}
.qld-page.dark .filter-btn.filter-new {
  background: rgba(47, 133, 90, 0.2);
  border-color: rgba(47, 133, 90, 0.35);
}
.qld-page.dark .filter-btn.filter-abolished {
  background: rgba(197, 48, 48, 0.2);
  border-color: rgba(197, 48, 48, 0.35);
}
.filter-btn.filter-labor.active {
  background: #c53030;
  border-color: #c53030;
  color: #ffffff;
}
.filter-btn.filter-lnp.active {
  background: #2b6cb0;
  border-color: #2b6cb0;
  color: #ffffff;
}
.filter-btn.filter-greens.active {
  background: #2f855a;
  border-color: #2f855a;
  color: #ffffff;
}
.filter-btn.filter-kap.active {
  background: #b78126;
  border-color: #b78126;
  color: #ffffff;
}
.filter-btn.filter-independent.active {
  background: #536471;
  border-color: #536471;
  color: #ffffff;
}
.filter-btn.filter-new.active {
  background: #2f855a;
  border-color: #2f855a;
  color: #ffffff;
}
.filter-btn.filter-abolished.active {
  background: #c53030;
  border-color: #c53030;
  color: #ffffff;
}

/* ============================================
   ELECTORATES GRID
   ============================================ */

.electorates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 16px;
  max-height: 800px;
  overflow-y: auto;
  padding-right: 4px;
}

.electorate-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.qld-page.dark .electorate-card {
  background: #1a1a1a;
  border-color: #2f3336;
}
.electorate-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Party tints - flat backgrounds, no gradients */
.electorate-card.party-labor {
  background: #fef2f2;
  border-color: rgba(197, 48, 48, 0.3);
}
.qld-page.dark .electorate-card.party-labor {
  background: #1f1215;
  border-color: rgba(197, 48, 48, 0.4);
}

.electorate-card.party-lnp {
  background: #ebf5ff;
  border-color: rgba(43, 108, 176, 0.3);
}
.qld-page.dark .electorate-card.party-lnp {
  background: #111a24;
  border-color: rgba(43, 108, 176, 0.4);
}

.electorate-card.party-greens {
  background: #f0faf4;
  border-color: rgba(47, 133, 90, 0.3);
}
.qld-page.dark .electorate-card.party-greens {
  background: #111f16;
  border-color: rgba(47, 133, 90, 0.4);
}

.electorate-card.party-kap {
  background: #fffff0;
  border-color: rgba(183, 129, 38, 0.3);
}
.qld-page.dark .electorate-card.party-kap {
  background: #1f1a10;
  border-color: rgba(183, 129, 38, 0.4);
}

.electorate-card.party-independent {
  background: #f7f8f9;
  border-color: rgba(83, 100, 113, 0.3);
}
.qld-page.dark .electorate-card.party-independent {
  background: #181b1e;
  border-color: rgba(83, 100, 113, 0.4);
}

.electorate-card.abolished-card {
  opacity: 0.65;
  border-style: dashed;
}

.electorate-card.new-card {
  box-shadow: inset 0 0 0 1px rgba(47, 133, 90, 0.25);
}

.electorate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.electorate-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  flex: 1;
}

.former-name {
  display: inline;
  font-weight: 400;
  font-size: 0.85rem;
  color: #536471;
}
.qld-page.dark .former-name {
  color: #8b98a5;
}

.status-indicator {
  display: inline-block;
  font-size: 0.7rem;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 600;
  flex-shrink: 0;
}
.status-indicator.abolished {
  background: rgba(197, 48, 48, 0.12);
  color: #c53030;
}
.status-indicator.new {
  background: rgba(47, 133, 90, 0.12);
  color: #2f855a;
}

.party-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 10px;
}
.party-badge.party-labor {
  background: rgba(197, 48, 48, 0.12);
  color: #c53030;
}
.party-badge.party-lnp {
  background: rgba(43, 108, 176, 0.12);
  color: #2b6cb0;
}
.party-badge.party-greens {
  background: rgba(47, 133, 90, 0.12);
  color: #2f855a;
}
.party-badge.party-kap {
  background: rgba(183, 129, 38, 0.12);
  color: #b78126;
}
.party-badge.party-independent {
  background: rgba(83, 100, 113, 0.12);
  color: #536471;
}
.qld-page.dark .party-badge.party-labor {
  background: rgba(197, 48, 48, 0.2);
  color: #fc8181;
}
.qld-page.dark .party-badge.party-lnp {
  background: rgba(43, 108, 176, 0.2);
  color: #63b3ed;
}
.qld-page.dark .party-badge.party-greens {
  background: rgba(47, 133, 90, 0.2);
  color: #68d391;
}
.qld-page.dark .party-badge.party-kap {
  background: rgba(183, 129, 38, 0.2);
  color: #f6e05e;
}
.qld-page.dark .party-badge.party-independent {
  background: rgba(83, 100, 113, 0.2);
  color: #a0aec0;
}

.margin-badge {
  display: inline;
  font-size: 0.7rem;
  color: #536471;
  font-weight: 500;
}

.electorate-note {
  font-size: 0.85rem;
  color: #536471;
  font-style: italic;
  margin-bottom: 8px;
}
.qld-page.dark .electorate-note {
  color: #8b98a5;
}

.changes-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.change-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a1a1a;
}
.qld-page.dark .change-label {
  color: #e7e9ea;
}

.suburbs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.suburb-tag {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  color: #536471;
}
.qld-page.dark .suburb-tag {
  background: rgba(255, 255, 255, 0.06);
  color: #c4cdd4;
}

.no-changes {
  font-size: 0.85rem;
  color: #8b98a5;
  font-style: italic;
}

.electorate-count {
  text-align: center;
  padding: 16px;
  color: #536471;
  font-size: 0.875rem;
  margin-top: 12px;
}
.qld-page.dark .electorate-count {
  color: #8b98a5;
}

/* ============================================
   VOTE COMPOSITION BAR
   ============================================ */

.vote-bar {
  display: flex;
  width: 100%;
  height: 5px;
  border-radius: 2px;
  overflow: hidden;
  margin-top: auto;
  cursor: pointer;
}
.vote-segment {
  height: 100%;
  min-width: 2px;
  transition: opacity 0.15s ease;
}
.vote-bar:hover .vote-segment {
  opacity: 0.85;
}
.vote-segment.alp { background: #c53030; }
.vote-segment.lnp { background: #2b6cb0; }
.vote-segment.grn { background: #2f855a; }
.vote-segment.kap { background: #b78126; }
.vote-segment.onp { background: #c05621; }
.vote-segment.ind { background: #536471; }

/* ============================================
   NET GAINS / HOLDS / IMPACT
   ============================================ */

.net-gains-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.net-gain-box {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.qld-page.dark .net-gain-box {
  background: #1a1a1a;
  border-color: #2f3336;
  box-shadow: none;
}

.net-gain-box.alp { border-top: 3px solid #c53030; }
.net-gain-box.lnp { border-top: 3px solid #2b6cb0; }

.net-gain-header {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 8px;
  color: #536471;
}
.qld-page.dark .net-gain-header {
  color: #8b98a5;
}

.net-gain-number {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 4px;
}
.net-gain-box.alp .net-gain-number { color: #c53030; }
.net-gain-box.lnp .net-gain-number { color: #2b6cb0; }

.net-gain-detail {
  font-size: 0.85rem;
  color: #536471;
  margin-bottom: 4px;
}
.qld-page.dark .net-gain-detail {
  color: #8b98a5;
}

.net-gain-examples {
  font-size: 0.8rem;
  color: #8b98a5;
  font-style: italic;
}

.holds-section {
  margin-bottom: 24px;
}

.holds-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.holds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 16px;
}

.holds-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.qld-page.dark .holds-card {
  background: #1a1a1a;
  border-color: #2f3336;
  box-shadow: none;
}

.holds-party {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}
.qld-page.dark .holds-party {
  border-bottom-color: #2f3336;
}
.holds-party.alp { color: #c53030; }
.holds-party.lnp { color: #2b6cb0; }

.holds-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.holds-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #536471;
}
.qld-page.dark .holds-row {
  color: #c4cdd4;
}

.badge {
  padding: 4px 10px;
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}
.badge.green {
  background: rgba(47, 133, 90, 0.1);
  color: #2f855a;
}
.badge.red {
  background: rgba(197, 48, 48, 0.1);
  color: #c53030;
}
.badge.blue {
  background: rgba(43, 108, 176, 0.1);
  color: #2b6cb0;
}
.qld-page.dark .badge.green {
  background: rgba(47, 133, 90, 0.2);
  color: #68d391;
}
.qld-page.dark .badge.red {
  background: rgba(197, 48, 48, 0.2);
  color: #fc8181;
}
.qld-page.dark .badge.blue {
  background: rgba(43, 108, 176, 0.2);
  color: #63b3ed;
}

.impact-notes {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.qld-page.dark .impact-notes {
  background: #1a1a1a;
  border-color: #2f3336;
  box-shadow: none;
}

.impact-notes h4 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.impact-notes ul {
  padding-left: 1.25rem;
}

.impact-notes li {
  margin-bottom: 8px;
  color: #536471;
  line-height: 1.5;
}
.qld-page.dark .impact-notes li {
  color: #c4cdd4;
}
.impact-notes li:last-child {
  margin-bottom: 0;
}

/* ============================================
   MAP SECTION
   ============================================ */

.map-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f7f8f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.qld-page.dark .map-controls {
  background: #1a1a1a;
  border-color: #2f3336;
}

.map-toggle-group {
  display: flex;
  gap: 8px;
}

.map-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #cfd9e1;
  background: #ffffff;
  transition: all 0.15s ease;
}
.qld-page.dark .map-toggle {
  border-color: #3c4145;
  background: #1a1a1a;
}
.map-toggle input {
  display: none;
}
.map-toggle:hover {
  border-color: #8B1A1A;
}
.map-toggle.active {
  border-color: #8B1A1A;
  background: #ebf5ff;
}
.qld-page.dark .map-toggle.active {
  background: #0d2137;
  border-color: #1a6bb5;
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #536471;
}
.qld-page.dark .toggle-label {
  color: #c4cdd4;
}
.map-toggle.active .toggle-label {
  color: #8B1A1A;
  font-weight: 600;
}

.income-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.qld-page.dark .income-legend {
  background: #1a1a1a;
  border-color: #2f3336;
}

.legend-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
}
.qld-page.dark .legend-title {
  color: #e7e9ea;
}

.legend-scale {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.legend-gradient {
  width: 120px;
  height: 12px;
  border-radius: 8px;
  background: linear-gradient(to right, #4caf50, #ffcc00, #ff5722);
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: #8b98a5;
}

.legend-note {
  display: inline;
  font-size: 0.65rem;
  color: #8b98a5;
  white-space: nowrap;
}

.map-embed {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  background: #f7f8f9;
  position: relative;
  border: 1px solid #e2e8f0;
}
.qld-page.dark .map-embed {
  background: #1a1a1a;
  border-color: #2f3336;
}

.map-credit {
  display: block;
  text-align: center;
  margin-top: 16px;
  font-size: 0.75rem;
  color: #8b98a5;
}
.map-credit a {
  color: #8B1A1A;
}

.leaflet-map {
  width: 100%;
  height: 600px;
  z-index: 1;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  z-index: 1000;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   SOURCES
   ============================================ */

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease;
}
.qld-page.dark .source-card {
  background: #1a1a1a;
  border-color: #2f3336;
  box-shadow: none;
}
.source-card:hover {
  border-color: #8B1A1A;
}
.qld-page.dark .source-card:hover {
  border-color: #d4565a;
}

.source-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.source-content {
  flex: 1;
}
.source-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
}
.source-content p {
  color: #536471;
  font-size: 0.875rem;
}
.qld-page.dark .source-content p {
  color: #8b98a5;
}

.external-icon {
  display: inline;
  color: #8B1A1A;
  font-size: 1.25rem;
}

/* ============================================
   BOOTH MODAL
   ============================================ */

.booth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.booth-modal {
  background: #ffffff;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
  padding: 0;
}
.qld-page.dark .booth-modal {
  background: #1a1a1a;
  border: 1px solid #2f3336;
}

.booth-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.qld-page.dark .booth-modal-header {
  border-bottom-color: #2f3336;
}

.booth-modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
}

.former-name-modal {
  display: inline;
  font-size: 0.875rem;
  color: #536471;
}
.qld-page.dark .former-name-modal {
  color: #8b98a5;
}

.booth-modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #536471;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}
.booth-modal-close:hover {
  background: #f0f3f5;
  color: #c53030;
}
.qld-page.dark .booth-modal-close:hover {
  background: #2f3336;
}

.booth-modal-subtitle {
  padding: 12px 20px;
  color: #536471;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}
.qld-page.dark .booth-modal-subtitle {
  color: #8b98a5;
  border-bottom-color: #2f3336;
}

.booth-loading,
.booth-empty {
  padding: 40px 20px;
  text-align: center;
  color: #536471;
  font-size: 0.9375rem;
}

.booth-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: #8B1A1A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

.booth-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
}

.booth-card {
  background: #f7f8f9;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  text-align: center;
}
.qld-page.dark .booth-card {
  background: #1a1a1a;
  border-color: #2f3336;
}

.donut-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 12px;
}

.donut-chart {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.donut-bg-circle {
  stroke: #e2e8f0;
}
.qld-page.dark .donut-bg-circle {
  stroke: #2f3336;
}

.donut-segment {
  transition: opacity 0.15s ease;
}
.donut-segment:hover {
  opacity: 0.8;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-votes {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a1a;
}
.qld-page.dark .donut-votes {
  color: #ffffff;
}

.donut-label {
  display: block;
  font-size: 0.65rem;
  color: #8b98a5;
  text-transform: uppercase;
}

.booth-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.booth-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
}
.qld-page.dark .booth-name {
  color: #e7e9ea;
}

.booth-type {
  font-size: 0.75rem;
  color: #8b98a5;
}

.booth-legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.booth-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #536471;
}
.qld-page.dark .booth-legend .legend-item {
  color: #c4cdd4;
}

.booth-legend .legend-color {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.booth-legend .legend-party {
  font-weight: 600;
}

.booth-legend .legend-pct {
  color: #8b98a5;
}

/* ============================================
   FOOTER
   ============================================ */

.page-footer {
  text-align: center;
  padding: 32px 20px;
  color: #8b98a5;
  font-size: 0.875rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 40px;
}
.qld-page.dark .page-footer {
  color: #536471;
  border-top-color: #2f3336;
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .qld-page {
    padding: 60px 16px 24px;
  }

  .hero {
    padding: 32px 12px 24px;
    margin-bottom: 32px;
  }

  .hero h1 {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .section {
    margin-bottom: 40px;
  }

  .section h2 {
    font-size: 1.375rem;
  }

  .changes-grid,
  .info-cards,
  .net-gains-row,
  .holds-grid {
    grid-template-columns: 1fr;
  }

  .history-section {
    padding: 16px;
  }

  .electorates-grid {
    grid-template-columns: 1fr;
    max-height: none;
    overflow-y: visible;
  }

  .booth-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .map-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .map-toggle-group {
    flex-wrap: wrap;
  }
}
</style>