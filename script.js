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
      problem: "SOC teams get buried under raw alerts that are hard to normalize, score, and prioritize, which makes alert fatigue and missed threats more likely.",
      built: "A Python/FastAPI SIEM and SOAR stack that ingests raw logs, normalizes them, scores risk with heuristics plus anomaly detection, maps events to MITRE ATT&CK, and pushes everything into a live dashboard. The repo also includes UEBA, IOC handling, playbooks, GeoIP context, and AI-assisted incident summaries.",
      tools: "Python, FastAPI, WebSockets, SQLite, SQLAlchemy, Pydantic, scikit-learn, Claude API, Leaflet, Chart.js, MITRE ATT&CK.",
      outcome: "A practical analyst workflow with risk bands, live threat feeds, anomaly flags, MITRE heatmaps, geo context, and downloadable incident reports that are easy to hand off.",
      link: "https://github.com/svemula17/smart-siem-risk-engine"
    },
    cloud: {
      title: "Cloud Security & Deception Platform",
      problem: "Cloud misconfigurations and exposed services are easier to understand when defenders can observe how attackers discover and interact with risky assets.",
      built: "A controlled cloud security lab that deploys monitored cloud assets and deception services to study discovery, probing, and movement patterns. It focuses on turning attacker behavior into useful defensive signals instead of just a dashboard of findings.",
      tools: "AWS, cloud posture concepts, deception services, alerting, telemetry, defensive research workflow.",
      outcome: "A practical cloud security experiment that shows how deception and posture review can shape better detection strategy.",
      link: "https://github.com/saivarmadpr/Cloud_Security_Posture_-_Deception_Platform"
    },
    cooking: {
      title: "Smart Cooking App",
      problem: "Home cooks need one place to discover recipes, plan meals, track nutrition, and keep grocery prep from becoming a second job.",
      built: "A cooking assistant with recipe discovery, guided cooking mode, nutrition tracking, ingredient substitution help, and shopping-list workflows. The repo is split into mobile and backend services so the UI, AI assistant, and grocery flow can evolve independently.",
      tools: "React Native, TypeScript, Node.js, FastAPI, LangChain, PostgreSQL, Redis, Docker Compose.",
      outcome: "A more complete meal-planning experience that blends AI help with practical day-to-day cooking and grocery organization.",
      link: "https://github.com/svemula17/smart-cooking-app"
    },
    rebuild: {
      title: "Vibrant Inc Rebuild",
      problem: "Business sites often lose trust when the information architecture is cluttered and the contact path is buried under too much noise.",
      built: "A local Next.js rebuild with cleaner navigation, stronger brand credibility, metadata improvements, redirects, sitemap support, and CMS-ready content scaffolding. The contact flow is intentionally simpler so the page can convert better without feeling pushy.",
      tools: "Next.js, App Router, SEO metadata, redirects, robots.txt, sitemap.ts, typed content collections.",
      outcome: "A sharper marketing site that feels easier to scan, easier to maintain, and easier to hand off to a real content system.",
      link: "https://github.com/svemula17/vibrantrebuild.io"
    },
    awscloud: {
      title: "AWS SecureCloud",
      problem: "Cloud environments fail open when networking, identity, and monitoring are bolted on after the fact instead of designed in from the start.",
      built: "A hardened AWS reference build: multi-tier VPC with public/private subnets and security groups, least-privilege IAM with MFA, KMS-encrypted S3/RDS, and centralized logging via CloudTrail, CloudWatch, and Config. Threat detection runs on GuardDuty, Security Hub, and Inspector, with Lambda-driven auto-remediation — all defined as code in CloudFormation.",
      tools: "AWS VPC, IAM, KMS, S3, RDS, GuardDuty, Security Hub, Inspector, CloudTrail, Config, Lambda, CloudFormation.",
      outcome: "A repeatable, least-privilege cloud baseline with real-time threat detection and automated response that can be stood up from a single template.",
      link: "https://github.com/saivarmadpr/AWS-Cloud-Security-Project"
    },
    guardrail: {
      title: "AI Guardrail Testing Lab",
      problem: "Teams ship LLM features without knowing how much their guardrails actually stop, so prompt injection and data leakage slip through unnoticed.",
      built: "A realistic agentic customer-support app (LangChain, 10 tools, multi-step reasoning) wired to run the same 60 adversarial scenarios in three modes: bare (no guardrails), proxy-only (LiteLLM gateway), and full (gateway + shield middleware). Each run produces a comparison report of pass-rates across attack categories.",
      tools: "Python, LangChain, LiteLLM proxy, guardrail middleware, adversarial test harness, prompt-injection & jailbreak scenarios.",
      outcome: "Clear, side-by-side evidence of how much each guardrail layer catches — turning 'we have guardrails' into a measurable coverage number.",
      link: "https://github.com/saivarmadpr/guardrail-testing-platform"
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
