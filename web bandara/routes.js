/* =====================================================
   STATE & BAHASA
===================================================== */
let currentLang = "id";
let currentFilter = "all";

const TEXT = {
  id: {
    title: "Rute Penerbangan Bandara Halu Oleo",
    subtitle: "Informasi resmi rute penerbangan yang beroperasi di Bandara Halu Oleo",
    airline: "Maskapai Penerbangan",
    flight: "Nomor Penerbangan",
    days: "Hari Operasional",
    time: "Waktu Keberangkatan",
    next: "Penerbangan Selanjutnya",
    closed: "Rute ini dihentikan operasionalnya sejak tanggal",
    activeBack: "Aktif kembali pada",
    start: "Akan terbang pada",
    checkin: "Check-in Online",
    disclaimer:
      "Jadwal dan operasional penerbangan dapat berubah sewaktu-waktu sesuai kebijakan maskapai dan kondisi operasional bandara.",
    filter: {
      all: "Semua Rute",
      aktif: "Rute Aktif",
      aktifKembali: "Rute Aktif Kembali",
      akanDatang: "Rute Akan Datang",
      potensi: "Rute Potensial",
      tutupSementara: "Rute Ditutup Sementara",
      tutup: "Rute Ditutup"
    },
    
    // === TAMBAHAN UNTUK MAP ===
    map: {
      route: "Rute",
      airline: "Maskapai",
      active: "Aktif",
      activeBack: "Aktif Kembali",
      upcoming: "Akan Terbang",
      potential: "Rute Potensi",
      status: "Status"
    },

    // ===== TAMBAHAN UNTUK SIMPAN GAMBAR =====
    export: {
      title: "Daftar Rute dan Maskapai Bandara Halu Oleo",
      subtitle: "Informasi rute penerbangan dari Kendari (KDI)",
      airline: "Maskapai",
      active: "Aktif",
      activeBack: "Aktif Kembali",
      upcoming: "Akan Terbang",
      updated: "Update",
      official: "Informasi Resmi"
    },
    daysMap: {
      "Setiap Hari": "Setiap Hari",
      "Senin": "Senin",
      "Selasa": "Selasa",
      "Rabu": "Rabu",
      "Kamis": "Kamis",
      "Jumat": "Jumat",
      "Sabtu": "Sabtu",
      "Minggu": "Minggu"
    },
    mapTitle: "Peta Konektivitas Penerbangan dari Kendari (KDI)"
  },
  en: {
    title: "Flight Routes of Halu Oleo Airport",
    subtitle: "Official information on flight routes operating at Halu Oleo Airport",
    airline: "Airline",
    flight: "Flight Number",
    days: "Operating Days",
    time: "Departure Time",
    next: "Next Flight",
    closed: "Suspended since",
    activeBack: "Reactivated on",
    start: "First flight on",
    checkin: "Online Check-in",
    disclaimer:
      "Flight schedules and operations are subject to change based on airline policies and airport operational conditions.",
    filter: {
      all: "All Routes",
      aktif: "Active Routes",
      aktifKembali: "Reactivated Routes",
      akanDatang: "Upcoming Routes",
      potensi: "Potential Routes",
      tutupSementara: "Temporarily Suspended Routes",
      tutup: "Suspended Routes"
    },
    // === TAMBAHAN UNTUK MAP ===
    map: {
      route: "Route",
      airline: "Airlines",
      active: "Active",
      activeBack: "Reactivated",
      upcoming: "Upcoming",
      potential: "Potential Route",
      status: "Status"
    },
    daysMap: {
      "Setiap Hari": "Daily",
      "Senin": "Monday",
      "Selasa": "Tuesday",
      "Rabu": "Wednesday",
      "Kamis": "Thursday",
      "Jumat": "Friday",
      "Sabtu": "Saturday",
      "Minggu": "Sunday"
    },
    mapTitle: "Flight Connectivity Map from Kendari (KDI)"
  }
};

