let leafletMap = null;
let routeLayers = [];

/* Maps */
const AIRPORT_COORDS = {
  KDI: [-4.076765853590145, 122.41715518883132],
  UPG: [-5.077589460631162, 119.5493758233598],
  CGK: [-6.125401742078631, 106.65451968630538],
  SUB: [-7.378647979742737, 112.78728021377682],
  APD: [-4.460113254669939, 120.30679943307956],
  WNI: [-5.289486631335454, 123.63724117478775]
};

// ================================
// MAP KONEKTIVITAS RUTE KDI
// ================================

// ================================
// MAP KONEKTIVITAS RUTE KDI (SAFE)
// ================================

function initConnectivityMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;
  if (typeof L === "undefined") return;
  if (typeof routes === "undefined") return;
  if (typeof TEXT === "undefined") return;
  if (!TEXT[currentLang] || !TEXT[currentLang].map) return;

  // 🔒 BUAT MAP HANYA SEKALI
  if (!leafletMap) {
    leafletMap = L.map("map").setView(AIRPORT_COORDS.KDI, 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(leafletMap);

    // Marker KDI
    L.marker(AIRPORT_COORDS.KDI)
      .addTo(leafletMap)
      .bindPopup("Bandara Halu Oleo (KDI)");
  }

  // 🧹 HAPUS ROUTE LAMA
  routeLayers.forEach(layer => leafletMap.removeLayer(layer));
  routeLayers = [];

  const allowedStatus = ["aktif", "aktif-kembali", "akan-datang", "potensi"];
  const grouped = {};

  routes.forEach(r => {
    const statusKey = r.status.toLowerCase().replace(/\s+/g, "-");
    if (!allowedStatus.includes(statusKey)) return;

    if (!grouped[r.destination]) {
      grouped[r.destination] = {
        aktif: new Set(),
        "aktif-kembali": { airlines: new Set(), date: null },
        "akan-datang": { airlines: new Set(), date: null },
        potensi: new Set()
      };
    }

    if (statusKey === "aktif") {
      grouped[r.destination].aktif.add(r.airline);
    }

    if (statusKey === "aktif-kembali") {
      grouped[r.destination]["aktif-kembali"].airlines.add(r.airline);
      grouped[r.destination]["aktif-kembali"].date = r.aktifback || null;
    }

    if (statusKey === "akan-datang") {
      grouped[r.destination]["akan-datang"].airlines.add(r.airline);
      grouped[r.destination]["akan-datang"].date = r.startflight || null;
    }

    if (statusKey === "potensi") {
      grouped[r.destination].potensi.add(r.airline);
    }

  });

  Object.keys(grouped).forEach(dest => {
    if (!AIRPORT_COORDS[dest]) return;

    let popup = `<strong>${TEXT[currentLang].map.route}: KDI → ${dest}</strong><br>`;

    if (grouped[dest].aktif.size) {
      popup += `<br><strong>${TEXT[currentLang].map.active}:</strong><br>`;
      popup += [...grouped[dest].aktif].join("<br>");
    }

    if (grouped[dest]["aktif-kembali"].airlines.size) {
      popup += `<br><strong>${TEXT[currentLang].map.activeBack}`;
      if (grouped[dest]["aktif-kembali"].date) {
        popup += ` (${grouped[dest]["aktif-kembali"].date})`;
      }
      popup += `:</strong><br>`;
      popup += [...grouped[dest]["aktif-kembali"].airlines].join("<br>");
    }

    if (grouped[dest]["akan-datang"].airlines.size) {
      popup += `<br><strong>${TEXT[currentLang].map.upcoming}`;
      if (grouped[dest]["akan-datang"].date) {
        popup += ` (${grouped[dest]["akan-datang"].date})`;
      }
      popup += `:</strong><br>`;
      popup += [...grouped[dest]["akan-datang"].airlines].join("<br>");
    }


    if (grouped[dest].potensi.size) {
      popup += `<br><strong>${TEXT[currentLang].map.potential}:</strong><br>`;
      popup += [...grouped[dest].potensi].join("<br>");
    }

    const marker = L.marker(AIRPORT_COORDS[dest])
      .addTo(leafletMap)
      .bindPopup(popup);

    const line = L.polyline(
      [AIRPORT_COORDS.KDI, AIRPORT_COORDS[dest]],
      { color: "#0b5ed7", weight: 2 }
    ).addTo(leafletMap);

    routeLayers.push(marker, line);
  });
}

// JALANKAN SETELAH SEMUA SCRIPT LOADED
window.addEventListener("load", initConnectivityMap);
