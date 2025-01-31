// sidebar.js
(function() {
  let drawer, drawerHandle, drawerContent;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  // For the popup
  let settingsPopup, drawerAlignmentSelect, closeSettingsBtn;
  
  // For the toggle
  let toggleDrawerBtn;
  
  // Called once from app.js
  function initSidebar() {
    drawer = document.getElementById('drawer');
    drawerHandle = document.getElementById('drawerHandle');
    drawerContent = document.getElementById('drawerContent');

    settingsPopup = document.getElementById('settingsPopup');
    drawerAlignmentSelect = document.getElementById('drawerAlignment');
    closeSettingsBtn = document.getElementById('closeSettingsBtn');
    toggleDrawerBtn = document.getElementById('toggleDrawerBtn');
    
    // Event for starting drag
    drawerHandle.addEventListener('mousedown', onDragStart);
    drawerHandle.addEventListener('touchstart', onDragStart, {passive: false});

    // Settings popup
    closeSettingsBtn.addEventListener('click', () => {
      settingsPopup.classList.add('hidden');
    });
    drawerAlignmentSelect.addEventListener('change', (e) => {
      setDrawerAlignment(e.target.value);
    });

    // Drawer toggle
    toggleDrawerBtn.addEventListener('click', toggleDrawer);

    // Listen for mouse move/up on the entire document
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    // For mobile
    document.addEventListener('touchmove', onDragMove, {passive: false});
    document.addEventListener('touchend', onDragEnd);

    // Initialize alignment to whatever is set in <select>
    setDrawerAlignment(drawerAlignmentSelect.value);
  }

  // Start dragging
  function onDragStart(e) {
    e.preventDefault();
    isDragging = true;

    if (drawer.classList.contains('left') || drawer.classList.contains('right')) {
      // For left/right alignment, we handle horizontal dimension
      startX = e.pageX || (e.touches && e.touches[0].pageX);
      startWidth = drawer.offsetWidth;
    } else if (drawer.classList.contains('bottom')) {
      // For bottom alignment, we handle vertical dimension
      startY = e.pageY || (e.touches && e.touches[0].pageY);
      startHeight = drawer.offsetHeight;
    }
  }

  // Called on mouse/touch move
  function onDragMove(e) {
    if (!isDragging) return;

    // Prevent scrolling on touch devices while dragging
    e.preventDefault();
    
    if (drawer.classList.contains('left')) {
      const currentX = e.pageX || (e.touches && e.touches[0].pageX);
      const newWidth = Math.max(100, Math.min(window.innerWidth - 50, startWidth + (currentX - startX)));
      drawer.style.width = newWidth + 'px';
    } 
    else if (drawer.classList.contains('right')) {
      const currentX = e.pageX || (e.touches && e.touches[0].pageX);
      const newWidth = Math.max(100, Math.min(window.innerWidth - 50, startWidth - (currentX - startX)));
      drawer.style.width = newWidth + 'px';
    } 
    else if (drawer.classList.contains('bottom')) {
      const currentY = e.pageY || (e.touches && e.touches[0].pageY);
      const newHeight = Math.max(50, Math.min(window.innerHeight - 50, startHeight - (currentY - startY)));
      drawer.style.height = newHeight + 'px';
    }
  }

  // Stop dragging
  function onDragEnd(e) {
    isDragging = false;
  }

  // Programmatically change alignment
  function setDrawerAlignment(alignment) {
    drawer.classList.remove('left', 'right', 'bottom');
    drawer.classList.add(alignment);

    // Reset size for each alignment
    if (alignment === 'left' || alignment === 'right') {
      drawer.style.width = '300px';
      drawer.style.height = '';
    } else if (alignment === 'bottom') {
      drawer.style.height = '200px';
      drawer.style.width = '100%';
    }
  }

  // Expand/collapse the drawer with a button
  let isCollapsed = false;
  function toggleDrawer() {
    if (!isCollapsed) {
      // Collapse
      drawer.style.display = 'none';
      isCollapsed = true;
    } else {
      // Expand
      drawer.style.display = 'block';
      isCollapsed = false;
    }
  }

  // Provide a function to show the settings popup
  function openSettings() {
    settingsPopup.classList.remove('hidden');
  }

  // Expose methods
  window.Sidebar = {
    initSidebar,
    openSettings
  };
})();
