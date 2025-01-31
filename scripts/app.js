// app.js
(function() {
  function init() {
    // Initialize our drawer logic
    Sidebar.initSidebar();

    // Initialize the MapLibre map + PMTiles
    MapModule.initMap();

    // Wire up the "Settings" button to open the popup
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    openSettingsBtn.addEventListener('click', () => {
      Sidebar.openSettings();
    });
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
