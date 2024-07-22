import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Draw, Modify, Snap} from 'ol/interaction.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {get, transform} from 'ol/proj.js';
import {WKT} from 'ol/format.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Icon} from 'ol/style.js';
import {fromCircle} from 'ol/geom/Polygon.js';

const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource();
const vector = new VectorLayer({
  source: source,
  style: function (feature) {
    const geometryType = feature.getGeometry().getType();
    switch (geometryType) {
      case 'Point':
        return new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'location-pin.png', // İkon dosyanızın yolunu doğru şekilde belirtin
            scale: 0.05,
          }),
        });
      case 'LineString':
      case 'Polygon':
        return new Style({
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2,
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        });
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

const extent = get('EPSG:3857').getExtent().slice();
extent[0] += extent[0];
extent[2] += extent[2];

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [3921750.6964797713, 4719959.740180479],
    zoom: 6.6,
    extent,
    projection: 'EPSG:3857',
  }),
});

const modify = new Modify({source: source});
map.addInteraction(modify);

let draw, snap;
const typeSelect = document.getElementById('type');
const addCoordinateButton = document.getElementById('add-coordinate');
const saveCoordinateButton = document.getElementById('save-coordinate');

// Modal elements
const nameModal = document.getElementById('nameModal');
const span = document.getElementsByClassName('close')[0];
const submitNameButton = document.getElementById('submit-name');
const coordinateNameInput = document.getElementById('coordinate-name');

function addInteractions() {
  draw = new Draw({
    source: source,
    type: typeSelect.value,
  });
  map.addInteraction(draw);
  snap = new Snap({source: source});
  map.addInteraction(snap);

  draw.on('drawend', function () {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
  });
}

addCoordinateButton.addEventListener('click', function () {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  addInteractions();
});

saveCoordinateButton.addEventListener('click', function () {
  if (source.getFeatures().length > 0) {
    nameModal.style.display = 'block';
  } else {
    alert('No coordinates to save!');
  }
});

span.onclick = function () {
  nameModal.style.display = 'none';
};

window.onclick = function (event) {
  if (event.target == nameModal) {
    nameModal.style.display = 'none';
  }
};

submitNameButton.addEventListener('click', function () {
  const name = coordinateNameInput.value;
  if (name) {
    nameModal.style.display = 'none';

    const features = source.getFeatures();
    if (features.length > 0) {
      const format = new WKT();
      let geometry = features[0].getGeometry();
      if (geometry.getType() === 'Circle') {
        geometry = fromCircle(geometry);
      }
      const wkt = format.writeGeometry(geometry);
      console.log(wkt); // Bu, WKT formatında veriyi gösterir

      fetch('https://localhost:7201/api/Coordinate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          wkt: wkt,
        }),
      })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
          if (status >= 200 && status < 300) {
            console.log('Success:', body);
            // source.clear(); // Çizimleri temizle
          } else {
            console.error('Error:', body);
          }
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
    }
  } else {
    alert('Please enter a name for the coordinate!');
  }
});

// Sayfa yüklendiğinde koordinatları yükle
document.addEventListener('DOMContentLoaded', function () {
  fetch('https://localhost:7201/api/Coordinate')
    .then(response => response.json())
    .then(data => {
      console.log(data); // API'den dönen veriyi kontrol etmek için
      if (data && data.data && Array.isArray(data.data)) {
        const format = new WKT();
        data.data.forEach(item => {
          const feature = format.readFeature(item.wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          });
          source.addFeature(feature);
        });
      } else {
        console.error('Fetch error: Expected an array in data.data, but got:', data);
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
});
