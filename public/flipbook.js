// flipbook.js
// === Dropbox PDF Flipbook Viewer ===

const pdfUrl = "https://www.dropbox.com/scl/fi/3ycagpy5mb1oneob23gsw/big-quran.pdf?rlkey=jc42u5xla0xxrgywbele61rzy&st=bseaaeg7&dl=1";

// PDF.js load
if (typeof pdfjsLib === "undefined") {
  alert("PDF.js not loaded!");
}

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js";

const flipbookContainer = document.getElementById("flipbook");
const zoomSlider = document.getElementById("zoom-slider");
let pdfDoc = null;
let scale = 1.5; // zoom level
let totalPages = 0;

// Load PDF from Dropbox
async function loadPDF() {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    pdfDoc = await loadingTask.promise;
    totalPages = pdfDoc.numPages;

    console.log(`📘 Loaded ${totalPages} pages from Dropbox PDF`);
    await renderFlipbook();
  } catch (error) {
    console.error("PDF Load Error:", error);
    flipbookContainer.innerHTML = `<p style="color:red">Failed to load PDF. Please check the Dropbox link.</p>`;
  }
}

// Render each page to image (lazy load)
async function renderFlipbook() {
  flipbookContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageDiv = document.createElement("div");
    pageDiv.classList.add("page");
    pageDiv.innerHTML = `<div class="loader">Loading page ${i}...</div>`;
    flipbookContainer.appendChild(pageDiv);

    // Lazy load image when visible
    const observer = new IntersectionObserver(async (entries, obs) => {
      if (entries[0].isIntersecting) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        pageDiv.innerHTML = "";
        pageDiv.appendChild(canvas);
        obs.unobserve(pageDiv);
      }
    });
    observer.observe(pageDiv);
  }

  initTurnJS();
}

// Initialize Turn.js for flip animation
function initTurnJS() {
  $("#flipbook").turn({
    width: 900,
    height: 600,
    autoCenter: true,
    elevation: 50,
    gradients: true,
    when: {
      turned: (e, page) => console.log("Turned to page:", page),
    },
  });

  // Swipe gestures
  $("#flipbook").on("swipeleft", () => $("#flipbook").turn("next"));
  $("#flipbook").on("swiperight", () => $("#flipbook").turn("previous"));
}

// Zoom slider
if (zoomSlider) {
  zoomSlider.addEventListener("input", (e) => {
    scale = parseFloat(e.target.value);
    renderFlipbook();
  });
}

// Load on start
document.addEventListener("DOMContentLoaded", loadPDF);