/* =====================================================
   DATA
===================================================== */
const routes = ROUTES_DATA;

function translateDays(daysText) {
  if (!daysText) return "";

  // Normalisasi: ganti " dan " jadi koma
  const normalized = daysText.replace(/ dan /gi, ",");

  return normalized
    .split(",")
    .map(d => d.trim())
    .map(d => TEXT[currentLang].daysMap[d] || d)
    .join(currentLang === "en" ? ", " : ", ");
}

function formatDateByLang(dateText) {
  if (!dateText) return "";

  // Kalau bahasa Indonesia → biarkan
  if (currentLang === "id") return dateText;

  // Konversi "7 Maret 2026" → Date
  const months = {
    Januari: "January",
    Februari: "February",
    Maret: "March",
    April: "April",
    Mei: "May",
    Juni: "June",
    Juli: "July",
    Agustus: "August",
    September: "September",
    Oktober: "October",
    November: "November",
    Desember: "December"
  };

  let englishDate = dateText;
  Object.keys(months).forEach(idMonth => {
    englishDate = englishDate.replace(idMonth, months[idMonth]);
  });

  const parsed = new Date(englishDate);
  if (isNaN(parsed)) return dateText;

  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* =====================================================
   DOM
===================================================== */
const container = document.getElementById("route-list");
const emptyBox = document.getElementById("empty-message");

/* =====================================================
   RENDER RUTE
===================================================== */
function renderRoutes(data) {
  container.innerHTML = "";

  data.forEach(r => {
    const statusClass = r.status.toLowerCase().replace(/\s+/g, "-");

    container.innerHTML += `
      <div class="card" onclick="openRouteDetail('${r.origin}', '${r.destination}')">
        <div class="image-wrapper">
          <span class="badge ${statusClass}">${r.status}</span>
          <img src="${r.image}" alt="${r.airline}" class="route-img">
        </div>

        <h3>${r.origin} – ${r.destination}</h3>
        <p><strong>${TEXT[currentLang].airline}:</strong> ${r.airline}</p>
        <p><strong>${TEXT[currentLang].flight}:</strong> ${r.flight}</p>
        <p>
          <strong>${TEXT[currentLang].days}:</strong>
          ${translateDays(r.days)}
        </p>

        <p><strong>${TEXT[currentLang].time}:</strong> ${r.time}</p>

        ${r.nexttrip ? `
          <p class="next">
            <strong>${TEXT[currentLang].next}:</strong>
            ${r.destination} → ${r.nexttrip}
          </p>
        ` : ""}

        ${(statusClass === "tutup" && r.closedDate) ? `
          <p class="closed">
            <strong>${TEXT[currentLang].closed}:</strong> 
            ${formatDateByLang(r.closedDate)}
          </p>
        ` : ""}

        ${(statusClass === "aktif-kembali" && r.aktifback) ? `
          <p class="closed">
            <strong>${TEXT[currentLang].activeBack}:</strong>
            ${formatDateByLang(r.aktifback)}
          </p>
        ` : ""}

        ${(statusClass === "akan-datang" && r.startflight) ? `
          <p class="closed">
            <strong>${TEXT[currentLang].start}:</strong>
            ${formatDateByLang(r.startflight)}
          </p>
        ` : ""}

        ${(statusClass === "aktif" && r.checkin) ? `
          <a href="${r.checkin}" target="_blank" class="checkin">
            ${TEXT[currentLang].checkin}
          </a>
        ` : ""}
      </div>
    `;
  });
}

/* =====================================================
   FILTER
===================================================== */
function filterRoutes(status) {
  currentFilter = status;

  document.querySelectorAll(".filter button")
    .forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");

  const filtered =
    status === "all"
      ? routes
      : routes.filter(r => r.status === status);

  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyBox.style.display = "block";
    emptyBox.innerHTML = `<strong>Data Tidak Tersedia</strong>`;
  } else {
    emptyBox.style.display = "none";
    renderRoutes(filtered);
  }
}

