/* =========================================================
   Sai Kumar Vemula — Portfolio
   Lean interactions: theme toggle, mobile menu, scroll-spy,
   reveal-on-scroll, copy email, certifications expand,
   project case-study modal.
   ========================================================= */

(() => {
  const root = document.documentElement;

  /* ----- Theme toggle (light default, persisted) ----- */
  const STORAGE_KEY = "skv-ui";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") {
    root.setAttribute("data-ui", saved);
  }
  const modeBtn = document.getElementById("modeToggle");
  modeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-ui") === "dark" ? "light" : "dark";
    root.setAttribute("data-ui", next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  /* ----- Mobile nav menu ----- */
  const nav = document.querySelector(".nav");
  const navToggle = document.getElementById("navToggle");
  navToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("menu-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    updateNavReveal();
  });
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.addEventListener("click", () => {
      nav?.classList.remove("menu-open");
      navToggle?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  /* ----- Nav reveal: hidden over the home hero, shown once scrolling ----- */
  function updateNavReveal() {
    if (!nav) return;
    const show = window.scrollY > 64 || nav.classList.contains("menu-open");
    nav.classList.toggle("nav--show", show);
  }
  window.addEventListener("scroll", updateNavReveal, { passive: true });
  window.addEventListener("resize", updateNavReveal);
  updateNavReveal();

  /* ----- Scroll-spy on nav ----- */
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  const headerH = 80;

  function onScrollSpy() {
    const y = window.scrollY + headerH + 60;
    let currentId = sections[0]?.id || "";
    for (const sec of sections) {
      if (y >= sec.offsetTop) currentId = sec.id;
    }
    navLinks.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === `#${currentId}`);
    });
  }
  if (sections.length) {
    window.addEventListener("scroll", onScrollSpy, { passive: true });
    window.addEventListener("resize", onScrollSpy);
    onScrollSpy();
  }

  /* ----- Auto-add reveal class to grouped items ----- */
  document.querySelectorAll(".stat, .skill-card, .cert-card, .edu-card, .about-photo, .about-body")
    .forEach(el => {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
    });

  /* ----- Staggered reveals for grid children ----- */
  const STAGGER_MS = 80;
  [".stats-grid", ".skills-grid", ".cert-grid"]
    .forEach(sel => {
      document.querySelectorAll(sel).forEach(grid => {
        [...grid.children].forEach((child, i) => {
          if (child.classList.contains("reveal")) {
            child.style.transitionDelay = `${i * STAGGER_MS}ms`;
          }
        });
      });
    });

  /* ----- Reveal on scroll (single observer) ----- */
  const reveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveal.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveal.forEach(el => io.observe(el));
  } else {
    reveal.forEach(el => el.classList.add("in-view"));
  }

  /* ----- Stat number count-up ----- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const countTargets = document.querySelectorAll("[data-count-to]");

  function animateCount(el) {
    const target = parseInt(el.dataset.countTo, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && countTargets.length) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    countTargets.forEach(el => countIO.observe(el));
  } else {
    countTargets.forEach(animateCount);
  }

  /* ----- Copy email button ----- */
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(value);
        const original = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = original; }, 1100);
      } catch {
        /* clipboard might be blocked — no-op */
      }
    });
  });

  /* ----- Certifications expand ----- */
  const certToggle = document.getElementById("certToggle");
  const certMore = document.getElementById("certMore");
  certToggle?.addEventListener("click", () => {
    if (!certMore) return;
    const open = certMore.hasAttribute("hidden");
    certMore.toggleAttribute("hidden", !open);
    certToggle.setAttribute("aria-expanded", String(open));
    certToggle.textContent = open ? "Show fewer ↑" : "View all certifications →";
  });

  /* ----- Case-study modal ----- */
  const caseStudies = {
    siem: {
      title: "Smart SIEM Risk Engine",
      problem: "SOC teams drown in high-volume IDS and network alerts that aren't normalized, scored, or prioritized — leading to alert fatigue and missed real threats.",
      built: "A full Python/FastAPI SOC platform: ingestion, normalization, hybrid risk scoring (heuristic + Isolation-Forest anomaly detection), MITRE ATT&CK mapping, playbook automation, UEBA profiles, IOC intelligence, and a 15-tab WebSocket dashboard with AI Investigator chat (Claude), pivot search, ATT&CK heatmap, GeoIP map, SLA tracking, bulk ops, and downloadable incident reports.",
      tools: "Python, FastAPI, WebSockets, SQLite, SQLAlchemy, Pydantic, scikit-learn (Isolation Forest), Claude API, Leaflet, Chart.js, Jinja2, MITRE ATT&CK.",
      outcome: "An analyst workflow with risk bands, anomaly detection, live threat feeds, hunting queries, kill-chain views, automated playbooks, geo-located source-IP map, AI-assisted investigation, and downloadable executive incident reports.",
      link: "https://github.com/svemula17/smart-siem-risk-engine"
    },
    cloud: {
      title: "AI Cloud Posture Platform",
      problem: "Cloud misconfigurations and exposed services are easier to understand when defenders can observe how attackers discover and interact with risky assets.",
      built: "A controlled cloud security and deception lab that deploys intentionally monitored cloud assets to convert attacker curiosity into defensive intelligence.",
      tools: "AWS, cloud security posture concepts, deception services, alerting, defensive research workflow.",
      outcome: "A practical cloud security lab showing attacker behavior patterns and how deception can support detection strategy.",
      link: "https://github.com/saivarmadpr/Cloud_Security_Posture_-_Deception_Platform"
    },
    dvwa: {
      title: "DVWA Vulnerability Testing Lab",
      problem: "Defenders need hands-on familiarity with common web attack paths to validate controls and write better remediation guidance.",
      built: "A DVWA lab workflow for testing SQL injection, XSS, CSRF, and related OWASP Top 10 issues with documented attack steps and remediation notes.",
      tools: "DVWA, Burp Suite, browser tooling, OWASP Top 10 testing methodology.",
      outcome: "Improved offensive-security understanding that translates directly into clearer defensive recommendations.",
      link: "https://github.com/svemula17"
    },
    image: {
      title: "AWS Image AI Tagging",
      problem: "Uploaded image assets become difficult to organize and search without useful metadata extraction.",
      built: "A cloud-native image workflow using upload, tagging, and searchable metadata patterns for asset organization.",
      tools: "AWS S3, Lambda, metadata tagging, serverless workflow concepts.",
      outcome: "A clearer pattern for searchable cloud-hosted media assets and automated metadata enrichment.",
      link: ""
    },
    pentest: {
      title: "AI Pen-Test Agent",
      problem: "Manual penetration testing is slow and inconsistent — analysts need an AI-assisted workflow that suggests next steps, summarizes evidence, and keeps a clean audit trail.",
      built: "An AI agent that assists with reconnaissance, vulnerability mapping, exploit suggestion, and report generation across web and infrastructure targets. The agent reasons over scan output, proposes test cases, and writes findings into a structured report.",
      tools: "Python, Claude API, recon/scan toolchain (nmap, nuclei), web fuzzing, MITRE ATT&CK mapping.",
      outcome: "Faster pen-test triage and consistent reporting. Hands off cleanly to SOC and red-team workflows.",
      link: "https://github.com/svemula17/pentest-agent"
    }
  };

  const caseModal = document.getElementById("caseModal");
  const caseTitle = document.getElementById("caseModalTitle");
  const caseProblem = document.getElementById("caseProblem");
  const caseBuilt = document.getElementById("caseBuilt");
  const caseTools = document.getElementById("caseTools");
  const caseOutcome = document.getElementById("caseOutcome");
  const caseLink = document.getElementById("caseLink");
  let lastTrigger = null;

  function openCase(key, trigger) {
    const data = caseStudies[key];
    if (!caseModal || !data) return;
    lastTrigger = trigger || null;
    if (caseTitle) caseTitle.textContent = data.title;
    if (caseProblem) caseProblem.textContent = data.problem;
    if (caseBuilt) caseBuilt.textContent = data.built;
    if (caseTools) caseTools.textContent = data.tools;
    if (caseOutcome) caseOutcome.textContent = data.outcome;
    if (caseLink) {
      if (data.link) {
        caseLink.href = data.link;
        caseLink.style.display = "";
      } else {
        caseLink.style.display = "none";
      }
    }
    caseModal.classList.add("open");
    caseModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("case-modal-open");
  }

  function closeCase() {
    if (!caseModal) return;
    caseModal.classList.remove("open");
    caseModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("case-modal-open");
    lastTrigger?.focus?.();
  }

  document.querySelectorAll("[data-case]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openCase(el.dataset.case, el);
    });
  });
  document.querySelectorAll("[data-close-case]").forEach(el => {
    el.addEventListener("click", closeCase);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && caseModal?.classList.contains("open")) closeCase();
  });

  /* ----- Sticky-scroll projects ----- */
  const projScroller = document.querySelector(".proj-scroller");
  const projSlides = [...document.querySelectorAll(".proj-slide")];
  const projNum = document.querySelector(".proj-num");
  const projBarFill = document.querySelector(".proj-bar span");

  function syncProjects() {
    if (!projScroller || !projSlides.length) return;
    // Disable sticky behavior at narrow widths — CSS already stacks them
    if (window.matchMedia("(max-width: 900px)").matches) {
      projSlides.forEach(s => s.classList.add("is-active"));
      return;
    }
    const rect = projScroller.getBoundingClientRect();
    const total = projScroller.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(total, 1)));
    const count = projSlides.length;
    // Slight offset so the LAST slide doesn't only show at exactly progress=1
    const idx = Math.min(count - 1, Math.floor(progress * count * 0.999));
    projSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === idx));
    if (projBarFill) projBarFill.style.width = `${progress * 100}%`;
    if (projNum) {
      const cur = String(idx + 1).padStart(2, "0");
      const tot = String(count).padStart(2, "0");
      projNum.textContent = `${cur} / ${tot}`;
    }
  }

  if (projScroller && projSlides.length) {
    window.addEventListener("scroll", syncProjects, { passive: true });
    window.addEventListener("resize", syncProjects);
    syncProjects();
  }

  /* ----- Sticky-scroll experience + year rail ----- */
  const expScroller = document.querySelector(".exp-scroller");
  const expSlides = [...document.querySelectorAll(".exp-slide")];
  const expFill = document.querySelector(".exp-rail-fill");
  const expTicks = [...document.querySelectorAll(".exp-rail-tick")];

  function syncExperience() {
    if (!expScroller || !expSlides.length) return;
    if (window.matchMedia("(max-width: 900px)").matches) {
      expSlides.forEach(s => s.classList.add("is-active"));
      return;
    }
    const rect = expScroller.getBoundingClientRect();
    const total = expScroller.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(total, 1)));
    const count = expSlides.length;
    const idx = Math.min(count - 1, Math.floor(progress * count * 0.999));
    expSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === idx));
    if (expFill) expFill.style.height = `${progress * 100}%`;
    expTicks.forEach((tick, i) => {
      tick.classList.toggle("is-reached", i <= idx);
      tick.classList.toggle("is-active", i === idx);
    });
  }

  if (expScroller && expSlides.length) {
    window.addEventListener("scroll", syncExperience, { passive: true });
    window.addEventListener("resize", syncExperience);
    syncExperience();
  }

  /* ----- Footer year ----- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
