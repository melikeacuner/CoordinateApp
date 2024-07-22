import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style, Fill, Stroke } from 'ol/style';
import { Draw, Modify } from 'ol/interaction';
import { WKT } from 'ol/format';
import Overlay from 'ol/Overlay';
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
    if (geometryType === 'Point') {
      return iconStyle;
    }
    return new Style({
      stroke: new Stroke({
        color: '#003399',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(10, 150, 200, 0.3)',
      }),
    });
  },
});

let dataTableInstance = null;
let draw;

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

function createPopup() {
  const container = document.createElement('div');
  container.className = 'ol-popup';
  const content = document.createElement('div');
  content.id = 'popup-content';
  const closer = document.createElement('a');
  closer.className = 'ol-popup-closer';
  container.appendChild(closer);
  container.appendChild(content);
  document.body.appendChild(container);

  const overlay = new Overlay({
    element: container,
    autoPan: { animation: { duration: 250 } },
  });

  closer.onclick = () => {
    overlay.setPosition(undefined);
    closer.blur();
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

  draw.on('drawend', function (event) {
    map.removeInteraction(draw);
    const geometry = event.feature.getGeometry();
    const name = prompt("Enter coordinate name:");
    if (name) {
      addCoordinate(name, geometry);
    }
  });
}

function initializeDataTable(map) {
  if (dataTableInstance) {
    dataTableInstance.ajax.reload();
    return;
  }

  dataTableInstance = new DataTable('#example', {
    pageLength: 7,
    ajax: {
      url: API_URL,
      dataSrc: 'data',
    },
    columns: [
      { data: 'name', title: 'Name' },
      { data: 'wkt', title: 'WKT' },
      { data: 'id', title: 'ID', visible: false },
      {
        title: 'Zoom',
        render: (data, type, row) => `<button class="zoom-btn" data-wkt="${row.wkt}">Zoom</button>`,
      },
      {
        title: 'Delete',
        render: (data, type, row) => `<button class="delete-btn" data-id="${row.id}">Delete</button>`,
      },
    ],
    drawCallback: function() {
      $('.zoom-btn').on('click', function() { handleZoomButton(this, map); });
      $('.delete-btn').on('click', function() { handleDeleteButton(this); });
    }
  });
}

function addCoordinate(name, geometry) {
  const wktFormat = new WKT();
  const wkt = wktFormat.writeGeometry(geometry.transform('EPSG:3857', 'EPSG:4326'));
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, wkt }),
  })
    .then(response => response.json())
    .then(() => {
      alert('Coordinate added successfully.');
      if (dataTableInstance) {
        dataTableInstance.ajax.reload();
      }
      loadCoordinates();
    })
    .catch(error => alert('Error adding coordinate: ' + error.message));
}

function updateCoordinate(id, updatedCoordinate) {
  const wktFormat = new WKT();
  const geometry = wktFormat.readGeometry(updatedCoordinate.wkt);
  const transformedGeometry = geometry.transform('EPSG:3857', 'EPSG:4326');
  const transformedWkt = wktFormat.writeGeometry(transformedGeometry);

  const payload = {
    id: id,
    wkt: transformedWkt,
    name: updatedCoordinate.name
  };

  fetch(`${API_URL}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        });
      }
      return response.json();
    })
    .then(() => {
      alert('Coordinate updated successfully.');
      if (dataTableInstance) {
        dataTableInstance.ajax.reload();
      }
      loadCoordinates();
    })
    .catch(error => alert('Error updating coordinate: ' + error.message));
}

function deleteCoordinate(id) {
  fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(() => {
      alert('Coordinate deleted successfully.');
      if (dataTableInstance) {
        dataTableInstance.ajax.reload();
      }
      loadCoordinates();
    })
    .catch(error => alert('Error deleting coordinate: ' + error.message));
}

function handleZoomButton(button, map) {
  const wkt = $(button).data('wkt');
  const feature = new WKT().readFeature(wkt, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
  const coordinates = feature.getGeometry().getCoordinates();
  flyTo(coordinates, map.getView(), function() {});
  map.getView().fit(feature.getGeometry());
}

function handleDeleteButton(button) {
  const id = $(button).data('id');
  if (confirm('Are you sure you want to delete this coordinate?')) {
    deleteCoordinate(id);
  }
}

function loadCoordinates() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      source.clear();
      const format = new WKT();
      data.data.forEach(item => {
        const feature = format.readFeature(item.wkt, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        feature.setProperties(item);
        source.addFeature(feature);
      });
    })
    .catch(error => console.error('Error loading coordinates:', error));
}

document.addEventListener('DOMContentLoaded', function () {
  const map = createMap();
  const popup = createPopup();
  map.addOverlay(popup);

  loadCoordinates();

  map.on('click', function(evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
      return feature;
    });
    if (feature) {
      const coordinates = evt.coordinate;
      const content = document.getElementById('popup-content');
      content.innerHTML = `
        <p><strong>Name:</strong> ${feature.get('name')}</p>
        <p><strong>WKT:</strong> ${feature.get('wkt')}</p>
        <button id="update-btn">Update</button>
        <button id ="delete-btn">Delete</button>
      `;
      popup.setPosition(coordinates);
  
      document.getElementById('update-btn').onclick = function() {
        map.removeOverlay(popup);
        const modify = new Modify({source: source});
        map.addInteraction(modify);
        modify.on('modifyend', function(event) {
          const updatedFeature = event.features.getArray()[0];
          const newName = prompt("Enter new name for the coordinate:", feature.get('name'));
          if (newName) {
            const updatedWkt = new WKT().writeGeometry(updatedFeature.getGeometry());
            const id = feature.get('id');
            updateCoordinate(id, { 
              id: id,
              wkt: updatedWkt, 
              name: newName 
            });
          }
          map.removeInteraction(modify);
          popup.setPosition(coordinates);
        });
      };
      document.getElementById('delete-btn').onclick = function() {
        const id = feature.get('id')
        deleteCoordinate(id)
        popup.setPosition(undefined);
      }
    } else {
      popup.setPosition(undefined);
    }
  });

  document.getElementById('show-coordinates-btn').onclick = function () {
    document.getElementById('myModal').style.display = 'block';
    initializeDataTable(map);
  };

  document.getElementById('add-coordinate-btn').onclick = function () {
    const type = document.getElementById('type').value;
    addInteractions(map, type);
  };

  document.getElementsByClassName('close')[0].onclick = function () {
    document.getElementById('myModal').style.display = 'none';
  };
});