/* =====================================================
   BAHASA
===================================================== */
function updateFilterLanguage() {
  document.querySelectorAll(".filter button").forEach(btn => {
    const key = btn.dataset.filter;
    if (key && TEXT[currentLang].filter[key]) {
      btn.textContent = TEXT[currentLang].filter[key];
    }
  });
}

/* =====================================================
   MAP TITLE INIT (FIX JUDUL PETA HILANG)
===================================================== */
function updateMapTitle() {
  const mapTitleEl = document.getElementById("map-title");
  if (mapTitleEl) {
    mapTitleEl.textContent = TEXT[currentLang].mapTitle;
  }
}

function setLang(lang) {
  // refresh map saat ganti bahasa
  currentLang = lang;

  document.querySelector(".overlay h1").textContent = TEXT[lang].title;
  document.querySelector(".overlay p").textContent = TEXT[lang].subtitle;
  document.querySelector(".alert").textContent = TEXT[lang].disclaimer;

  updateFilterLanguage();
  updateMapTitle();

  renderRoutes(
    currentFilter === "all"
      ? routes
      : routes.filter(r => r.status === currentFilter)
  );

  if (typeof initConnectivityMap === "function") {
    initConnectivityMap(); // update isi map saja
  }

  document.querySelectorAll(".lang-toggle button")
    .forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
}

/* =====================================================
   WAKTU
===================================================== */
document.getElementById("last-update").textContent =
  "21 Januari 2026 | 00:03 WITA";

function updateTime() {
  document.getElementById("current-time").textContent =
    new Date().toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    });
}

const BRAND = {
  primary: "#0f766e",     // hijau tosca
  secondary: "#0b5ed7",   // biru
  textDark: "#1f2937",
  website: "bandarahaluoleo.id"
};

const DESTINATION_IMAGES = {
  KDI: "images/destinations/KDI.jpg",
  CGK: "images/destinations/CGK.jpg",
  UPG: "images/destinations/UPG.jpg",
  SUB: "images/destinations/SUB.jpg",
  WNI: "images/destinations/WNI.jpg",
  APD: "images/destinations/APD.jpg"
};

