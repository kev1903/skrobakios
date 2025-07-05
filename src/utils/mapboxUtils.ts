import mapboxgl from 'mapbox-gl';

export interface ViewState {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
  timestamp: number;
}

export const saveCurrentView = (map: mapboxgl.Map): ViewState | null => {
  if (!map) return null;
  
  const center = map.getCenter();
  const zoom = map.getZoom();
  const bearing = map.getBearing();
  const pitch = map.getPitch();
  
  const viewState: ViewState = {
    center: [center.lng, center.lat],
    zoom,
    bearing,
    pitch,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem('mapbox-saved-view', JSON.stringify(viewState));
    console.log('Saved view state:', viewState);
    return viewState;
  } catch (error) {
    console.error('Error saving view:', error);
    return null;
  }
};

export const loadSavedView = (): ViewState | null => {
  try {
    const savedView = localStorage.getItem('mapbox-saved-view');
    if (savedView) {
      const parsedView = JSON.parse(savedView);
      console.log('Loading saved view:', parsedView);
      return parsedView;
    }
    console.log('No saved view found, using defaults');
  } catch (error) {
    console.error('Error loading saved view:', error);
  }
  return null;
};

export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&limit=1`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return [lng, lat];
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const createProjectMarkerElement = (projectId: string): HTMLDivElement => {
  const markerElement = document.createElement('div');
  markerElement.className = 'project-marker';
  markerElement.innerHTML = `
    <div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
      </svg>
    </div>
  `;
  return markerElement;
};

export const createProjectPopupContent = (project: any): string => {
  return `
    <div class="p-3 space-y-2">
      <h3 class="font-semibold text-lg text-gray-900">${project.name}</h3>
      <p class="text-sm text-gray-600">ID: ${project.project_id}</p>
      <p class="text-sm text-gray-600">Location: ${project.location}</p>
      ${project.status ? `<p class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 inline-block">Status: ${project.status}</p>` : ''}
      ${project.contract_price ? `<p class="text-sm font-medium text-green-600">Contract: ${project.contract_price}</p>` : ''}
      ${project.description ? `<p class="text-sm text-gray-700 mt-2">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>` : ''}
      <button onclick="window.selectProject('${project.id}')" class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">View Details</button>
    </div>
  `;
};