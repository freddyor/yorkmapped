// MapComponent.tsx
import React, { useEffect, useState } from 'react';
import { buildings } from '../data/buildings';
import { locations } from '../data/locations';

// Sample function to load Mapbox styles and scripts
const loadMapboxCSS = () => {
  const mapboxCSS = document.createElement('link');
  mapboxCSS.href = "./assets/mapbox-gl/mapbox-gl.css";
  mapboxCSS.rel = "stylesheet";
  document.head.appendChild(mapboxCSS);
};

const loadMapboxScript = (onLoad: () => void) => {
  const mapboxScript = document.createElement('script');
  mapboxScript.src = "./assets/mapbox-gl/mapbox-gl.js";
  mapboxScript.defer = true;
  mapboxScript.onload = onLoad;
  document.body.appendChild(mapboxScript);
};

const MapComponent: React.FC = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  useEffect(() => {
    loadMapboxCSS();
    loadMapboxScript(() => {
      mapboxgl.accessToken = 'pk.eyJ1IjoiZnJlZGRvbWF0ZSIsImEiOiJjbTc1bm5zYnQwaG1mMmtxeDdteXNmeXZ0In0.PuDNORq4qExIJ_fErdO_8g';
      initializeMap();
    });
  }, []);

  const initializeMap = () => {
    const mapInstance = new mapboxgl.Map({
      container: 'map', // Map container ID
      style: 'mapbox://styles/freddomate/cm8q8wtwx00a801qzdayccnvz',
      center: [-1.0835104081554843, 53.95838745239521], // Default York coordinates
      zoom: 15,
      pitch: 45,
      bearing: -17.6,
    });

    setMap(mapInstance);
    addBuildingMarkers(mapInstance);
    addLocationMarkers(mapInstance);
  };

  const addBuildingMarkers = (mapInstance: mapboxgl.Map) => {
    buildings.forEach(building => {
      const outlineColor = building.colour === "yes" ? '#FF69B4' : '#FFFFFF';
      const { element: markerElement } = createCustomMarker(building.image, outlineColor, false);
      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(building.coords)
        .addTo(mapInstance);

      marker.getElement().addEventListener('click', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
        const videoUrl = building.videoUrl;
        if (videoUrl) {
          const videoElement = document.createElement('video');
          videoElement.src = videoUrl;
          videoElement.style.display = 'none'; 
          videoElement.controls = true;
          videoElement.autoplay = true;

          document.body.appendChild(videoElement);

          videoElement.play();
          if (videoElement.requestFullscreen) {
            videoElement.requestFullscreen();
          }

          videoElement.addEventListener('ended', () => {
            document.body.removeChild(videoElement);
          });
        } else {
          console.error('Video URL not available for this building.');
        }
      });
    });
  };

  const addLocationMarkers = (mapInstance: mapboxgl.Map) => {
    locations.forEach(location => {
      const { element: markerElement } = createCustomMarker(location.image, '#FFFFFF', true);
      markerElement.className += ' location-marker';
      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(location.coords)
        .addTo(mapInstance);

      marker.getElement().addEventListener('click', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
        const contentHTML = createPopupContent(location);
        toggleBottomSheet(contentHTML);
      });
    });
  };

  const createCustomMarker = (imageUrl: string, color = '#9b4dca', isLocation = false) => {
    const markerDiv = document.createElement('div');
    markerDiv.className = 'custom-marker';
    markerDiv.style.width = '3em';
    markerDiv.style.height = '3em';
    markerDiv.style.position = 'absolute';
    markerDiv.style.borderRadius = '50%';
    markerDiv.style.border = `0.15em solid ${color}`;
    markerDiv.style.boxSizing = 'border-box';
    markerDiv.style.overflow = 'hidden';

    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    imageElement.style.width = '100%';
    imageElement.style.height = '100%';
    imageElement.style.objectFit = 'cover';
    imageElement.style.borderRadius = '50%';

    markerDiv.appendChild(imageElement);

    return { element: markerDiv, id: `marker-${Date.now()}-${Math.random()}` };
  };

  const toggleBottomSheet = (contentHTML: string) => {
    if (bottomSheetOpen) {
      document.getElementById('bottom-sheet')!.style.bottom = '-100%';
    } else {
      document.getElementById('bottom-sheet')!.innerHTML = contentHTML;
      document.getElementById('bottom-sheet')!.style.bottom = '0';
    }
    setBottomSheetOpen(!bottomSheetOpen);
  };

  const createPopupContent = (location: any) => {
    return `
      <div style="text-align: center; padding: 0; margin: 0;">
        <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px;">${location.description}</p>
        <img src="${location.image}" alt="${location.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />
        <div style="font-size: 20px; font-weight: bold; margin-top: 0;">${location.name}</div>
      </div>
    `;
  };

  return (
    <>
      <div id="map" style={{ width: '100%', height: '100vh' }}></div>
      <div
        id="bottom-sheet"
        style={{
          position: 'fixed',
          bottom: '-100%',
          left: 0,
          right: 0,
          background: 'white',
          transition: 'bottom 0.3s',
        }}
      />
    </>
  );
};

export default MapComponent;
