const AIRLINE_LOGOS = {
  "Lion Air": "images/airlines/lion-air.png",
  "Batik Air": "images/airlines/batik-air.png",
  "Citilink": "images/airlines/citilink.png",
  "Garuda Indonesia": "images/airlines/garuda-indonesia.jpg",
  "Super Air Jet": "images/airlines/super-air-jet.png",
  "Air Asia": "images/airlines/air-asia.png",
  "Super Air Jet": "images/airlines/super-air-jet.png",
  "Fly Jaya": "images/airlines/fly-jaya.jpg"
};

function saveRouteImage() {
  const filename = `Rute-Bandara-Halu-Oleo-${Date.now()}.png`;
  const box = document.createElement("div");

  /* ===== CANVAS BASE ===== */
  box.style.position = "fixed";
  box.style.top = "0";
  box.style.left = "0";
  box.style.width = "1080px";
  box.style.background = "#0f766e";
  box.style.color = "white";
  box.style.fontFamily = "Arial, sans-serif";
  box.style.zIndex = "9999";
  box.style.overflow = "hidden";

  /* ===== HEADER ===== */
  box.innerHTML = `
    <div style="padding:40px 40px 20px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <img src="images/logo-bandara.jpg" height="48" crossorigin="anonymous">
        <small style="opacity:.8">bandarahaluoleo.id</small>
      </div>

      <h1 style="font-size:42px;line-height:1.1;margin:30px 0 12px">
        Daftar Rute dan Maskapai<br>
        Bandara Halu Oleo
      </h1>

      <p style="max-width:720px;font-size:16px;opacity:.9">
        Informasi rute penerbangan dari Kendari (KDI)
      </p>
    </div>
  `;

  /* ===== LOGO MASKAPAI ===== */
  box.innerHTML += `
    <div style="
      background:rgba(255,255,255,.1);
      margin:20px 40px;
      padding:16px;
      border-radius:14px;
    ">
      <strong>Maskapai yang Melayani</strong>
      <div style="display:flex;gap:20px;margin-top:12px;flex-wrap:wrap">
        ${Object.entries(AIRLINE_LOGOS).map(
          ([name, logo]) =>
            `<img src="${logo}" height="28" title="${name}" crossorigin="anonymous">`
        ).join("")}
      </div>
    </div>
  `;

  /* ===== DATA RUTE ===== */
  const grouped = {};

  routes.forEach(r => {
    const statusKey = r.status.toLowerCase().replace(/\s+/g, "-");
    if (!["aktif", "aktif-kembali", "akan-datang"].includes(statusKey)) return;

    const key = `${r.origin} – ${r.destination}`;
    if (!grouped[key]) {
      grouped[key] = {
        aktif: new Set(),
        "aktif-kembali": { airlines: new Set(), date: null },
        "akan-datang": { airlines: new Set(), date: null }
      };
    }

    if (statusKey === "aktif") grouped[key].aktif.add(r.airline);
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
  content.style.padding = "20px 40px 40px";

  Object.keys(grouped).forEach(route => {
    const r = grouped[route];
    const [origin, destination] = route.split(" – ");
    const originImg = DESTINATION_IMAGES[origin];
    const destImg = DESTINATION_IMAGES[destination];

    content.innerHTML += `
      <div style="
        background:white;
        color:#1f2937;
        border-radius:18px;
        padding:20px;
        margin-bottom:18px;
      ">

        ${(originImg || destImg) ? `
          <div style="
            display:grid;
            grid-template-columns:1fr 40px 1fr;
            align-items:center;
            gap:10px;
            margin-bottom:14px;
          ">
            <div>
              <img src="${originImg}" crossorigin="anonymous"
                style="width:100%;height:140px;object-fit:cover;border-radius:12px">
              <div style="text-align:center;font-weight:600;margin-top:6px">
                ${origin}
              </div>
            </div>

            <div style="text-align:center;font-size:22px">✈</div>

            <div>
              <img src="${destImg}" crossorigin="anonymous"
                style="width:100%;height:140px;object-fit:cover;border-radius:12px">
              <div style="text-align:center;font-weight:600;margin-top:6px">
                ${destination}
              </div>
            </div>
          </div>
        ` : ""}

        ${r.aktif.size
          ? `<p><strong>Aktif:</strong> ${[...r.aktif].join(", ")}</p>`
          : ""}

        ${r["aktif-kembali"].airlines.size
          ? `<p><strong>Aktif Kembali (${r["aktif-kembali"].date}):</strong>
              ${[...r["aktif-kembali"].airlines].join(", ")}</p>`
          : ""}

        ${r["akan-datang"].airlines.size
          ? `<p><strong>Akan Terbang (${r["akan-datang"].date}):</strong>
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
      font-size:14px;
      opacity:.4;
    ">
      © Bandara Halu Oleo Kendari
    </div>
  `;

  document.body.appendChild(box);

  /* ===== EXPORT (AMAN DI CHROME) ===== */
  html2canvas(box, {
    scale: 2,
    useCORS: true,
    backgroundColor: null
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    box.remove();
  });
}
