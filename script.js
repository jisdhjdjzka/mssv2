/* ============================================================
   MSS Keygen — site logic
   ============================================================ */

// ---- CONFIG ----
const DISCORD_URL = "https://discord.gg/keygen";
const DISCORD_INVITE_CODE = "keygen";

// Add a PNG to assets/logos/ matching the path, or a letter badge shows instead.
const EXECUTORS = [
  { name: "Potassium", logo: "assets/logos/potassium.png" },
  { name: "Volt",      logo: "assets/logos/volt.png" },
  { name: "Cosmic",    logo: "assets/logos/cosmic_logo.png" },
  { name: "Synapse Z", logo: "assets/logos/synz.webp" },
];
const EXTERNALS = [
  { name: "Matcha", logo: "assets/logos/matcha.png" },
  { name: "Matrix", logo: "assets/logos/Matrix.png" },
];
// ----------------

/* Discord links */
document.querySelectorAll("#navDiscord, #heroDiscord, #ctaDiscord, #footDiscord").forEach((el) => {
  el.href = DISCORD_URL;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
});

/* small helper: image with letter-badge fallback */
function logoEl(item, imgClass, fbClass) {
  const img = document.createElement("img");
  img.className = imgClass;
  img.src = item.logo; img.alt = item.name; img.loading = "lazy";
  img.onerror = () => {
    const fb = document.createElement("div");
    fb.className = fbClass;
    fb.textContent = item.name.charAt(0).toUpperCase();
    img.replaceWith(fb);
  };
  return img;
}

/* Supported tiles */
function makeTile(item) {
  const tile = document.createElement("div");
  tile.className = "tile";
  const text = document.createElement("div");
  const name = document.createElement("span");
  name.className = "tile-name"; name.textContent = item.name;
  const sub = document.createElement("span");
  sub.className = "tile-sub"; sub.textContent = "supported";
  text.append(name, sub);
  tile.append(logoEl(item, "tile-logo", "tile-fallback"), text);
  return tile;
}
function fill(gridId, countId, list) {
  const grid = document.getElementById(gridId);
  if (grid) list.forEach((item) => grid.appendChild(makeTile(item)));
  const count = document.getElementById(countId);
  if (count) count.textContent = `(${list.length})`;
}
fill("executorsGrid", "execCount", EXECUTORS);
fill("externalsGrid", "extCount", EXTERNALS);

/* Tools-supported stat (dynamic) */
const toolsCount = document.getElementById("toolsCount");
if (toolsCount) toolsCount.textContent = EXECUTORS.length + EXTERNALS.length;

/* Hero client visual — filterable list of supported tools */
(function clientVisual() {
  const main = document.getElementById("clientMain");
  const side = document.getElementById("clientSide");
  if (!main) return;

  const tagged = [
    ...EXECUTORS.map((t) => ({ ...t, kind: "exec" })),
    ...EXTERNALS.map((t) => ({ ...t, kind: "ext" })),
  ];
  tagged.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cm-row";
    row.dataset.kind = item.kind;
    const name = document.createElement("span");
    name.className = "cm-name"; name.textContent = item.name;
    const tag = document.createElement("span");
    tag.className = "cm-tag"; tag.innerHTML = '<span class="live-dot"></span> ready';
    row.append(logoEl(item, "cm-logo", "cm-fallback"), name, tag);
    main.appendChild(row);
  });

  if (!side) return;
  side.addEventListener("click", (e) => {
    const btn = e.target.closest(".cs-item");
    if (!btn) return;
    side.querySelectorAll(".cs-item").forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    main.querySelectorAll(".cm-row").forEach((row) => {
      row.style.display = (f === "all" || row.dataset.kind === f) ? "" : "none";
    });
  });
})();

/* Hero "works with" logo strip */
(function worksStrip() {
  const wrap = document.getElementById("worksLogos");
  if (!wrap) return;
  [...EXECUTORS, ...EXTERNALS].forEach((item) => {
    const el = logoEl(item, "wl", "wl-fb");
    el.title = item.name;
    wrap.appendChild(el);
  });
})();

/* Live Discord counts (real, via invite API) */
(function discord() {
  const member = document.getElementById("memberCount");
  const count = document.getElementById("discordCount");
  async function refresh() {
    try {
      const res = await fetch(
        `https://discord.com/api/v9/invites/${DISCORD_INVITE_CODE}?with_counts=true`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const d = await res.json();
      const members = d.approximate_member_count;
      const online = d.approximate_presence_count;
      if (member && typeof members === "number") member.textContent = members.toLocaleString();
      if (count && typeof members === "number") {
        count.textContent = `${members.toLocaleString()} members · ${(online || 0).toLocaleString()} online now`;
      }
    } catch (err) {
      console.warn("Discord count unavailable:", err);
      if (member) member.textContent = "—";
    }
  }
  refresh();
  setInterval(refresh, 60000);
})();

/* Reveal on scroll */
(function reveal() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((ents, o) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
})();

/* Nav border on scroll */
(function navBorder() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
})();

/* Active nav link (scroll-spy) */
(function scrollSpy() {
  const links = {};
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (id && document.getElementById(id)) links[id] = a;
  });
  const ids = Object.keys(links);
  if (!ids.length) return;
  const spy = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (e.isIntersecting) {
        ids.forEach((id) => links[id].classList.toggle("active", id === e.target.id));
      }
    });
  }, { rootMargin: "-50% 0px -50% 0px" });
  ids.forEach((id) => spy.observe(document.getElementById(id)));
})();

/* Mobile menu */
(function mobileMenu() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  if (!nav || !toggle) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll("#navLinks a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

/* Copy download link */
(function copyLink() {
  const btn = document.getElementById("copyLink");
  const dl = document.getElementById("dlBtn");
  if (!btn || !dl) return;
  const label = btn.querySelector("span");
  btn.addEventListener("click", async () => {
    const url = dl.href;
    try {
      await navigator.clipboard.writeText(url);
      btn.classList.add("copied");
      if (label) label.textContent = "Copied";
      setTimeout(() => {
        btn.classList.remove("copied");
        if (label) label.textContent = "Copy link";
      }, 1600);
    } catch {
      // fallback: select-and-copy via a temp textarea
      const ta = document.createElement("textarea");
      ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
      btn.classList.add("copied");
      if (label) label.textContent = "Copied";
      setTimeout(() => {
        btn.classList.remove("copied");
        if (label) label.textContent = "Copy link";
      }, 1600);
    }
  });
})();

/* FAQ accordion */
(function faq() {
  document.querySelectorAll(".faq-item .faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      const ans = item.querySelector(".faq-a");
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
        o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        ans.style.maxHeight = ans.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });
})();

/* Footer year */
document.getElementById("year").textContent = new Date().getFullYear();
