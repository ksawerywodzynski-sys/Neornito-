/* =========================================
   NEORNITO — Coming Soon
   main.js
   ========================================= */

/* -----------------------------------------
   Custom cursor
----------------------------------------- */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', function(e) {
  cursor.style.left = (e.clientX - 3) + 'px';
  cursor.style.top  = (e.clientY - 3) + 'px';
});

/* -----------------------------------------
   Grain canvas
----------------------------------------- */
(function() {
  const canvas = document.getElementById('grain');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  function drawGrain() {
    const w   = canvas.width;
    const h   = canvas.height;
    const img = ctx.createImageData(w, h);
    const d   = img.data;

    for (let i = 0; i < d.length; i += 4) {
      const v  = Math.random() * 255 | 0;
      d[i]     = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 18;
    }

    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(drawGrain);
  }

  drawGrain();
})();
