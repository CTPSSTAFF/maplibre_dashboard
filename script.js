let map;

// Add the PMTiles plugin to the maplibregl global.
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', (request) => {
  return new Promise((resolve, reject) => {
    const callback = (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({ data });
      }
    };
    protocol.tile(request, callback);
  });
});

// Our PMTiles URLs
const PMTILES_URL_DEMO = 'https://vector-tiles-testing.s3.us-east-2.amazonaws.com/brmpo-demographics.pmtiles';
const PMTILES_URL_ROAD = 'https://vector-tiles-testing.s3.us-east-2.amazonaws.com/brmpo_roads.pmtiles';
const PMTILES_URL_MCFRM = 'https://vector-tiles-testing.s3.us-east-2.amazonaws.com/brmpo_mcfrm.pmtiles';

// Initialize PMTiles objects (for caching metadata, etc.)
const p_demo = new pmtiles.PMTiles(PMTILES_URL_DEMO);
const p_road = new pmtiles.PMTiles(PMTILES_URL_ROAD);
const p_mcfrm = new pmtiles.PMTiles(PMTILES_URL_MCFRM);

// Register them with our protocol
protocol.add(p_demo);
protocol.add(p_road);
protocol.add(p_mcfrm);

document.addEventListener('DOMContentLoaded', () => {
  // ==============
  // SIDEBAR LOGIC
  // ==============
  const sidebar = document.getElementById('controls');
  const sidebarPosition = document.getElementById('sidebarPosition');
  const minimizeBtn = document.getElementById('minimizeSidebar');
  const maximizeBtn = document.getElementById('maximizeSidebar');
  const restoreBtn = document.getElementById('restoreSidebar');
  const mapContainer = document.getElementById('map');

  // Helper function to update sidebar position/size
  function updateSidebarPosition(position) {
    // Remove any existing position classes
    sidebar.classList.remove('left', 'right', 'bottom');
    sidebar.classList.add(position);

    // Reset any inline styles we might have changed
    sidebar.style.display = 'block';

    if (position === 'left') {
      // Sidebar on the left
      sidebar.style.width = '25%';
      sidebar.style.height = '100vh';
      sidebar.style.left = '0';
      sidebar.style.right = 'auto';
      sidebar.style.bottom = 'auto';
      
      mapContainer.style.left = '25%';
      mapContainer.style.right = '0';
      mapContainer.style.bottom = '0';

    } else if (position === 'right') {
      // Sidebar on the right
      sidebar.style.width = '25%';
      sidebar.style.height = '100vh';
      sidebar.style.right = '0';
      sidebar.style.left = 'auto';
      sidebar.style.bottom = 'auto';
      
      mapContainer.style.left = '0';
      mapContainer.style.right = '25%';
      mapContainer.style.bottom = '0';

    } else if (position === 'bottom') {
      // Sidebar at the bottom
      sidebar.style.width = '100%';
      sidebar.style.height = '25%';
      sidebar.style.bottom = '0';
      sidebar.style.left = '0';
      sidebar.style.right = '0';
      
      mapContainer.style.left = '0';
      mapContainer.style.right = '0';
      mapContainer.style.bottom = '25%';
    }
  }

  // Listen for changes in the dropdown
  sidebarPosition.addEventListener('change', (e) => {
    updateSidebarPosition(e.target.value);
  });

  // Minimize sidebar
  minimizeBtn.addEventListener('click', () => {
    sidebar.style.display = 'none';
    mapContainer.style.left = '0';
    mapContainer.style.right = '0';
    mapContainer.style.bottom = '0';
  });

  // Maximize sidebar
  maximizeBtn.addEventListener('click', () => {
    sidebar.style.display = 'block';
    sidebar.style.width = '75%';
    sidebar.style.height = '100vh';

    if (sidebar.classList.contains('left')) {
      sidebar.style.left = '0';
      mapContainer.style.left = '75%';
      mapContainer.style.right = '0';
      mapContainer.style.bottom = '0';
    } else if (sidebar.classList.contains('right')) {
      sidebar.style.right = '0';
      mapContainer.style.left = '0';
      mapContainer.style.right = '75%';
      mapContainer.style.bottom = '0';
    } else if (sidebar.classList.contains('bottom')) {
      sidebar.style.bottom = '0';
      sidebar.style.width = '100%';
      sidebar.style.height = '75%';
      mapContainer.style.left = '0';
      mapContainer.style.right = '0';
      mapContainer.style.bottom = '75%';
    }
  });

  // Restore sidebar
  restoreBtn.addEventListener('click', () => {
    updateSidebarPosition(sidebarPosition.value);
  });

  // Apply default position on page load
  updateSidebarPosition(sidebarPosition.value);


  // ===================
  // MAP INITIALIZATION
  // ===================
  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      // Our PMTiles are vector sources
      sources: {
        'brmpo_demo_tiles': {
          type: 'vector',
          url: `pmtiles://${PMTILES_URL_DEMO}`,
          attribution: '<a href="https://www.census.gov/">US Census</a>'
        },
        'brmpo_road_tiles': {
          type: 'vector',
          url: `pmtiles://${PMTILES_URL_ROAD}`,
          attribution: '<a href="https://gis.data.mass.gov/datasets/4ad165863b9c4dffa399a1eef89c0cf2/about">MassGIS</a>'
        },
        'brmpo_mcfrm_tiles': {
          type: 'vector',
          url: `pmtiles://${PMTILES_URL_MCFRM}`,
          attribution: '<a href="https://www.woodsholegroup.com/innovation/massachusetts-coast-flood-risk-model/">MCFRM</a>'
        }
      },
      layers: [
        // A simple background layer
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#eeeeee'
          }
        },
        // 2022 demographic data (PMTiles) layer example
        {
          id: 'demo',
          source: 'brmpo_demo_tiles',
          'source-layer': 'brmpo_tract', // <-- your actual source-layer name from the pmtiles
          type: 'fill',
          paint: {
            'fill-color': '#f2f2f2',
            'fill-outline-color': 'white',
            'fill-opacity': 1
          }
        },
        // MCFRM polygons: 2018
        {
          id: 'mcfrm_prob_2018',
          source: 'brmpo_mcfrm_tiles',
          'source-layer': 'mcfrm_prob_2018',
          type: 'fill',
          paint: {
            'fill-color': '#6dd1fc',
            'fill-outline-color': '#6dd1fc',
            'fill-opacity': 0.6
          }
        },
        // 2030
        {
          id: 'mcfrm_prob_2030',
          source: 'brmpo_mcfrm_tiles',
          'source-layer': 'mcfrm_prob_2030',
          type: 'fill',
          paint: {
            'fill-color': '#6dd1fc',
            'fill-outline-color': '#6dd1fc',
            'fill-opacity': 0.4
          }
        },
        // 2050
        {
          id: 'mcfrm_prob_2050',
          source: 'brmpo_mcfrm_tiles',
          'source-layer': 'mcfrm_prob_2050',
          type: 'fill',
          paint: {
            'fill-color': '#6dd1fc',
            'fill-outline-color': '#6dd1fc',
            'fill-opacity': 0.2
          }
        },
        // 2070
        {
          id: 'mcfrm_prob_2070',
          source: 'brmpo_mcfrm_tiles',
          'source-layer': 'mcfrm_prob_2070',
          type: 'fill',
          paint: {
            'fill-color': '#6dd1fc',
            'fill-outline-color': '#6dd1fc',
            'fill-opacity': 0.1
          }
        },
        // Major roads (casing)
        {
          id: 'roads_major_casing',
          source: 'brmpo_road_tiles',
          'source-layer': 'roads_major',
          type: 'line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#fff',
            'line-gap-width': 1.2
          }
        },
        // All roads
        {
          id: 'roads_mpo',
          source: 'brmpo_road_tiles',
          'source-layer': 'roads_brmpo',
          type: 'line',
          minzoom: 11,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#b0b0b0',
            'line-width': 0.25
          }
        },
        // Major roads
        {
          id: 'roads_major',
          source: 'brmpo_road_tiles',
          'source-layer': 'roads_major',
          type: 'line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#bfbfbf',
            'line-width': 1.1
          }
        }
      ]
    },
    // Default center/zoom if we don't have bounds
    center: [-95, 39],
    zoom: 4
  });

  // Add a Navigation Control (zoom in/out, rotate, etc.)
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // =============
  // LOAD GEOJSON
  // =============
  map.on('load', () => {
    fetch('data/in_progress_taz_jan21.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(geojsonData => {
        // Add as a new source
        map.addSource('tazData', {
          type: 'geojson',
          data: geojsonData
        });

        // Population layer (persns19)
        map.addLayer({
          id: 'populationLayer',
          type: 'fill',
          source: 'tazData',
          paint: {
            'fill-color': '#1f78b4', // blue
            'fill-opacity': 0.6
          }
        });

        // Employment layer (workrs19)
        map.addLayer({
          id: 'employmentLayer',
          type: 'fill',
          source: 'tazData',
          paint: {
            'fill-color': '#33a02c', // green
            'fill-opacity': 0.6
          }
        });

        // Optional TAZ outline
        map.addLayer({
          id: 'tazOutline',
          type: 'line',
          source: 'tazData',
          paint: {
            'line-color': '#333',
            'line-width': 1
          }
        });

        // Fit map to the bounding box of the TAZ data
        const bounds = turf.bbox(geojsonData);
        if (bounds && Number.isFinite(bounds[0])) {
          map.fitBounds(bounds, { padding: 30 });
        } else {
          console.warn('Could not compute valid bounds for GeoJSON data.');
        }

        // Now hook up our checkboxes & sliders
        setupControls();
      })
      .catch(err => {
        console.error('Error loading or parsing TAZ GeoJSON:', err);
      });
  });
});

