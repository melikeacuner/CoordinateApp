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
let dataTableInstance = null;

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

function createPopupOverlay() {
  const overlay = new Overlay({
    element: popupContainer,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });

  popupCloser.onclick = function () {
    overlay.setPosition(undefined);
    popupCloser.blur();
    return false;
  };

  return overlay;
}

function flyTo(location, view, done) {
  const duration = 1000;
  const targetZoom = view.getZoom() + 2; // Hedef zoom seviyesi

  let parts = 2;
  let called = false;

  function callback(complete) {
    --parts;
    if (called) return;
    if (parts === 0 || !complete) {
      called = true;
      done(complete);
    }
  }

  view.animate(
    { center: location, duration: duration },
    { zoom: targetZoom, duration: duration }, // Hedef zoom seviyesine git
    callback
  );
}


function initializeDataTable(map, view, modal) {
  if (!dataTableInstance) {
    dataTableInstance = new DataTable('#example', {
      ajax: {
        url: 'https://localhost:7201/api/Coordinate',
        dataSrc: 'data'
      },
      columns: [
        { data: 'name', title: 'Name' },
        { data: 'x', title: 'Coordinate_X' },
        { data: 'y', title: 'Coordinate_Y' },
        { data: 'id', title: 'ID', visible: false }, // Gizli ID sütunu
        {
          title: 'Edit',
          render: function (data, type, row) {
            return `<button class="edit-btn" data-id="${row.id}">Edit</button>`;
          },
        },
        {
          title: 'Delete',
          render: function (data, type, row) {
            return `<button class="delete-btn" data-id="${row.id}">Delete</button>`;
          },
        },
        {
          title: 'Zoom',
          render: function (data, type, row, meta) {
            return '<button class="zoom-btn" data-index="' + meta.row + '">Zoom</button>';
          },
        },
      ]
    });

    document.querySelector('#example').addEventListener('click', function (event) {
      if (event.target.classList.contains('zoom-btn')) {
        const index = event.target.getAttribute('data-index');
        const coordX = parseFloat(dataTableInstance.row(index).data().x);
        const coordY = parseFloat(dataTableInstance.row(index).data().y);
        const location = [coordX, coordY];

        modal.style.display = 'none';
        flyTo(location, view, function () {});
      }

      if (event.target.classList.contains('edit-btn')) {
        const id = event.target.getAttribute('data-id');
        const rowData = dataTableInstance.row($(event.target).parents('tr')).data();

        document.getElementById('edit-name').value = rowData.name;
        document.getElementById('edit-x').value = rowData.x;
        document.getElementById('edit-y').value = rowData.y;
        document.getElementById('edit-id').value = rowData.id;

        document.getElementById('editModal').style.display = 'block';
      }

      if (event.target.classList.contains('delete-btn')) {
        const id = event.target.getAttribute('data-id');
        const rowData = dataTableInstance.row($(event.target).parents('tr')).data();

        if (confirm(`Are you sure you want to delete the coordinate: ${rowData.name}?`)) {
          deleteCoordinate(id);
        }
      }
    });
  } else {
    dataTableInstance.ajax.reload();
  }
}

async function fetchCoordinates() {
  try {
    const response = await axios.get('https://localhost:7201/api/Coordinate');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching features:', error);
    return [];
  }
}

function addIconsToMap(coordinates, vectorSource, iconStyle) {
  coordinates.forEach(coord => {
    const point = new Feature({
      geometry: new Point([coord.x, coord.y]),
      name: coord.name,
      id: coord.id,
    });

    point.setStyle(iconStyle);
    point.setProperties({ 'id': coord.id, 'name': coord.name });
    vectorSource.addFeature(point);
  });
}

function addMapClickListener(map, popupOverlay) {
  map.on('singleclick', function () {
    popupOverlay.setPosition(undefined);
  });
}

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
        '<p>Name: ' + feature.get('name') + '</p>';

      popupOverlay.setPosition(coordinate);
    }
  });
}

async function updateCoordinate() {
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value;
  const x = parseFloat(document.getElementById('edit-x').value);
  const y = parseFloat(document.getElementById('edit-y').value);

  try {
    const response = await axios.put('https://localhost:7201/api/Coordinate', { id, name, x, y });
    if (response.status === 200) {
      document.getElementById('editModal').style.display = 'none';
      const coordinates = await fetchCoordinates();
      vectorSource.clear();
      addIconsToMap(coordinates, vectorSource, iconStyle);
      dataTableInstance.ajax.reload();
    }
  } catch (error) {
    console.error('Error updating coordinate:', error);
  }
}

async function deleteCoordinate(id) {
  try {
    const response = await axios.delete(`https://localhost:7201/api/Coordinate/${id}`);
    if (response.status === 200) {
      const coordinates = await fetchCoordinates();
      vectorSource.clear();
      addIconsToMap(coordinates, vectorSource, iconStyle);
      dataTableInstance.ajax.reload();
    }
  } catch (error) {
    console.error('Error deleting coordinate:', error);
  }
}


// Yeni buton ve modal elementlerini seç
const addBtn = document.getElementById('addBtn');
const addModal = document.getElementById('addModal');
const addSpan = document.querySelector('.close-add');
const addForm = document.getElementById('add-form');

// Butona tıklayınca modalı aç
addBtn.onclick = function () {
  addModal.style.display = 'block';
};

// Kapatma butonuna tıklayınca modalı kapat
addSpan.onclick = function () {
  addModal.style.display = 'none';
};

// Modal dışına tıklayınca modalı kapat
window.onclick = function (event) {
  if (event.target == addModal) {
    addModal.style.display = 'none';
  }
};

// Form submit işlemi
addForm.onsubmit = async function (event) {
  event.preventDefault();
  const name = document.getElementById('add-name').value;
  const x = parseFloat(document.getElementById('add-x').value);
  const y = parseFloat(document.getElementById('add-y').value);

  try {
    const response = await axios.post('https://localhost:7201/api/Coordinate', { name, x, y });
    if (response.status === 200 || response.status === 201) {
      alert('Coordinate added successfully');
      addModal.style.display = 'none';
      const coordinates = await fetchCoordinates();
      vectorSource.clear();
      addIconsToMap(coordinates, vectorSource, iconStyle);
      dataTableInstance.ajax.reload();
    }
  } catch (error) {
    console.error('Error adding coordinate:', error);
    alert('Error adding coordinate');
  }
};

// main fonksiyonunda modal ve form event listener'larını tanımlayın
async function main() {
  const map = createMap();
  const popupOverlay = createPopupOverlay();
  map.addOverlay(popupOverlay);

  const modal = document.getElementById('myModal');
  const btn = document.getElementById('myBtn');
  const span = document.querySelector('.close');
  const editModal = document.getElementById('editModal');
  const editSpan = document.querySelector('.close-edit');

  btn.onclick = function () {
    modal.style.display = 'block';
    dataTableInstance.ajax.reload(); // Modal açıldığında tabloyu yenile
  };

  span.onclick = function () {
    modal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    } else if (event.target == editModal) {
      editModal.style.display = 'none';
    }
  };

  editSpan.onclick = function () {
    editModal.style.display = 'none';
  };

  const coordinates = await fetchCoordinates();
  addIconsToMap(coordinates, vectorSource, iconStyle);
  initializeDataTable(map, map.getView(), modal);
  addMapClickListener(map, popupOverlay);
  addPopupToIcons(map, vectorSource, popupOverlay, popupContent, toLonLat);

  document.getElementById('edit-form').onsubmit = function (event) {
    event.preventDefault();
    updateCoordinate();
  };
}

// main fonksiyonunu çalıştırın
main();
