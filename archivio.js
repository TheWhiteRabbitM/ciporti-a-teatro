/* Archivio: le clip del mosaico partono quando sono sullo schermo, le foto si aprono in grande,
   le tessere dei video portano al video intero e lo avviano. */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* clip mute del mosaico: solo quando si vedono e senza "riduci movimento" */
  const clips = [...document.querySelectorAll(".tess__clip")];
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.preload = "auto"; e.target.play().catch(() => {}); } else e.target.pause();
    }), { threshold: 0.2 });
    clips.forEach((c) => io.observe(c));
  }

  /* foto in grande */
  const items = [...document.querySelectorAll(".galleria li")].map((li) => {
    const img = li.querySelector("img");
    return { src: img.getAttribute("src"), alt: img.alt, cap: li.querySelector("p").textContent };
  });
  const lb = document.getElementById("lb"), lbImg = document.getElementById("lb-img"), lbCap = document.getElementById("lb-cap");
  let cur = 0;
  const show = (i) => { cur = (i + items.length) % items.length; lbImg.src = items[cur].src; lbImg.alt = items[cur].alt; lbCap.textContent = items[cur].cap; };
  const open = (i) => { show(i); if (typeof lb.showModal === "function") lb.showModal(); else window.open(items[cur].src, "_blank"); };
  document.querySelectorAll("[data-photo]").forEach((b) => b.addEventListener("click", () => open(+b.dataset.photo)));
  lb.querySelector(".lb__prev").addEventListener("click", () => show(cur - 1));
  lb.querySelector(".lb__next").addEventListener("click", () => show(cur + 1));
  lb.querySelector(".lb__close").addEventListener("click", () => lb.close());
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  /* scorrimento col dito sulla foto grande */
  let x0 = null;
  lb.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });

  /* le tessere dei video portano al video intero */
  document.querySelectorAll("[data-video]").forEach((b) => b.addEventListener("click", () => {
    const fig = document.getElementById(b.dataset.video);
    fig.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    const v = fig.querySelector("video");
    setTimeout(() => v.play().catch(() => {}), reduced ? 0 : 600);
  }));
})();
