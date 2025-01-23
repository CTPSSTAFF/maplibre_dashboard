let map;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the map with a plain background
  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      // No raster sources; just an empty object
      sources: {},
      layers: [
        {
          // A simple background layer so we have a neutral backdrop
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#eeeeee' // light grey
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
