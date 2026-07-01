/* ============================================================
   MSS Keygen — site logic
   ============================================================ */

// ---- CONFIG ----
const DISCORD_URL = "https://discord.gg/keygen";
const DISCORD_INVITE_CODE = "keygen";
const VERSION = "v2.4.1";

// Add a PNG to assets/logos/ matching the path, or a letter badge shows instead.
// Set `new: true` to show a "New" badge on a tool tile.
const EXECUTORS = [
  { name: "Potassium", logo: "assets/logos/potassium.png" },
  { name: "Volt",      logo: "assets/logos/volt.png" },
  { name: "Cosmic",    logo: "assets/logos/cosmic_logo.png" },
  { name: "Synapse Z", logo: "assets/logos/synz.webp", new: true },
];
const EXTERNALS = [
  { name: "Matcha", logo: "assets/logos/matcha.png" },
  { name: "Matrix", logo: "assets/logos/Matrix.png" },
];

const UPDATES = [
  { date: "Jun 2026", title: "Synapse Z support added", desc: "Keys for Synapse Z are now fully supported.", tag: "New tool" },
  { date: "May 2026", title: "Performance improvements", desc: "Faster key generation and a leaner client.", tag: "Update" },
  { date: "Apr 2026", title: "Matrix & Matcha support", desc: "Both externals added to the supported list.", tag: "New tool" },
];
// ----------------

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Scroll reveal */
(function scrollReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (prefersReducedMotion) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver((ents, o) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      o.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => io.observe(el));
})();

/* Toast notifications */
function showToast(message, type = "success") {
  const stack = document.getElementById("toastStack");
  if (!stack) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-ic">${type === "success" ? "✓" : "ℹ"}</span><span>${message}</span>`;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 2600);
}

/* Version badge */
const dlVersion = document.getElementById("dlVersion");
if (dlVersion) dlVersion.textContent = VERSION;

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
function makeTile(item, kind) {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.dataset.name = item.name.toLowerCase();
  tile.dataset.kind = kind;
  const text = document.createElement("div");
  const name = document.createElement("span");
  name.className = "tile-name"; name.textContent = item.name;
  const sub = document.createElement("span");
  sub.className = "tile-sub"; sub.textContent = "supported";
  text.append(name, sub);
  tile.append(logoEl(item, "tile-logo", "tile-fallback"), text);
  if (item.new) {
    const badge = document.createElement("span");
    badge.className = "tile-badge"; badge.textContent = "New";
    tile.appendChild(badge);
  }
  return tile;
}
function fill(gridId, countId, list, kind) {
  const grid = document.getElementById(gridId);
  if (grid) list.forEach((item) => grid.appendChild(makeTile(item, kind)));
  const count = document.getElementById(countId);
  if (count) count.textContent = `(${list.length})`;
}
fill("executorsGrid", "execCount", EXECUTORS, "exec");
fill("externalsGrid", "extCount", EXTERNALS, "ext");

/* Changelog */
(function updates() {
  const list = document.getElementById("updateList");
  if (!list) return;
  UPDATES.forEach((u) => {
    const item = document.createElement("article");
    item.className = "update-item";
    item.innerHTML = `
      <time class="update-date">${u.date}</time>
      <div class="update-body">
        <div class="update-title">${u.title}</div>
        <p class="update-desc">${u.desc}</p>
        ${u.tag ? `<span class="update-tag">${u.tag}</span>` : ""}
      </div>`;
    list.appendChild(item);
  });
})();

