const GOOGLE_MAPS_API_KEY = 'AIzaSyCUOWa5bYLkBoO0UkrTSm4umHSoCq9OjzQ';

let loadPromise = null;

export function loadGoogleMaps() {
  if (loadPromise) return loadPromise;

  // Already loaded
  if (window.google && window.google.maps) {
    loadPromise = Promise.resolve(window.google.maps);
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = '__googleMapsLoaded__';

    window[callbackName] = () => {
      resolve(window.google.maps);
      delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a2035' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e3a2a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3a55' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#374775' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1a2e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
];

export function makeMarkerSvg(color, pulse = false) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
    ${pulse ? `<circle cx="19" cy="19" r="16" fill="${color}" opacity="0.3">
      <animate attributeName="r" values="12;20;12" dur="1.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.4;0;0.4" dur="1.6s" repeatCount="indefinite"/>
    </circle>` : ''}
    <path d="M19 2C10.7 2 4 8.7 4 17c0 11.25 15 29 15 29s15-17.75 15-29C34 8.7 27.3 2 19 2z"
      fill="#0f172a" stroke="${color}" stroke-width="2.5"/>
    <circle cx="19" cy="17" r="7" fill="${color}"/>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}
