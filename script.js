let map;

 // add the PMTiles plugin to the maplibregl global.
const protocol = new pmtiles.Protocol();

maplibregl.addProtocol('pmtiles', (request) => {
  return new Promise((resolve, reject) => {
    const callback = (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({data});
      }
    };
    protocol.tile(request, callback);
  });
});

const PMTILES_URL_DEMO = 'https://vector-tiles-testing.s3.us-east-2.amazonaws.com/brmpo-demographics.pmtiles';
const PMTILES_URL_ROAD = 'https://vector-tiles-testing.s3.us-east-2.amazonaws.com/brmpo_roads.pmtiles';
const PMTILES_URL_MCFRM = 'https://vector-tiles-testing.s3.us-east-2.amazonaws.com/brmpo_mcfrm.pmtiles';

const p_demo = new pmtiles.PMTiles(PMTILES_URL_DEMO);
const p_road = new pmtiles.PMTiles(PMTILES_URL_ROAD);
const p_mcfrm= new pmtiles.PMTiles(PMTILES_URL_MCFRM);

protocol.add(p_demo);
protocol.add(p_road);
protocol.add(p_mcfrm);

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the map with a plain background
  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      // No raster sources; just an empty object
      // sourcing pmtiles from S3 storage
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
        {
          // A simple background layer so we have a neutral backdrop
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#eeeeee' // light grey
          },

        },
        {
          // 2022 demographic data
          'id': 'demo',
          'source': 'brmpo_demo_tiles',
          'source-layer': 'brmpo_tract',
          'type': 'fill',
          'paint': {
            'fill-color': '#f2f2f2',
            'fill-outline-color': 'white',
            'fill-opacity': 1
          }
        },
        {
          // MCFRM polygons to show coastal flood risk, 2018
          'id': 'mcfrm_prob_2018',
          'source': 'brmpo_mcfrm_tiles',
          'source-layer': 'mcfrm_prob_2018',
          'type': 'fill',
          'paint': {
            'fill-color': '#6dd1fc',
            'fill-outline-color': '#6dd1fc',
            'fill-opacity': .6
          }
        },
        {
          // MCFRM polygons to show coastal flood risk, 2030
          'id': 'mcfrm_prob_2030',
          'source': 'brmpo_mcfrm_tiles',
          'source-layer': 'mcfrm_prob_2030',
          'type': 'fill',
          'paint': {
            'fill-color': '#6dd1fc',
            'fill-outline-color': '#6dd1fc',
            'fill-opacity': .4

          }
        },
        {
          // MCFRM polygons to show coastal flood risk, 2050
          'id': 'mcfrm_prob_2050',
          'source': 'brmpo_mcfrm_tiles',
          'source-layer': 'mcfrm_prob_2050',
          'type': 'fill',
          'paint': {
            'fill-color': '#6dd1fc',
            'fill-outline-color':'#6dd1fc',
            'fill-opacity': .2

          }
        },
        {
          // MCFRM polygons to show coastal flood risk, 2070
          'id': 'mcfrm_prob_2070',
          'source': 'brmpo_mcfrm_tiles',
          'source-layer': 'mcfrm_prob_2070',
          'type': 'fill',
          'paint': {
            'fill-color': '#6dd1fc',
            'fill-outline-color':'#6dd1fc',
            'fill-opacity': .1

          }
        },
        {
          // Road Inventory major roads
          'id': 'roads_major_casing',
          'source': 'brmpo_road_tiles',
          'source-layer': 'roads_major',
          'type': 'line',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#fff',
            'line-gap-width': 1.2

          }
        },
        {
          // Road Inventory all roads
          'id': 'roads_mpo',
          'source': 'brmpo_road_tiles',
          'source-layer': 'roads_brmpo',
          'type': 'line',
          'minzoom': 11,
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#b0b0b0',
            'line-width': .25
          }
        },
        {
          // Road Inventory major roads
          'id': 'roads_major',
          'source': 'brmpo_road_tiles',
          'source-layer': 'roads_major',
          'type': 'line',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#bfbfbf',
            'line-width': 1.1

          }
        }
      ]
    },
    // A default center/zoom in case we can't fit bounds
    center: [-95, 39],
    zoom: 4
  });

  // Add standard navigation control
map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // When the map finishes loading, fetch & add our GeoJSON
map.on('load', () => {
  fetch('data/in_progress_taz_jan21.geojson')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log('GeoJSON fetch response:', response);
    return response.json();
  })
  .then(geojsonData => {
    console.log('Loaded GeoJSON data:', geojsonData);

        // Add the GeoJSON as a source
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
            // Distinct color so we can see it easily
            'fill-color': '#1f78b4', // a blue-ish color
            'fill-opacity': 0.6
          }
        });

        // Employment layer (workrs19)
    map.addLayer({
      id: 'employmentLayer',
      type: 'fill',
      source: 'tazData',
      paint: {
            'fill-color': '#33a02c', // green-ish
            'fill-opacity': 0.6
          }
        });

        // Optional outline for polygons
    map.addLayer({
      id: 'tazOutline',
      type: 'line',
      source: 'tazData',
      paint: {
        'line-color': '#333',
        'line-width': 1
      }
    });

        // Fit the map to the bounding box of the data
    const bounds = turf.bbox(geojsonData);
    console.log('Computed bounds:', bounds);
    if (bounds && Number.isFinite(bounds[0])) {
      map.fitBounds(bounds, { padding: 30 });
    } else {
      console.warn('Could not compute valid bounds for GeoJSON data.');
    }

        // Setup UI controls (checkboxes, sliders)
    setupControls();
  })
  .catch(err => {
    console.error('Error loading or parsing GeoJSON:', err);
  });
});
});

/**
 * Attaches event listeners to our checkboxes and sliders.
 */
function setupControls() {
  // --- Checkboxes ---
  const persCheck = document.getElementById('persCheckbox');
  const workrsCheck = document.getElementById('workrsCheckbox');

  // Toggling population layer
  persCheck.addEventListener('change', () => {
    toggleLayerVisibility('populationLayer', persCheck.checked);
  });
  // Toggling employment layer
  workrsCheck.addEventListener('change', () => {
    toggleLayerVisibility('employmentLayer', workrsCheck.checked);
  });

  // --- Sliders ---
  const persSlider = document.getElementById('persnsSlider');
  const persValue = document.getElementById('persnsValue');
  const workrsSlider = document.getElementById('workrsSlider');
  const workrsValue = document.getElementById('workrsValue');

  // Show initial slider values
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
 * Filter polygons in populationLayer to those with persns19 >= slider value.
 */
function applyPopulationFilter() {
  const sliderValue = parseInt(document.getElementById('persnsSlider').value, 10);
  console.log('[Population Filter] persns19 >=', sliderValue);

  map.setFilter('populationLayer', [
    '>=',
    ['get', 'persns19'],
    sliderValue
  ]);
}

/**
 * Filter polygons in employmentLayer to those with workrs19 >= slider value.
 */
function applyEmploymentFilter() {
  const sliderValue = parseInt(document.getElementById('workrsSlider').value, 10);
  console.log('[Employment Filter] workrs19 >=', sliderValue);

  map.setFilter('employmentLayer', [
    '>=',
    ['get', 'workrs19'],
    sliderValue
  ]);
}
