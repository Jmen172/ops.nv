function scaleCaptivateStyle(baseWidth = 1500, baseHeight = 800) {
  const container = document.querySelector(".main-content") || document.body;

  function applyScale() {
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    const scaleX = winW / baseWidth;
    const scaleY = winH / baseHeight;

    // Ambil scale yang terkecil untuk menjaga rasio
    const scale = Math.min(scaleX, scaleY);

    container.style.width = baseWidth + "px";
    container.style.height = baseHeight + "px";
    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = "top left";
    container.style.position = "absolute";
    container.style.left = `${(winW - baseWidth * scale) / 2}px`;
    container.style.top = `${(winH - baseHeight * scale) / 2}px`;
  }

  window.addEventListener("resize", applyScale);
  window.addEventListener("orientationchange", applyScale);
  window.addEventListener("load", applyScale);
  applyScale(); // Jalankan langsung saat dimuat
}

document.addEventListener("DOMContentLoaded", () => {
  scaleCaptivateStyle(1500, 800);
});