import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { Draw, Snap } from 'ol/interaction';
import { WKT } from 'ol/format';
import Overlay from 'ol/Overlay.js';
import { transform } from 'ol/proj';
import DataTable from 'datatables.net-dt';

const API_URL = 'https://localhost:7201/api/Coordinate';

const iconStyle = new Style({
  image: new Icon({
    src: 'location-pin.png',
    scale: 0.07,
  }),
});

const source = new VectorSource();
const vector = new VectorLayer({
  source: source,
  style: function (feature) {
    const geometryType = feature.getGeometry().getType();
    switch (geometryType) {
      case 'Point':
        return iconStyle;
      case 'LineString':
      case 'Polygon':
      case 'Circle':
        return new Style({
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2,
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        });
      default:
        return new Style({
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2,
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        });
    }
  },
});

const popupElements = {
  container: document.getElementById('popup'),
  content: document.getElementById('popup-content'),
  closer: document.getElementById('popup-closer'),
};

let dataTableInstance = null;
let draw, snap;

function createMap() {
  return new Map({
    target: 'map',
    layers: [
      new TileLayer({ source: new OSM() }),
      vector,
    ],
    view: new View({
      center: transform([34.0, 39.0], 'EPSG:4326', 'EPSG:3857'),
      zoom: 6.6,
    }),
  });
}

function createPopupOverlay() {
  const overlay = new Overlay({
    element: popupElements.container,
    autoPan: { animation: { duration: 250 } },
  });

  popupElements.closer.onclick = () => {
    overlay.setPosition(undefined);
    popupElements.closer.blur();
    return false;
  };

  return overlay;
}

function addInteractions(map, type) {
  draw = new Draw({
    source: source,
    type: type,
  });
  map.addInteraction(draw);
  snap = new Snap({ source: source });
  map.addInteraction(snap);

  draw.on('drawend', function () {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    document.getElementById('nameModal').style.display = 'block';
  });
}

function initializeDataTable(map, view) {
  if (dataTableInstance) {
    dataTableInstance.ajax.reload();
    return;
  }

  dataTableInstance = new DataTable('#example', {
    pageLength: 5,
    ajax: { 
      url: API_URL,
      dataSrc: 'data',
      dataFilter: function(data){
        var json = JSON.parse(data);
        json.data = json.data.map(item => ({
          ...item,
          wkt: new WKT().writeGeometry(new WKT().readGeometry(item.wkt))
        }));
        return JSON.stringify(json);
      }
    },
    columns: [
      { data: 'name', title: 'Name' },
      { data: 'wkt', title: 'WKT' },
      { data: 'id', title: 'ID', visible: false },
      {
        title: 'Edit',
        render: (data, type, row) => `<button class="edit-btn" data-id="${row.id}">Edit</button>`,
      },
      {
        title: 'Delete',
        render: (data, type, row) => `<button class="delete-btn" data-id="${row.id}">Delete</button>`,
      },
      {
        title: 'Zoom',
        render: (data, type, row, meta) => `<button class="zoom-btn" data-index="${meta.row}">Zoom</button>`,
      },
    ],
    drawCallback: function() {
      $('.edit-btn').on('click', function() { handleEditButton(this); });
      $('.delete-btn').on('click', function() { handleDeleteButton(this); });
      $('.zoom-btn').on('click', function() { handleZoomButton(this); });
    }
  });

  function handleZoomButton(button) {
    const index = button.getAttribute('data-index');
    const wkt = dataTableInstance.row(index).data().wkt;
    const format = new WKT();
    const feature = format.readFeature(wkt, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    const geometry = feature.getGeometry();
    const extent = geometry.getExtent();
    view.fit(extent, { padding: [100, 100, 100, 100], maxZoom: 18 });
  }

  function handleEditButton(button) {
    const id = button.getAttribute('data-id');
    const rowData = dataTableInstance.row($(button).closest('tr')).data();
    
    document.getElementById('edit-name').value = rowData.name;
    document.getElementById('edit-wkt').value = rowData.wkt;
    document.getElementById('edit-id').value = rowData.id;
    document.getElementById('editModal').style.display = 'block';
  }

  function handleDeleteButton(button) {
    const id = button.getAttribute('data-id');
    const rowData = dataTableInstance.row($(button).closest('tr')).data();
    if (confirm(`Are you sure you want to delete the coordinate: ${rowData.name}?`)) {
      deleteCoordinate(id);
    }
  }
}

async function fetchCoordinates() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return [];
  }
}

