// map.js
(function() {
  let map;
  
  // PMTiles protocol setup (this is your existing code, refactored)
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

  // Create PMTiles objects (for caching metadata, etc.)
  const p_demo = new pmtiles.PMTiles(PMTILES_URL_DEMO);
  const p_road = new pmtiles.PMTiles(PMTILES_URL_ROAD);
  const p_mcfrm = new pmtiles.PMTiles(PMTILES_URL_MCFRM);

  // Register them
  protocol.add(p_demo);
  protocol.add(p_road);
  protocol.add(p_mcfrm);

  // Build and expose a function to init the map
  function initMap() {
    map = new maplibregl.Map({
      container: 'map',
      style: {
        version: 8,
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
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#eeeeee'
            }
          },
          {
            id: 'demo',
            source: 'brmpo_demo_tiles',
            'source-layer': 'brmpo_tract',
            type: 'fill',
            paint: {
              'fill-color': '#f2f2f2',
              'fill-outline-color': 'white',
              'fill-opacity': 1
            }
          },
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
          // Road layers...
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
      center: [-95, 39],
      zoom: 4
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Wait for the map to be “load”ed before adding TAZ geojson
    map.on('load', () => {
      loadTAZData();
    });
  }

  function loadTAZData() {
    fetch('data/in_progress_taz_jan21.geojson')
      .then(resp => {
        if (!resp.ok) throw new Error('Network error loading TAZ');
        return resp.json();
      })
      .then(geojsonData => {
        map.addSource('tazData', { type: 'geojson', data: geojsonData });

        // Population layer
        map.addLayer({
          id: 'populationLayer',
          type: 'fill',
          source: 'tazData',
          paint: {
            'fill-color': '#1f78b4',
            'fill-opacity': 0.6
          }
        });

        // Employment layer
        map.addLayer({
          id: 'employmentLayer',
          type: 'fill',
          source: 'tazData',
          paint: {
            'fill-color': '#33a02c',
            'fill-opacity': 0.6
          }
        });

        // Outline
        map.addLayer({
          id: 'tazOutline',
          type: 'line',
          source: 'tazData',
          paint: {
            'line-color': '#333',
            'line-width': 1
          }
        });

        // Fit bounds if we have valid data
        const bounds = turf.bbox(geojsonData);
        if (bounds && Number.isFinite(bounds[0])) {
          map.fitBounds(bounds, { padding: 30 });
        }

        // Hook checkboxes & sliders after data is added
        hookUIControls();
      })
      .catch(err => console.error('Error loading TAZ data:', err));
  }

  function hookUIControls() {
    // Population checkbox
    const persCheck = document.getElementById('persCheckbox');
    // Employment checkbox
    const workrsCheck = document.getElementById('workrsCheckbox');

    // Sliders
    const persSlider = document.getElementById('persnsSlider');
    const persValue = document.getElementById('persnsValue');
    const workrsSlider = document.getElementById('workrsSlider');
    const workrsValue = document.getElementById('workrsValue');

    // Initial text
    persValue.textContent = persSlider.value;
    workrsValue.textContent = workrsSlider.value;

    // Toggle population layer
    persCheck.addEventListener('change', () => {
      toggleLayer('populationLayer', persCheck.checked);
    });
    // Toggle employment layer
    workrsCheck.addEventListener('change', () => {
      toggleLayer('employmentLayer', workrsCheck.checked);
    });

    // Slider logic
    persSlider.addEventListener('input', () => {
      persValue.textContent = persSlider.value;
      applyPopulationFilter(parseInt(persSlider.value, 10));
    });
    workrsSlider.addEventListener('input', () => {
      workrsValue.textContent = workrsSlider.value;
      applyEmploymentFilter(parseInt(workrsSlider.value, 10));
    });
  }

  function toggleLayer(layerId, show) {
    map.setLayoutProperty(
      layerId,
      'visibility',
      show ? 'visible' : 'none'
    );
  }

  function applyPopulationFilter(value) {
    map.setFilter('populationLayer', [
      '>=', ['get', 'persns19'], value
    ]);
  }

  function applyEmploymentFilter(value) {
    map.setFilter('employmentLayer', [
      '>=', ['get', 'workrs19'], value
    ]);
  }

  // Expose an object on window so we can init from app.js
  window.MapModule = {
    initMap
  };
})();