/* Tool search + category filter */
(function toolFilters() {
  const input = document.getElementById("toolSearch");
  const clear = document.getElementById("toolSearchClear");
  const empty = document.getElementById("toolSearchEmpty");
  const tabs = document.getElementById("filterTabs");
  let category = "all";

  const groups = [
    { el: document.getElementById("executorsGrid")?.closest(".support-group"), grid: document.getElementById("executorsGrid"), kind: "exec" },
    { el: document.getElementById("externalsGrid")?.closest(".support-group"), grid: document.getElementById("externalsGrid"), kind: "ext" },
  ];

  function filter() {
    const q = input?.value.trim().toLowerCase() || "";
    if (clear) clear.hidden = !q;
    let visible = 0;

    groups.forEach(({ el, grid, kind }) => {
      if (!grid) return;
      const showGroup = category === "all" || category === kind;
      if (el) el.classList.toggle("hidden-group", !showGroup);

      let groupVisible = 0;
      grid.querySelectorAll(".tile").forEach((tile) => {
        const match = showGroup && (!q || tile.dataset.name.includes(q));
        tile.classList.toggle("hidden", !match);
        if (match) { groupVisible++; visible++; }
      });
      if (el) el.classList.toggle("empty", showGroup && groupVisible === 0);
    });

    if (empty) empty.hidden = visible > 0 || !q;
  }

  if (input) input.addEventListener("input", filter);
  if (clear) {
    clear.addEventListener("click", () => {
      input.value = "";
      input.focus();
      filter();
    });
  }
  if (tabs) {
    tabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".filter-tab");
      if (!tab) return;
      category = tab.dataset.filter;
      tabs.querySelectorAll(".filter-tab").forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
      });
      filter();
    });
  }
  filter();
})();

/* Press / to focus tool search */
(function searchShortcut() {
  const input = document.getElementById("toolSearch");
  if (!input) return;
  addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
    e.preventDefault();
    input.focus();
    document.getElementById("supported")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
})();

/* Tools-supported stat (dynamic) */
const toolsCount = document.getElementById("toolsCount");
if (toolsCount) toolsCount.dataset.target = EXECUTORS.length + EXTERNALS.length;

/* Hero client visual — filterable tool list */
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

/* Hero "works with" logo marquee */
(function worksStrip() {
  const track = document.getElementById("worksLogos");
  if (!track) return;
  const tools = [...EXECUTORS, ...EXTERNALS];
  const addSet = () => {
    tools.forEach((item) => {
      const el = logoEl(item, "wl", "wl-fb");
      el.title = item.name;
      track.appendChild(el);
    });
  };
  addSet();
  addSet();
})();

/* Animated counters */
function animateCounter(el, target, duration = 1200) {
  if (!el || prefersReducedMotion) {
    if (el) el.textContent = target.toLocaleString();
    return;
  }
  const start = performance.now();
  const from = 0;
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (target - from) * eased).toLocaleString();
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* Live Discord counts (real, via invite API) */
(function discord() {
  const member = document.getElementById("memberCount");
  const count = document.getElementById("discordCount");
  let memberTarget = null;

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
      if (member && typeof members === "number") {
        memberTarget = members;
        if (member.dataset.animated) {
          animateCounter(member, members, 900);
        } else {
          member.textContent = members.toLocaleString();
        }
      }
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

  /* Animate stats when visible */
  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    const io = new IntersectionObserver((ents, o) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const tools = document.getElementById("toolsCount");
        if (tools && tools.dataset.target) {
          tools.dataset.animated = "1";
          animateCounter(tools, Number(tools.dataset.target));
        }
        if (member && memberTarget !== null && !member.dataset.animated) {
          member.dataset.animated = "1";
          animateCounter(member, memberTarget);
        } else if (member && memberTarget === null) {
          refresh().then(() => {
            if (memberTarget !== null && !member.dataset.animated) {
              member.dataset.animated = "1";
              animateCounter(member, memberTarget);
            }
          });
        }
        o.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    io.observe(statsSection);
  }
})();

/* Nav border on scroll */
(function navBorder() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 4);
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
  let current = ids[0];
  const spy = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (e.isIntersecting) current = e.target.id;
    });
    ids.forEach((id) => links[id].classList.toggle("active", id === current));
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
  ids.forEach((id) => spy.observe(document.getElementById(id)));
})();

/* Mobile menu */
(function mobileMenu() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  if (!nav || !toggle) return;
  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  document.querySelectorAll("#navLinks a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) setOpen(false);
  });
})();

/* Back to top */
(function backTop() {
  const btn = document.getElementById("backTop");
  if (!btn) return;
  const onScroll = () => btn.hidden = window.scrollY < 500;
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
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
      showToast("Download link copied");
      setTimeout(() => {
        btn.classList.remove("copied");
        if (label) label.textContent = "Copy link";
      }, 1600);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); showToast("Download link copied"); } catch {}
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
    const toggle = () => {
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
    };
    q.addEventListener("click", toggle);
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
})();

/* Footer year */
document.getElementById("year").textContent = new Date().getFullYear();