function generatePoster({ width, height = null, filename }) {
  const box = document.createElement("div");

  box.style.position = "fixed";
  box.style.top = "0";
  box.style.left = "0";
  box.style.width = width + "px";
  box.style.background = BRAND.primary;
  box.style.color = "white";
  box.style.fontFamily = "Arial, sans-serif";
  box.style.zIndex = "9999";
  box.style.overflow = "hidden";
  if (height) box.style.height = height + "px";

  /* ===== HEADER ===== */
  box.innerHTML = `
    <div style="padding:40px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <img src="images/logo-bandara.jpg" height="48" crossorigin="anonymous">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://${BRAND.website}">
      </div>
        <h1>${TEXT[currentLang].export.title}</h1>
        <p>${TEXT[currentLang].export.subtitle}</p>
    </div>
  `;

  /* ===== LOGO MASKAPAI ===== */
  box.innerHTML += `
    <div style="
      background:rgba(255,255,255,.12);
      margin:0 40px;
      padding:16px;
      border-radius:14px;
    ">
      <strong>${TEXT[currentLang].export.airline}</strong>
      <div style="display:flex;gap:24px;margin-top:12px;flex-wrap:wrap">
        ${Object.values(AIRLINE_LOGOS).map(
          logo => `<img src="${logo}" height="28" crossorigin="anonymous">`
        ).join("")}
      </div>
    </div>
  `;

  /* ===== DATA RUTE ===== */
  const grouped = {};
  routes.forEach(r => {
    const key = `${r.origin} – ${r.destination}`;
    const statusKey = r.status.toLowerCase().replace(/\s+/g, "-");

    if (!["aktif", "aktif-kembali", "akan-datang"].includes(statusKey)) return;

    if (!grouped[key]) {
      grouped[key] = {
        aktif: new Set(),
        "aktif-kembali": { airlines: new Set(), date: null },
        "akan-datang": { airlines: new Set(), date: null }
      };
    }

    if (statusKey === "aktif") {
      grouped[key].aktif.add(r.airline);
    }

    if (statusKey === "aktif-kembali") {
      grouped[key]["aktif-kembali"].airlines.add(r.airline);
      grouped[key]["aktif-kembali"].date = r.aktifback;
    }

    if (statusKey === "akan-datang") {
      grouped[key]["akan-datang"].airlines.add(r.airline);
      grouped[key]["akan-datang"].date = r.startflight;
    }
  });

  const content = document.createElement("div");
  content.style.padding = "24px 40px";

  Object.keys(grouped).forEach(route => {
    const r = grouped[route];
    const [origin, destination] = route.split(" – ");

    const originImg = DESTINATION_IMAGES[origin];
    const destImg = DESTINATION_IMAGES[destination];

    content.innerHTML += `
      <div style="
        background:white;
        color:${BRAND.textDark};
        border-radius:18px;
        padding:20px;
        margin-bottom:18px;
      ">
        <h3 style="margin-bottom:12px">${route}</h3>

        <!-- FOTO DESTINASI -->
        <div style="display:flex;gap:12px;margin-bottom:12px">
          ${originImg ? `
            <div style="flex:1;text-align:center">
              <img src="${originImg}" crossorigin="anonymous"
                 style="width:100%;height:90px;object-fit:cover;border-radius:12px">
              <small>${origin}</small>
            </div>
          ` : ""}

          ${destImg ? `
            <div style="flex:1;text-align:center">
              <img src="${destImg}"
                style="width:100%;height:90px;object-fit:cover;border-radius:12px">
              <small>${destination}</small>
            </div>
          ` : ""}
        </div>

        ${r.aktif.size
          ? `<p><strong>${TEXT[currentLang].export.active}:</strong>
              ${[...r.aktif].join(", ")}</p>`
          : ""}

        ${r["aktif-kembali"].airlines.size
          ? `<p><strong>${TEXT[currentLang].export.activeBack}
              (${formatDateByLang(r["aktif-kembali"].date)}):</strong>
              ${[...r["aktif-kembali"].airlines].join(", ")}</p>`
          : ""}

        ${r["akan-datang"].airlines.size
          ? `<p><strong>${TEXT[currentLang].export.upcoming}
              (${formatDateByLang(r["akan-datang"].date)}):</strong>
              ${[...r["akan-datang"].airlines].join(", ")}</p>`
          : ""}
      </div>
    `;
  });

  box.appendChild(content);

  /* ===== WATERMARK ===== */
  box.innerHTML += `
    <div style="
      position:absolute;
      bottom:24px;
      right:40px;
      opacity:.4;
      font-size:14px;
    ">
      © Bandara Halu Oleo Kendari
    </div>
  `;

  document.body.appendChild(box);

  // ===== TUNGGU SEMUA GAMBAR SIAP =====
  const images = box.querySelectorAll("img");
  let loaded = 0;

  function capturePoster() {
    html2canvas(box, { scale: 2, useCORS: true }).then(canvas => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      box.remove();
    });
  }

  images.forEach(img => {
    if (img.complete) {
      loaded++;
    } else {
      img.onload = () => {
        loaded++;
        if (loaded === images.length) capturePoster();
      };
      img.onerror = () => {
        loaded++;
        if (loaded === images.length) capturePoster();
      };
    }
  });

  if (loaded === images.length) capturePoster();
}

setInterval(updateTime, 1000);
updateTime();

/* =====================================================
   INIT
===================================================== */
renderRoutes(routes);
updateFilterLanguage();
updateMapTitle(); // <<< INI YANG SEBELUMNYA HILANG
