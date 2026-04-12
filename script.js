const SHEET_ID = '1GE83Y_59Fnkn6qP5WnZH-FHkTpkI3E7yHC_l7TYXBzg';

// Önbellek kırmak için versiyon numarası
const SESSION_VERSION = new Date().getTime();
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&nocache=${SESSION_VERSION}`; 

let allData = [];
let currentMediaType = ''; // Yeni: Medya listeleme filtresi için

document.addEventListener("DOMContentLoaded", () => {
    fetchData();

    // 1. Dinamik Kart Modalı Arkaplana tıklayınca kapatma
    document.getElementById("infoModal").addEventListener('click', function(e) {
        if(e.target === this) {
            closeModal();
        }
    });

    // 2. İnfografik Görsel Modalı Arkaplana tıklayınca kapatma
    document.getElementById("imageModal").addEventListener('click', function(e) {
        if(e.target === this) {
            closeImageModal();
        }
    });
});

function fetchData() {
    Papa.parse(GOOGLE_SHEET_CSV_URL, {
        download: true,
        header: false, 
        skipEmptyLines: true,
        complete: function(results) {
            const rawData = results.data;

            if (!rawData || rawData.length < 3) {
                showError("Veriye ulaşılamadı. Tablonun paylaşıma açık olduğundan emin olun.");
                return;
            }

            const dataRows = rawData.slice(2);

            allData = dataRows.map((rowArray, index) => {
                return {
                    rowNumber: index + 3,
                    "Ana Sektör": rowArray[0] ? String(rowArray[0]).trim() : "",                             
                    "Sektör": rowArray[1] ? String(rowArray[1]).trim() : "",                                 
                    "Görsel Adı": rowArray[2] ? String(rowArray[2]).trim() : "default",                      
                    "Bu adamlar parayı nasıl kazanır?": rowArray[3] ? String(rowArray[3]).trim() : "",       
                    "Tedarikçileri kimlerdir?": rowArray[4] ? String(rowArray[4]).trim() : "",               
                    "Malı kime satarlar?": rowArray[5] ? String(rowArray[5]).trim() : "",                    
                    "Tahsilat süreleri ortalama kaç gündür?": rowArray[6] ? String(rowArray[6]).trim() : "", 
                    "Kredi İhtiyaç Dönemi": rowArray[7] ? String(rowArray[7]).trim() : "",                   
                    "Vadesiz Yaratma Dönemi": rowArray[8] ? String(rowArray[8]).trim() : "",                 
                    "Olmazsa Olmazlar": rowArray[9] ? String(rowArray[9]).trim() : "",                       
                    "Çapraz Satış Fırsatları": rowArray[10] ? String(rowArray[10]).trim() : "",              
                    "Fırsat": rowArray[11] ? String(rowArray[11]).trim() : "",                               
                    "Risk": rowArray[12] ? String(rowArray[12]).trim() : "",
                    "Video Linki": rowArray[13] ? String(rowArray[13]).trim() : "",    // N Sütunu
                    "Ses Linki": rowArray[14] ? String(rowArray[14]).trim() : "",      // O Sütunu 
                    "Görsel Linki": rowArray[15] ? String(rowArray[15]).trim() : ""    // P Sütunu
                };
            });

            renderSidebar(allData);
            
            const anaSektorler = [...new Set(allData.map(r => r["Ana Sektör"]).filter(Boolean))];
            const marquee = document.getElementById("marqueeContent");
            if(marquee && anaSektorler.length > 0) {
                let itemsHtml = anaSektorler.map(item => `<div class="marquee-item">${item}</div>`).join("");
                marquee.innerHTML = itemsHtml + itemsHtml; 
            }

            document.getElementById("loader").style.display = "none";
        },
        error: function(err) {
            showError("Bağlantı reddedildi. Güvenlik ayarlarını kontrol edin.");
        }
    });
}

function showError(message) {
    const loader = document.getElementById("loader");
    loader.innerHTML = `<div style="text-align:center; padding: 20px;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; margin-bottom: 15px; color: #ef4444;"></i>
        <h3 style="color: #1e293b; margin-bottom: 10px;">Bağlantı Hatası</h3>
        <p style="color: #64748b;">${message}</p>
    </div>`;
}

function cleanIconName(rawName) {
    if (!rawName) return "default";
    let cleaned = String(rawName);
    
    cleaned = cleaned.replace(/\.svg/i, ''); 
    cleaned = cleaned.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-'); 
    cleaned = cleaned.replace(/[\s\u200B-\u200D\uFEFF\r\n]/g, ''); 
    
    return cleaned.toLowerCase(); 
}

function renderSidebar(data) {
    const listElement = document.getElementById("sectorList");
    listElement.innerHTML = "";

    data.forEach((row) => {
        const anaSektor = row["Ana Sektör"];
        const sektor = row["Sektör"];

        if(!sektor) return;

        const gorselAdi = cleanIconName(row["Görsel Adı"]);
        const iconPath = `icons/${gorselAdi}.svg?v=${SESSION_VERSION}`;
        const fallbackSVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Crect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22 ry=%222%22%3E%3C/rect%3E%3Ccircle cx=%228.5%22 cy=%228.5%22 r=%221.5%22%3E%3C/circle%3E%3Cpolyline points=%2221 15 16 10 5 21%22%3E%3C/polyline%3E%3C/svg%3E";

        const li = document.createElement("li");
        li.className = "sector-item";
        li.setAttribute("data-sektor", sektor); 
        
        li.innerHTML = `
            <div class="sector-icon" style="background-color: transparent;">
                <img src="${iconPath}" alt="${sektor}" style="width: 32px; height: 32px; object-fit: contain;" onerror="this.onerror=null; this.src='${fallbackSVG}';">
            </div>
            <div class="sector-info">
                <h3>${sektor}</h3>
                <p>${anaSektor}</p>
            </div>
        `;
        
        // GÜNCELLEME: Sol menüden tıklandığında filtreyi sıfırla
        li.onclick = () => {
            currentMediaType = ''; 
            showDetails(row, li);
        };
        
        listElement.appendChild(li);
    });
}

// === ANA SAYFAYA DÖN BUTONU İŞLEVİ ===
function goHome() {
    currentMediaType = ''; // GÜNCELLEME: Ana sayfaya dönünce modu sıfırla
    document.getElementById("sectorDetails").style.display = "none";
    document.getElementById("mediaListView").style.display = "none";
    document.getElementById("welcomeScreen").style.display = "flex";
    
    // Sidebar'daki aktifliği kaldır
    document.querySelectorAll('.sector-item').forEach(el => el.classList.remove('active'));
}

function openMediaView(type) {
    currentMediaType = type;
    
    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("sectorDetails").style.display = "none";
    document.getElementById("mediaListView").style.display = "block";
    document.getElementById("mediaSearchInput").value = ""; // Aramayı sıfırla

    let title = "";
    if(type === 'read') title = "<i class='fa-solid fa-book-open'></i> Tüm Sektörleri İncele";
    if(type === 'video') title = "<i class='fa-solid fa-play'></i> Sektör Videoları";
    if(type === 'audio') title = "<i class='fa-solid fa-headphones'></i> Sektör Podcastleri";
    if(type === 'analyze') title = "<i class='fa-solid fa-chart-pie'></i> İnfografik ve Analizler";

    document.getElementById("mlTitle").innerHTML = title;
    renderMediaList();
}

function renderMediaList() {
    const grid = document.getElementById("mediaGrid");
    grid.innerHTML = "";
    const query = document.getElementById("mediaSearchInput").value.toLowerCase();

    const fallbackSVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Crect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22 ry=%222%22%3E%3C/rect%3E%3Ccircle cx=%228.5%22 cy=%228.5%22 r=%221.5%22%3E%3C/circle%3E%3Cpolyline points=%2221 15 16 10 5 21%22%3E%3C/polyline%3E%3C/svg%3E";

    allData.forEach(row => {
        // İlgili veri yoksa pas geç
        if(currentMediaType === 'video' && (!row["Video Linki"] || row["Video Linki"] === "")) return;
        if(currentMediaType === 'audio' && (!row["Ses Linki"] || row["Ses Linki"] === "")) return;
        if(currentMediaType === 'analyze' && (!row["Görsel Linki"] || row["Görsel Linki"] === "")) return;
        // 'read' seçildiyse hepsini göster

        const sName = row["Sektör"] || "";
        const aName = row["Ana Sektör"] || "";

        // Arama filtresi
        if(!sName.toLowerCase().includes(query) && !aName.toLowerCase().includes(query)) return;

        const gorselAdi = cleanIconName(row["Görsel Adı"]);
        const iconPath = `icons/${gorselAdi}.svg?v=${SESSION_VERSION}`;

        const card = document.createElement("div");
        card.className = "m-card";
        card.innerHTML = `
            <div class="m-icon">
                <img src="${iconPath}" alt="icon" onerror="this.onerror=null; this.src='${fallbackSVG}';">
            </div>
            <h3>${sName}</h3>
            <p>${aName}</p>
        `;
        
        card.onclick = () => {
            const liElement = Array.from(document.querySelectorAll('.sector-item')).find(el => el.getAttribute('data-sektor') === sName);
            showDetails(row, liElement);
        };
        
        grid.appendChild(card);
    });

    if(grid.innerHTML === "") {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#64748b;">
            <i class="fa-solid fa-folder-open" style="font-size:3rem; margin-bottom:15px; opacity:0.5;"></i>
            <p>Bu kategoriye ait sektör bulunamadı.</p>
        </div>`;
    }
}

