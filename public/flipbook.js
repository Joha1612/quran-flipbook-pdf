const flipbook = document.getElementById("flipbook");
const controls = document.getElementById("controls");

const pdfUrl = "https://www.dropbox.com/scl/fi/3ycagpy5mb1oneob23gsw/big-quran.pdf?rlkey=jc42u5xla0xxrgywbele61rzy&st=79n47nwh&dl=1";
let zoomLevel = 1;

pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
  const totalPages = pdf.numPages;

  // প্রতিটি পেজ create করে flipbook এ append করা
  for(let i=1;i<=totalPages;i++){
    const canvas = document.createElement("canvas");
    canvas.className = "pageCanvas";
    flipbook.appendChild(canvas);

    // Lazy render
    pdf.getPage(i).then(page=>{
      const viewport = page.getViewport({ scale:1 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: canvas.getContext("2d"), viewport });
    });
  }

  // Initialize turn.js flipbook
  $(flipbook).turn({
    width: "100%",
    height: "100%",
    autoCenter: true,
    display: "double",
    acceleration: true,
    gradients: true,
    elevation: 50
  });
});

// Navigation buttons
document.getElementById("prevBtn").addEventListener("click",()=>$(flipbook).turn("previous"));
document.getElementById("nextBtn").addEventListener("click",()=>$(flipbook).turn("next"));

// Zoom buttons
document.getElementById("zoomInBtn").addEventListener("click",()=>{
  zoomLevel += 0.2;
  flipbook.style.transform = `scale(${zoomLevel})`;
});
document.getElementById("zoomOutBtn").addEventListener("click",()=>{
  zoomLevel = Math.max(1, zoomLevel-0.2);
  flipbook.style.transform = `scale(${zoomLevel})`;
});

// Swipe support
let startX = 0;
flipbook.addEventListener("touchstart",(e)=>{ startX = e.touches[0].clientX; });
flipbook.addEventListener("touchend",(e)=>{
  const endX = e.changedTouches[0].clientX;
  if(startX - endX > 50) $(flipbook).turn("next");
  if(endX - startX > 50) $(flipbook).turn("previous");
});
