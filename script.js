/* ============================================================
   MSS Keygen — site logic (kept simple)
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
document.querySelectorAll("#navDiscord, #heroDiscord, #ctaDiscord").forEach((el) => {
  el.href = DISCORD_URL;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
});

/* Tool tiles */
function makeTile(item) {
  const tile = document.createElement("div");
  tile.className = "tile";

  const img = document.createElement("img");
  img.className = "tile-logo";
  img.src = item.logo; img.alt = item.name; img.loading = "lazy";
  img.onerror = () => {
    const fb = document.createElement("div");
    fb.className = "tile-fallback";
    fb.textContent = item.name.charAt(0).toUpperCase();
    img.replaceWith(fb);
  };

  const text = document.createElement("div");
  const name = document.createElement("span");
  name.className = "tile-name"; name.textContent = item.name;
  const sub = document.createElement("span");
  sub.className = "tile-sub"; sub.textContent = "supported";
  text.append(name, sub);

  tile.append(img, text);
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

/* Terminal text (honest status, no fake key) */
(function term() {
  const el = document.getElementById("termBody");
  if (!el) return;
  el.innerHTML =
    `$ mss_keygen --status\n` +
    `executors: <span class="b">${EXECUTORS.map((e) => e.name).join(", ")}</span>\n` +
    `externals: <span class="b">${EXTERNALS.map((e) => e.name).join(", ")}</span>\n` +
    `status: <span class="g">online</span>`;
})();

/* Live Discord counts (real, via invite API) */
(function discord() {
  const live = document.getElementById("heroLive");
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
      if (typeof members === "number") {
        const m = members.toLocaleString();
        const o = (online || 0).toLocaleString();
        if (live) live.innerHTML = `<span class="live-dot"></span> ${m} members · ${o} online`;
        if (count) count.textContent = `${m} members · ${o} online now`;
      }
    } catch (err) {
      console.warn("Discord count unavailable:", err);
      if (live) live.innerHTML = `<span class="live-dot"></span> join us on Discord`;
      if (count) count.textContent = "";
    }
  }
  refresh();
  setInterval(refresh, 60000);
})();

/* Footer year */
document.getElementById("year").textContent = new Date().getFullYear();

/* Subtle border on nav once scrolled */
(function navBorder() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
})();
