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
  });
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.addEventListener("click", () => {
      nav?.classList.remove("menu-open");
      navToggle?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

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

  /* ----- Reveal on scroll ----- */
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

  /* ----- Auto-reveal commonly grouped items ----- */
  document.querySelectorAll(".stat, .skill-card, .project-card, .cert-card, .edu-card, .exp-row, .about-photo, .about-body")
    .forEach(el => {
      if (!el.classList.contains("reveal")) {
        el.classList.add("reveal");
      }
    });
  document.querySelectorAll(".reveal:not(.in-view)").forEach(el => {
    if ("IntersectionObserver" in window) {
      const ob = new IntersectionObserver((entries, o) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            o.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
      ob.observe(el);
    } else {
      el.classList.add("in-view");
    }
  });

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
    attack: {
      title: "Attack Identification Tool",
      problem: "Analysts need clearer ways to turn indicators and observed behavior into attack classifications they can investigate.",
      built: "A security-analysis tooling concept focused on organizing attack signals into cleaner classifications and analyst-friendly output.",
      tools: "Python, detection logic, classification workflow, security analysis documentation.",
      outcome: "A portfolio-ready detection support concept that complements SOC triage and investigation workflows.",
      link: "https://github.com/svemula17/attack_identification_tool"
    },
    image: {
      title: "AWS Image AI Tagging",
      problem: "Uploaded image assets become difficult to organize and search without useful metadata extraction.",
      built: "A cloud-native image workflow using upload, tagging, and searchable metadata patterns for asset organization.",
      tools: "AWS storage patterns, metadata tagging, serverless workflow concepts.",
      outcome: "A clearer pattern for searchable cloud-hosted media assets and automated metadata enrichment.",
      link: "https://github.com/PeterMangoro/cloudComputingDiscussion1"
    },
    sentiment: {
      title: "AWS Sentiment Analysis System",
      problem: "Teams receive large volumes of feedback that are slow to manually review, especially when negative sentiment needs fast attention.",
      built: "A serverless AWS system that processes CSV/JSON/TXT feedback through Lambda, stores results in DynamoDB, displays trends in a Nuxt/Vue dashboard, and sends SNS alerts.",
      tools: "AWS S3, Lambda, DynamoDB, API Gateway, SNS, CloudWatch, Nuxt/Vue, Chart.js, Tailwind CSS.",
      outcome: "A free-tier optimized platform with real-time insights, exportable results, and negative sentiment alerts.",
      link: "https://github.com/PeterMangoro/cloudComputingDiscussion1"
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
    if (caseLink) caseLink.href = data.link;
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

  /* ----- Footer year ----- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
