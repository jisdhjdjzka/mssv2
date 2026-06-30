/* ============================================================
   MSS Keygen — site logic
   ============================================================ */

// ---- CONFIG ----
const DISCORD_URL = "https://discord.gg/TnHFe95MnW";
const DISCORD_INVITE_CODE = "TnHFe95MnW";

// Add a PNG to assets/logos/ matching the path, or a letter badge shows instead.
const EXECUTORS = [
  { name: "Potassium", logo: "assets/logos/potassium.png" },
  { name: "Volt",      logo: "assets/logos/volt.png" },
];
const EXTERNALS = [
  { name: "Matcha", logo: "assets/logos/matcha.png" },
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

/* Hero client visual — list supported tools as rows */
(function clientVisual() {
  const main = document.getElementById("clientMain");
  if (!main) return;
  [...EXECUTORS, ...EXTERNALS].forEach((item) => {
    const row = document.createElement("div");
    row.className = "cm-row";
    const name = document.createElement("span");
    name.className = "cm-name"; name.textContent = item.name;
    const tag = document.createElement("span");
    tag.className = "cm-tag"; tag.innerHTML = '<span class="live-dot"></span> ready';
    row.append(logoEl(item, "cm-logo", "cm-fallback"), name, tag);
    main.appendChild(row);
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

/* Footer year */
document.getElementById("year").textContent = new Date().getFullYear();
