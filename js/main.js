/* =========================================
   NEORNITO — Main Site
   main.js
   ========================================= */

/* -----------------------------------------
   Custom cursor (GPU-accelerated)
----------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {

  // Custom cursor
  const cursor = document.getElementById('cursor');

  document.addEventListener('mousemove', function(e) {
    cursor.style.transform = 'translate(' + (e.clientX - 3) + 'px, ' + (e.clientY - 3) + 'px)';
  });

  // Sticky nav on scroll
  window.addEventListener('scroll', function() {
    document.getElementById('nav').classList.toggle('s', window.scrollY > 40);
  });

  // Grain canvas
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
        d[i + 3] = 16;
      }

      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(drawGrain);
    }

    drawGrain();
  })();

});