function filterMediaList() {
    renderMediaList();
}


function showDetails(row, element) {
    document.querySelectorAll('.sector-item').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');

    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("mediaListView").style.display = "none";
    document.getElementById("sectorDetails").style.display = "block";

    document.getElementById("sektorTitle").innerText = row["Sektör"];
    
    // Üst Başlık İkonu 
    const gorselAdi = cleanIconName(row["Görsel Adı"]);
    const titleIcon = document.getElementById("sektorTitleIcon");
    titleIcon.src = `icons/${gorselAdi}.svg?v=${SESSION_VERSION}`;
    
    const fallbackSVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Crect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22 ry=%222%22%3E%3C/rect%3E%3Ccircle cx=%228.5%22 cy=%228.5%22 r=%221.5%22%3E%3C/circle%3E%3Cpolyline points=%2221 15 16 10 5 21%22%3E%3C/polyline%3E%3C/svg%3E";
    titleIcon.onerror = function() {
        this.onerror = null;
        this.src = fallbackSVG;
    };
    titleIcon.style.display = "block";
    document.getElementById("anaSektorBadge").innerText = row["Ana Sektör"];

    // MEDYA DOSYALARINI GOOGLE SHEETS CLOUDINARY LİNKLERİNDEN ÇEKME
    const videoContainer = document.getElementById("videoContainer");
    const audioContainer = document.getElementById("audioContainer");
    const infographicContainer = document.getElementById("infographicContainer");

    const videoUrl = row["Video Linki"];
    const audioUrl = row["Ses Linki"];
    const infographicUrl = row["Görsel Linki"];

    // 1. Video
    if (videoUrl) {
        videoContainer.innerHTML = `
            <video id="sectorVideo" controls style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;">
                <source src="${videoUrl}" type="video/mp4">
                Tarayıcınız video etiketini desteklemiyor.
            </video>
        `;
    } else {
        videoContainer.innerHTML = `
            <div class="media-placeholder">
                <i class="fa-brands fa-youtube"></i>
                <span>Sektör Tanıtım Videosu Bulunamadı</span>
            </div>
        `;
    }

    // 2. Ses / Podcast
    if (audioUrl) {
        audioContainer.innerHTML = `
            <h4><i class="fa-solid fa-podcast"></i> Sektör Podcasti</h4>
            <audio id="sectorAudio" controls class="custom-audio" style="width: 100%;">
                <source src="${audioUrl}" type="audio/mpeg">
                Tarayıcınız ses öğesini desteklemiyor.
            </audio>
        `;
    } else {
        audioContainer.innerHTML = `
            <h4><i class="fa-solid fa-podcast"></i> Sektör Podcasti</h4>
            <div class="media-placeholder sm" style="padding: 10px 0;">
                <i class="fa-solid fa-microphone-slash"></i>
                <span style="font-size:0.9rem;">Podcast Bulunamadı</span>
            </div>
        `;
    }

    const vidElement = document.getElementById("sectorVideo");
    const audElement = document.getElementById("sectorAudio");
    
    if (vidElement) vidElement.load();
    if (audElement) audElement.load();

    if (vidElement) {
        vidElement.addEventListener('play', () => {
            if (audElement && !audElement.paused) audElement.pause();
        });
    }

    if (audElement) {
        audElement.addEventListener('play', () => {
            if (vidElement && !vidElement.paused) vidElement.pause();
        });
    }

    // 3. İnfografik
    if (infographicUrl) {
        infographicContainer.innerHTML = `
            <img src="${infographicUrl}" 
                 alt="${row['Sektör']} İnfografik" 
                 class="dynamic-infographic"
                 onclick="openImageModal(this.src)"
                 onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'media-placeholder sm\\'><i class=\\'fa-solid fa-image\\'></i><span>İnfografik Bulunamadı</span></div>';">
        `;
    } else {
        infographicContainer.innerHTML = `
            <div class="media-placeholder sm">
                <i class="fa-solid fa-image"></i>
                <span>İnfografik Bulunamadı</span>
            </div>
        `;
    }

    // Ana Tablo Verisi
    const mainText = row["Bu adamlar parayı nasıl kazanır?"];
    document.getElementById("mainInfoText").innerText = mainText && mainText !== "" 
                                                        ? mainText 
                                                        : "Bu sektöre ait gelir modeli verisi henüz girilmemiş.";

    const grid = document.getElementById("actionGrid");
    grid.innerHTML = ""; 

    const rowsConfig = [[ 
            { title: "Tedarikçiler", key: "Tedarikçileri kimlerdir?", icon: "icons/tedarik.svg" },
            { title: "Müşteriler", key: "Malı kime satarlar?", icon: "icons/musteri.svg" }
        ],[ 
            { title: "Tahsilat Süresi", key: "Tahsilat süreleri ortalama kaç gündür?", icon: "icons/tahsilatsuresi.svg" },
            { title: "Kredi İhtiyacı", key: "Kredi İhtiyaç Dönemi", icon: "icons/krediihtiyaci.svg" },
            { title: "Vadesiz Yaratma", key: "Vadesiz Yaratma Dönemi", icon: "icons/vadesiz.svg" }
        ],[ 
            { title: "Olmazsa Olmazlar", key: "Olmazsa Olmazlar", icon: "icons/olmazsaolmaz.svg" },
            { title: "Çapraz Satış", key: "Çapraz Satış Fırsatları", icon: "icons/caprazsatis.svg" }
        ],[ 
            { title: "Fırsatlar", key: "Fırsat", icon: "icons/firsat.svg" },
            { title: "Riskler", key: "Risk", icon: "icons/risk.svg" }
        ]
    ];

    rowsConfig.forEach(rowArr => {
        const validCards = rowArr.filter(config => {
            const content = row[config.key];
            return content && content !== "";
        });

        if (validCards.length > 0) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "action-row"; 
            
            validCards.forEach(config => {
                const content = row[config.key];
                const card = document.createElement("div");
                card.className = "action-card";
                card.onclick = () => openModal(config.title, content, config.icon);
                card.innerHTML = `
                    <div class="card-icon">
                        <img src="${config.icon}" alt="${config.title}" class="custom-svg-icon">
                    </div>
                    <h4>${config.title}</h4>
                `;
                rowDiv.appendChild(card);
            });
            grid.appendChild(rowDiv);
        }
    });

    if(window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("active");
    }

    // =========================================================
    // GÜNCELLEME: SEÇİLEN KATEGORİYE GÖRE GÖRÜNÜM FİLTRELEME
    // =========================================================
    const mediaSectionEl = document.querySelector(".media-section");
    const videoCardEl = document.getElementById("videoContainer");
    const mediaSideEl = document.querySelector(".media-side");
    const audioCardEl = document.getElementById("audioContainer");
    const infoCardEl = document.getElementById("infographicContainer");
    
    const highlightCardEl = document.querySelector(".highlight-card");
    const sectionTitleEl = document.querySelector(".section-title");
    const actionGridListEl = document.getElementById("actionGrid");

    // 1. Önce her şeyi varsayılan olarak görünür yap (Önceki tıklamadan kalanları temizle)
    mediaSectionEl.style.display = "grid";
    videoCardEl.style.display = "flex";
    mediaSideEl.style.display = "flex";
    audioCardEl.style.display = "block";
    infoCardEl.style.display = "flex";
    highlightCardEl.style.display = "block";
    sectionTitleEl.style.display = "block";
    actionGridListEl.style.display = "block";

    // 2. Mevcut moda göre fazlalıkları gizle
    if (currentMediaType === 'read') {
        // SADECE OKU: Tüm medya alanını gizle
        mediaSectionEl.style.display = "none";
    } 
    else if (currentMediaType === 'video') {
        // SADECE İZLE: Sağ tarafı (ses/görsel) ve alt yazıları gizle, videoyu tam ekrana yay
        mediaSectionEl.style.display = "block"; 
        mediaSideEl.style.display = "none";
        highlightCardEl.style.display = "none";
        sectionTitleEl.style.display = "none";
        actionGridListEl.style.display = "none";
    } 
    else if (currentMediaType === 'audio') {
        // SADECE DİNLE: Video, İnfografik ve metinleri gizle
        mediaSectionEl.style.display = "block";
        videoCardEl.style.display = "none";
        infoCardEl.style.display = "none";
        highlightCardEl.style.display = "none";
        sectionTitleEl.style.display = "none";
        actionGridListEl.style.display = "none";
    } 
    else if (currentMediaType === 'analyze') {
        // SADECE ANALİZ ET: Video, Ses ve metinleri gizle
        mediaSectionEl.style.display = "block";
        videoCardEl.style.display = "none";
        audioCardEl.style.display = "none";
        highlightCardEl.style.display = "none";
        sectionTitleEl.style.display = "none";
        actionGridListEl.style.display = "none";
    }
}

// === METİN MODAL KONTROLLERİ ===
function openModal(title, text, iconSrc) {
    const modal = document.getElementById("infoModal");
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalText").innerText = text;
    document.getElementById("modalIcon").innerHTML = `<img src="${iconSrc}" alt="${title}" class="custom-svg-icon">`;
    modal.classList.add("show");
}

function closeModal() {
    document.getElementById("infoModal").classList.remove("show");
}

// === İNFOGRAFİK GÖRSEL MODAL KONTROLLERİ ===
function openImageModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalExpandedImg");
    modalImg.src = imgSrc;
    modal.classList.add("show");
}

function closeImageModal() {
    document.getElementById("imageModal").classList.remove("show");
}

// === ARAMA VE MENÜ KONTROLLERİ ===
function filterSectors() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const items = document.querySelectorAll(".sector-item");
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(input) ? "flex" : "none";
    });
}

function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("active");
}