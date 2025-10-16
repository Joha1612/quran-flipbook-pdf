// Quran Flipbook - Dropbox PDF Viewer
const pdfUrl = "https://www.dropbox.com/scl/fi/3ycagpy5mb1oneob23gsw/big-quran.pdf?rlkey=jc42u5xla0xxrgywbele61rzy&st=bseaaeg7&dl=1";

// ✅ PDF.js sanity check
if (typeof pdfjsLib === "undefined") {
  alert("⚠️ PDF.js not loaded! Check your internet or CDN link.");
  throw new Error("PDF.js failed to load.");
}

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const flipbookContainer = document.getElementById("flipbook");
const zoomSlider = document.getElementById("zoom-slider");

let pdfDoc = null;
let totalPages = 0;
let scale = 1.5;

async function loadPDF() {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    pdfDoc = await loadingTask.promise;
    totalPages = pdfDoc.numPages;
    console.log(`✅ Loaded ${totalPages} pages`);
    await renderFlipbook();
  } catch (err) {
    console.error("❌ PDF Load Error:", err);
    flipbookContainer.innerHTML = `<p style="color:red">PDF load failed!</p>`;
  }
}

async function renderFlipbook() {
  flipbookContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageDiv = document.createElement("div");
    pageDiv.classList.add("page");
    pageDiv.innerHTML = `<div class="loader">Loading page ${i}...</div>`;
    flipbookContainer.appendChild(pageDiv);

    // Lazy load with observer
    const observer = new IntersectionObserver(async (entries, obs) => {
      if (entries[0].isIntersecting) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        pageDiv.innerHTML = "";
        pageDiv.appendChild(canvas);
        obs.unobserve(pageDiv);
      }
    });
    observer.observe(pageDiv);
  }

  initTurnJS();
}

function initTurnJS() {
  $("#flipbook").turn({
    width: 900,
    height: 600,
    autoCenter: true,
    elevation: 50,
    gradients: true,
  });
}

if (zoomSlider) {
  zoomSlider.addEventListener("input", async (e) => {
    scale = parseFloat(e.target.value);
    await renderFlipbook();
  });
}

document.addEventListener("DOMContentLoaded", loadPDF);