// Point türündeki koordinatları filtreleme fonksiyonu
function filterPoints(coordinates) {
  const format = new WKT();
  const pointCoordinates = [];

  coordinates.forEach(coord => {
    if (coord.wkt) {
      try {
        const feature = format.readFeature(coord.wkt, {
          dataProjection: 'EPSG:4326', // Gelen verinin projeksiyonu
          featureProjection: 'EPSG:3857' // Harita projeksiyonu
        });

        if (feature.getGeometry().getType() === 'Point') {
          pointCoordinates.push(coord);
        }
      } catch (error) {
        console.error('Error parsing WKT:', error, 'for coordinate:', coord);
      }
    } else {
      console.warn('Invalid or empty WKT value for coordinate:', coord);
    }
  });

  return pointCoordinates;
}

// Haritaya ikon ekleme fonksiyonu
function addIconsToMap(coordinates) {
  const format = new WKT();

  coordinates.forEach(coord => {
    if (coord.wkt) {
      try {
        const feature = format.readFeature(coord.wkt, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        feature.setProperties({ id: coord.id, name: coord.name });
        source.addFeature(feature);
      } catch (error) {
        console.error('Error parsing WKT:', error, 'for coordinate:', coord);
      }
    } else {
      console.warn('Invalid or empty WKT value for coordinate:', coord);
    }
  });
}

function addPopupToIcons(map, popupOverlay) {
  map.on('pointermove', (e) => {
    const pixel = map.getEventPixel(e.originalEvent);
    map.getTargetElement().style.cursor = map.hasFeatureAtPixel(pixel) ? 'pointer' : '';
  });

  map.on('singleclick', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, feature => feature);
    if (feature) {
      const geometry = feature.getGeometry();
      const coord = transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
      popupElements.content.innerHTML = `
        <p>Name: ${feature.get('name')}</p>
        <p>ID: ${feature.get('id')}</p>
        <p>Longitude: ${coord[0].toFixed(6)}</p>
        <p>Latitude: ${coord[1].toFixed(6)}</p>
      `;
      popupOverlay.setPosition(geometry.getCoordinates());
    }
  });
}

async function addCoordinate(name, geometry) {
  const wkt = new WKT().writeGeometry(geometry.transform('EPSG:3857', 'EPSG:4326'));
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, wkt }),
    });
    const result = await response.json();
    if (result.isSucces) {
      dataTableInstance.ajax.reload();
      addIconsToMap([{ name, wkt }]);
    } else {
      alert('Failed to add coordinate: ' + result.message);
    }
  } catch (error) {
    console.error('Error adding coordinate:', error);
    alert('Error adding coordinate');
  }
}

async function updateCoordinate(id, name, wkt) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, wkt }),
    });
    const result = await response.json();
    if (result.isSucces) {
      dataTableInstance.ajax.reload();
      source.clear();
      const coordinates = await fetchCoordinates();
      addIconsToMap(coordinates);
    } else {
      alert('Failed to update coordinate: ' + result.message);
    }
  } catch (error) {
    console.error('Error updating coordinate:', error);
    alert('Error updating coordinate');
  }
}

async function deleteCoordinate(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (result.isSucces) {
      dataTableInstance.ajax.reload();
      source.clear();
      const coordinates = await fetchCoordinates();
      addIconsToMap(coordinates);
    } else {
      alert('Failed to delete coordinate: ' + result.message);
    }
  } catch (error) {
    console.error('Error deleting coordinate:', error);
    alert('Error deleting coordinate');
  }
}

async function main() {
  const map = createMap();
  const popupOverlay = createPopupOverlay();
  map.addOverlay(popupOverlay);

  const coordinates = await fetchCoordinates();
  const pointCoordinates = filterPoints(coordinates);
  addIconsToMap(pointCoordinates);
  addPopupToIcons(map, popupOverlay);

  initializeDataTable(map, map.getView());

  document.getElementById('adddragbtn').addEventListener('click', function() {
    addInteractions(map, 'Point');
  });

  document.getElementById('addBtn').addEventListener('click', function() {
    document.getElementById('addModal').style.display = 'block';
  });

  document.getElementById('myBtn').addEventListener('click', function() {
    document.getElementById('myModal').style.display = 'block';
  });

  // Modal kapatma işlemleri
  document.querySelectorAll('.close, .close-add, .close-edit').forEach(el => {
    el.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });

  // Form submit işlemleri
  document.getElementById('add-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('coordinate-name').value;
    const wkt = new WKT().writeGeometry(source.getFeatures()[0].getGeometry());
    addCoordinate(name, wkt);
    this.closest('.modal').style.display = 'none';
  });

  document.getElementById('edit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const wkt = document.getElementById('edit-wkt').value;
    updateCoordinate(id, name, wkt);
    this.closest('.modal').style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', main);
