const map = L.map('map').setView([17.3850, 78.4867], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let stopsData = [];
let routesData = [];
let shapesData = [];

let routeLines = [];
let stopMarkers = [];

// Load GTFS ZIP automatically
fetch('data/TGSRTC_gtfs.zip')
  .then(res => res.arrayBuffer())
  .then(data => JSZip.loadAsync(data))
  .then(zip => {

    // Load stops
    zip.file("stops.txt").async("string").then(txt => {
      Papa.parse(txt, {
        header: true,
        complete: res => {
          stopsData = res.data;
          drawStops();
        }
      });
    });

    // Load routes
    zip.file("routes.txt").async("string").then(txt => {
      Papa.parse(txt, {
        header: true,
        complete: res => {
          routesData = res.data;
          populateRoutes();
        }
      });
    });

    // Load shapes
    zip.file("shapes.txt").async("string").then(txt => {
      Papa.parse(txt, {
        header: true,
        complete: res => {
          shapesData = res.data;
          drawRoutes();
        }
      });
    });

  });

// 🟢 Draw Stops
function drawStops() {
  stopsData.forEach(stop => {
    if (!stop.stop_lat) return;

    let marker = L.circleMarker(
      [parseFloat(stop.stop_lat), parseFloat(stop.stop_lon)],
      { radius: 3, color: 'blue' }
    )
    .bindPopup(stop.stop_name)
    .addTo(map);

    stopMarkers.push(marker);
  });
}

// 🔵 Draw Routes (Shapes)
function drawRoutes() {

  let grouped = {};

  shapesData.forEach(s => {
    if (!grouped[s.shape_id]) grouped[s.shape_id] = [];
    grouped[s.shape_id].push(s);
  });

  Object.keys(grouped).forEach(id => {

    let coords = grouped[id]
      .sort((a,b)=>a.shape_pt_sequence-b.shape_pt_sequence)
      .map(p => [parseFloat(p.shape_pt_lat), parseFloat(p.shape_pt_lon)]);

    let line = L.polyline(coords, {
      color: 'red',
      weight: 2
    }).addTo(map);

    routeLines.push(line);
  });
}

// 🟡 Route Dropdown
function populateRoutes() {
  let dropdown = document.getElementById("routeFilter");

  routesData.forEach(route => {
    let opt = document.createElement("option");
    opt.value = route.route_id;
    opt.text = route.route_long_name || route.route_short_name;
    dropdown.appendChild(opt);
  });
}
