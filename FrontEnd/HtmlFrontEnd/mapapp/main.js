import './style.css';
import { Feature, Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import axios from 'axios';
import Point from 'ol/geom/Point';
import DataTable from 'datatables.net-dt';
import Overlay from 'ol/Overlay.js';
import { toLonLat } from 'ol/proj.js';

// Global variables and constants
const iconStyle = new Style({
  image: new Icon({
    src: 'location-pin.png',
    scale: 0.07, 
  }),
});

const vectorSource = new VectorSource();

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

const popupContainer = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const popupCloser = document.getElementById('popup-closer');
let dataSet = [];

// Create map function
function createMap() {
  return new Map({
    target: 'map',
    layers: [
      new TileLayer({ source: new OSM() }),
      vectorLayer,
    ],
    view: new View({
      center: [3921750.6964797713, 4719959.740180479],
      zoom: 6.6,
    }),
  });
}

// Create popup overlay function
function createPopupOverlay() {
  return new Overlay({
    element: popupContainer,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });
}

// Update DataTable function
function updateDataTable() {
  const table = new DataTable('#example', {
    columns: [
      { title: 'Name' },
      { title: 'Coordinate_X' },
      { title: 'Coordinate_Y' },
      {
        title: 'Edit',
        render: function (data, type, row) {
          return '<button class="edit-btn">Edit</button>';
        },
      },
      {
        title: 'Delete',
        render: function (data, type, row) {
          return '<button class="delete-btn">Delete</button>';
        },
      },
      {
        title: 'Info',
        render: function (data, type, row) {
          return '<button class="info-btn">Info</button>';
        },
      },
    ],
    data: dataSet,
  });
}

// Fetch coordinates from API function
async function fetchCoordinates() {
  try {
    const response = await axios.get('https://localhost:7201/api/Coordinate');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching features:', error);
    return []; // Return empty array on error
  }
}

// Add icons to map function
function addIconsToMap(coordinates, vectorSource, iconStyle, dataSet) {
  coordinates.forEach(coord => {
    const point = new Feature({
      geometry: new Point([coord.x, coord.y]),
      name: coord.name,
      id: coord.id,
    });

    point.setStyle(iconStyle);
    point.setProperties({ 'id': coord.id, 'name': coord.name });
    vectorSource.addFeature(point);
    
    dataSet.push([coord.name, coord.x, coord.y, coord.id]);
  });

  updateDataTable(); // Update DataTable
}

// Add click listener to map function
function addMapClickListener(map, popupOverlay) {
  map.on('singleclick', function (evt) {
    popupOverlay.setPosition(undefined); // Close any open popup
  });
}

// Add popup to icons function
function addPopupToIcons(map, vectorSource, popupOverlay, popupContent, toLonLat) {
  map.on('pointermove', function (e) {
    const pixel = map.getEventPixel(e.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel);
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  });

  map.on('singleclick', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature;
    });

    if (feature) {
      const coordinate = feature.getGeometry().getCoordinates();
      const lonLat = toLonLat(coordinate);

      popupContent.innerHTML =
        '<p>Longitude: ' + lonLat[0] + '</p>' +
        '<p>Latitude: ' + lonLat[1] + '</p>' +
        '<p>Name: ' + feature.get('name') + '</p>' ;

      popupOverlay.setPosition(coordinate);
      
    }
  });
}

// Main function
async function main() {
  const map = createMap();
  const popupOverlay = createPopupOverlay();
  map.addOverlay(popupOverlay);

  // Load data and add icons to map
  const coordinates = await fetchCoordinates();
  addIconsToMap(coordinates, vectorSource, iconStyle, dataSet);
  addMapClickListener(map, popupOverlay); // Add map click listener
  addPopupToIcons(map, vectorSource, popupOverlay, popupContent, toLonLat); // Add popup to icons
}

// Start main function
main();

// Modal functionality
const modal = document.querySelector('.modal');
const btn = document.getElementById('myBtn');
const span = document.querySelector('.close');

btn.onclick = function () {
  modal.style.display = 'block';
};

span.onclick = function () {
  modal.style.display = 'none';
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};
