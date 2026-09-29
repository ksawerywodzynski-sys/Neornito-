/* =========================================================
   NEORNITO — Base scripts
   Header state · Mobile nav · Scroll reveal · Active link
   Stat counters · Hero parallax · Form validation · Footer year
   ========================================================= */
(() => {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: solid on scroll, hide on scroll down ---------- */
  const header = $(".site-header");
  let lastY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    const navOpen = document.body.classList.contains("nav-open");
    header.classList.toggle("is-hidden", !navOpen && y > lastY && y > 400);
    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
  updateHeader();

  /* ---------- Mobile navigation ---------- */
  const toggle = $(".nav-toggle");
  const nav = $("#nav");

  const setNav = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  };
  toggle.addEventListener("click", () => setNav(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });
  window.matchMedia("(min-width: 881px)").addEventListener("change", (e) => { if (e.matches) setNav(false); });

  /* ---------- Scroll reveal (staggered per parent) ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const groups = new Map();
    reveals.forEach((el) => {
      const siblings = groups.get(el.parentElement) || [];
      el.style.setProperty("--delay", `${Math.min(siblings.length * 0.08, 0.4)}s`);
      siblings.push(el);
      groups.set(el.parentElement, siblings);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Active nav link ---------- */
  const navLinks = $$(".nav-list a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Stat counters ---------- */
  const formatNum = (n, decimals) =>
    n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (reducedMotion) { el.textContent = formatNum(target, decimals) + suffix; return; }

    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Hero: gradient follows the pointer ---------- */
  const heroBg = $(".hero-bg");
  if (heroBg && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 40;
      ty = (e.clientY / window.innerHeight - 0.5) * 40;
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      heroBg.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Contact form validation ---------- */
  const form = $("#contact-form");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const setError = (input, msg) => {
    const field = input.closest(".field");
    if (!field) return;
    field.classList.toggle("has-error", Boolean(msg));
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    const err = $(".error", field);
    if (err) err.textContent = msg || "";
  };

  const validate = (input) => {
    const v = input.value.trim();
    if (input.required && !v) return "This field is required.";
    if (input.type === "email" && v && !emailRe.test(v)) return "Please enter a valid email address.";
    if (input.name === "message" && v && v.length < 10) return "Please write a little more (10+ characters).";
    return "";
  };

  if (form) {
    const inputs = $$("input:not([type=checkbox]), textarea", form);
    inputs.forEach((input) => {
      input.addEventListener("blur", () => setError(input, validate(input)));
      input.addEventListener("input", () => {
        if (input.closest(".field")?.classList.contains("has-error")) setError(input, validate(input));
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = $(".form-status", form);
      let firstInvalid = null;

      inputs.forEach((input) => {
        const msg = validate(input);
        setError(input, msg);
        if (msg && !firstInvalid) firstInvalid = input;
      });

      const consent = $("[name=consent]", form);
      if (!consent.checked) {
        status.style.color = "#e2685a";
        status.textContent = "Please agree to the privacy note to continue.";
        firstInvalid = firstInvalid || consent;
      }
      if (firstInvalid) { firstInvalid.focus(); return; }

      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      btn.textContent = "Sending…";

      // TODO: replace with real endpoint, e.g.
      // await fetch("/api/contact", { method: "POST", body: new FormData(form) });
      await new Promise((r) => setTimeout(r, 900));

      status.style.color = "";
      status.textContent = "Thank you — we'll be in touch within a few working days.";
      form.reset();
      btn.disabled = false;
      btn.textContent = "Send message";
    });
  }

  /* ---------- Newsletter ---------- */
  const nl = $("#newsletter-form");
  if (nl) {
    nl.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", nl);
      const status = $(".newsletter-status");
      if (!emailRe.test(input.value.trim())) {
        status.style.color = "#e2685a";
        status.textContent = "Please enter a valid email.";
        input.focus();
        return;
      }
      // TODO: connect to newsletter provider
      status.style.color = "";
      status.textContent = "Subscribed. First field notes arrive next season.";
      nl.reset();
    });
  }

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