/**
 * Sets up the checkboxes and sliders for population/employment layers.
 */
function setupControls() {
  // Checkboxes
  const persCheck = document.getElementById('persCheckbox');
  const workrsCheck = document.getElementById('workrsCheckbox');

  // Population layer toggle
  persCheck.addEventListener('change', () => {
    toggleLayerVisibility('populationLayer', persCheck.checked);
  });

  // Employment layer toggle
  workrsCheck.addEventListener('change', () => {
    toggleLayerVisibility('employmentLayer', workrsCheck.checked);
  });

  // Sliders + text
  const persSlider = document.getElementById('persnsSlider');
  const persValue = document.getElementById('persnsValue');
  const workrsSlider = document.getElementById('workrsSlider');
  const workrsValue = document.getElementById('workrsValue');

  // Update visible text on page load
  persValue.textContent = persSlider.value;
  workrsValue.textContent = workrsSlider.value;

  // Population slider
  persSlider.addEventListener('input', () => {
    persValue.textContent = persSlider.value;
    applyPopulationFilter();
  });

  // Employment slider
  workrsSlider.addEventListener('input', () => {
    workrsValue.textContent = workrsSlider.value;
    applyEmploymentFilter();
  });
}

/**
 * Show/hide a layer by changing the layout property.
 */
function toggleLayerVisibility(layerId, isVisible) {
  map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
}

/**
 * Filter polygons in 'populationLayer' to those with persns19 >= slider value.
 */
function applyPopulationFilter() {
  const sliderValue = parseInt(document.getElementById('persnsSlider').value, 10);
  map.setFilter('populationLayer', [
    '>=',
    ['get', 'persns19'],
    sliderValue
  ]);
}

/**
 * Filter polygons in 'employmentLayer' to those with workrs19 >= slider value.
 */
function applyEmploymentFilter() {
  const sliderValue = parseInt(document.getElementById('workrsSlider').value, 10);
  map.setFilter('employmentLayer', [
    '>=',
    ['get', 'workrs19'],
    sliderValue
  ]);
}
