import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryLayout from './DeliveryLayout';
import './Routes.css';

const Routes = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState('');
  const mapRef = useRef(null);
  
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedRoute, setGeneratedRoute] = useState(null);

  // Map state management
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Create interactive map using simple HTML5 and SVG
  const createInteractiveMap = () => {
    console.log('createInteractiveMap called, mapRef:', mapRef.current);
    
    if (!mapRef.current) {
      console.log('mapRef.current is null, cannot create map');
      return;
    }

    try {
      console.log('Creating interactive map...');
      // Clear any existing content
      mapRef.current.innerHTML = '';

      // Create map container
      const mapContainer = document.createElement('div');
      mapContainer.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #e8f4f8 0%, #d1ecf1 50%, #b8e6ff 100%);
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        cursor: grab;
      `;

      // Create grid pattern for map appearance
      const gridSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      gridSvg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.3;
      `;
      gridSvg.innerHTML = `
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#2563eb" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      `;

      // Create center marker (Colombo)
      const centerMarker = document.createElement('div');
      centerMarker.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        background: #2563eb;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        z-index: 10;
      `;
      centerMarker.title = 'Delivery Center - Colombo';

      // Create info panel
      const infoPanel = document.createElement('div');
      infoPanel.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(255,255,255,0.95);
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: Inter, sans-serif;
        z-index: 20;
        min-width: 200px;
      `;
      infoPanel.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <div style="width: 12px; height: 12px; background: #2563eb; border-radius: 50%;"></div>
          <strong style="color: #1e293b;">Interactive Route Map</strong>
        </div>
        <div style="font-size: 0.9rem; color: #64748b; line-height: 1.4;">
          📍 Center: Colombo, Sri Lanka<br>
          🚛 Ready for route visualization<br>
          ✨ Click "Generate Best Route" to see delivery paths
        </div>
      `;

      // Assemble the map
      mapContainer.appendChild(gridSvg);
      mapContainer.appendChild(centerMarker);
      mapContainer.appendChild(infoPanel);
      mapRef.current.appendChild(mapContainer);

      // Add interactive hover effects
      centerMarker.addEventListener('mouseenter', () => {
        centerMarker.style.transform = 'translate(-50%, -50%) scale(1.2)';
        centerMarker.style.background = '#1d4ed8';
      });

      centerMarker.addEventListener('mouseleave', () => {
        centerMarker.style.transform = 'translate(-50%, -50%) scale(1)';
        centerMarker.style.background = '#2563eb';
      });

      setMapLoaded(true);
      setMapError(false);
      console.log('Interactive map created successfully');

    } catch (error) {
      console.error('Error creating interactive map:', error);
      setMapError(true);
      // Fallback to simple visible content
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            border-radius: 8px;
          ">
            <div style="text-align: center;">
              <h2 style="margin: 0 0 10px 0;">🗺️ Interactive Map</h2>
              <p style="margin: 0;">Map system ready</p>
            </div>
          </div>
        `;
      }
    }
  };

  // Display route information with visual path
  const displayRouteInPlaceholder = (route) => {
    if (!mapRef.current) return;
    
    try {
      const addresses = JSON.parse(route.deliveryAddresses);
      
      // Clear and recreate map container
      mapRef.current.innerHTML = '';

      // Create interactive route visualization
      const routeContainer = document.createElement('div');
      routeContainer.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #e8f4f8 0%, #d1ecf1 50%, #b8e6ff 100%);
        position: relative;
        overflow: hidden;
        border-radius: 12px;
      `;

      // Create SVG for route visualization
      const routeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      routeSvg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      `;

      // Create route path
      const pathPoints = addresses.map((_, index) => {
        const angle = (index / addresses.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 120;
        const centerX = 250;
        const centerY = 200;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        };
      });

      // Draw route path
      const pathD = pathPoints.reduce((path, point, index) => {
        return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
      }, '') + ' Z';

      routeSvg.innerHTML = `
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
           refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
          </marker>
        </defs>
        <path d="${pathD}" stroke="#2563eb" stroke-width="3" fill="none" 
              stroke-dasharray="5,5" marker-mid="url(#arrowhead)" opacity="0.8"/>
        ${pathPoints.map((point, index) => `
          <circle cx="${point.x}" cy="${point.y}" r="8" fill="#10b981" stroke="white" stroke-width="2"/>
          <text x="${point.x}" y="${point.y - 15}" text-anchor="middle" font-size="12" fill="#1e293b" font-weight="600">
            ${index + 1}
          </text>
        `).join('')}
        <circle cx="250" cy="200" r="12" fill="#2563eb" stroke="white" stroke-width="3"/>
        <text x="250" y="180" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="700">HQ</text>
      `;

      // Create info panel with route details
      const infoPanel = document.createElement('div');
      infoPanel.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.95);
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-family: Inter, sans-serif;
        z-index: 20;
        max-width: 250px;
      `;
      infoPanel.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></div>
          <strong style="color: #1e293b; font-size: 1.1rem;">${route.routeName}</strong>
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 10px;">
          <div style="text-align: center; padding: 8px; background: #e3f2fd; border-radius: 6px; flex: 1;">
            <div style="color: #1976d2; font-weight: 600; font-size: 0.9rem;">📏 Distance</div>
            <div style="color: #1e293b; font-weight: 700;">${route.totalDistance || 'N/A'} km</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #fff3e0; border-radius: 6px; flex: 1;">
            <div style="color: #f57f17; font-weight: 600; font-size: 0.9rem;">⏱️ Duration</div>
            <div style="color: #1e293b; font-weight: 700;">${route.estimatedDuration || 'N/A'} min</div>
          </div>
        </div>
        <div style="color: #64748b; font-size: 0.9rem; text-align: center;">
          🚛 ${addresses.length} delivery stops optimized
        </div>
      `;

      // Assemble the route visualization
      routeContainer.appendChild(routeSvg);
      routeContainer.appendChild(infoPanel);
      mapRef.current.appendChild(routeContainer);

      console.log('Route visualization created successfully');
      
    } catch (error) {
      console.error('Error displaying route visualization:', error);
      // Show error message
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="
            width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
            background: #fee; border: 2px solid #f44336; border-radius: 8px;
          ">
            <div style="text-align: center; color: #d32f2f;">
              <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
              <h3>Map Error</h3>
              <p>Unable to display route visualization</p>
            </div>
          </div>
        `;
      }
    }
  };

  // Initialize map after component mounts
  useEffect(() => {
    const initializeMap = () => {
      console.log('initializeMap called, mapRef.current:', mapRef.current);
      
      if (mapRef.current) {
        console.log('Map container found, dimensions:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
        console.log('Map container styles:', window.getComputedStyle(mapRef.current));
        
        // Create the interactive map
        console.log('Calling createInteractiveMap...');
        createInteractiveMap();
        
        // Set map loaded state
        setMapLoaded(true);
      } else {
        console.log('Map ref not ready, retrying in 500ms...');
        setTimeout(() => initializeMap(), 500);
      }
    };

    // Add a longer initial delay to ensure React has rendered the DOM
    setTimeout(() => {
      console.log('Starting map initialization...');
      initializeMap();
    }, 500);
  }, []);

  // Fetch routes from backend
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('http://localhost:8090/api/delivery/routes');
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  // Generate best route function
  const generateBestRoute = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8090/api/delivery/routes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const route = await response.json();
        setGeneratedRoute(route);
        alert(`Route generated successfully!\nRoute: ${route.routeName}\nTotal Stops: ${route.deliveryAddresses ? JSON.parse(route.deliveryAddresses).length : 0}`);
        
        // Refresh routes list
        fetchRoutes();
        
        // Display route on map
        displayRouteInPlaceholder(route);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to generate route'}`);
      }
    } catch (error) {
      console.error('Error generating route:', error);
      alert('Error generating route. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Map control functions (interactive map controls)
  const handleZoomIn = () => {
    // Refresh or enhance the interactive map
    if (mapRef.current) {
      const mapContainer = mapRef.current.firstChild;
      if (mapContainer) {
        mapContainer.style.transform = 'scale(1.1)';
        setTimeout(() => {
          mapContainer.style.transform = 'scale(1)';
        }, 200);
      }
    }
  };

  const handleZoomOut = () => {
    // Reset the interactive map
    createInteractiveMap();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Visited':
        return 'visited';
      case 'Pending':
        return 'pending';
      case 'Skipped':
        return 'skipped';
      default:
        return 'pending';
    }
  };

  return (
    <DeliveryLayout activeTab="routes">
      <div className="delivery-page">
        <div className="delivery-page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="delivery-page-title">Route Management</h1>
              <p className="delivery-page-subtitle">Plan and manage your delivery routes</p>
            </div>
            <div className="header-actions">
              <button 
                className="generate-route-btn" 
                onClick={generateBestRoute}
                disabled={loading}
              >
                <span className="btn-icon">🗺️</span>
                <span className="btn-text">
                  {loading ? 'Generating...' : 'Generate Best Route'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="delivery-card">
          <div className="routes-content">
            {/* Routes List Panel */}
            <div className="routes-panel">
              <div className="route-header">
                <div className="route-info">
                  <div className="route-location">
                    <span className="route-name">{selectedRoute}</span>
                  </div>
                </div>
              </div>

              <div className="route-stops">
                {routes.length > 0 ? (
                  routes.map((route, index) => (
                    <div key={route.routeId} className="route-item">
                      <div className="route-details">
                        <div className="route-title">{route.routeName}</div>
                        <div className="route-info-row">
                          <span className="route-distance">
                            📏 {route.totalDistance || 0} km
                          </span>
                          <span className="route-duration">
                            ⏱️ {route.estimatedDuration || 0} min
                          </span>
                        </div>
                        <div className="route-status">
                          <span className={`status-badge ${route.status}`}>
                            {route.status}
                          </span>
                        </div>
                        <div className="route-addresses">
                          {route.deliveryAddresses && (
                            <div className="addresses-count">
                              📍 {JSON.parse(route.deliveryAddresses).length} stops
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-routes">
                    <p>No routes generated yet.</p>
                    <p>Click "Generate Best Route" to create an optimized delivery route.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Map Panel */}
            <div className="map-panel">
              <div className="map-header">
                <div className="map-title">
                  <h3>🗺️ Delivery Route Map</h3>
                </div>
                <div className="map-controls">
                  <button className="map-control-btn" onClick={handleZoomIn} title="Zoom In">+</button>
                  <button className="map-control-btn" onClick={handleZoomOut} title="Refresh">⟲</button>
                </div>
              </div>
              <div className="map-container">
                <div 
                  ref={mapRef}
                  className="interactive-map"
                  style={{
                    width: '100%',
                    height: '450px',
                    minHeight: '450px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default Routes;