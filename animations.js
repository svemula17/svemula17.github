/* =========================================================
   Sai Kumar Vemula — Portfolio animations
   Hero particle mesh, typed role, project terminals, boot intro.
   Zero dependencies. All modules respect prefers-reduced-motion
   and no-op when their markup is absent.
   ========================================================= */

(() => {
  const root = document.documentElement;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduceMotion = () => motionQuery.matches;

  /* Theme colors: r,g,b triplets kept in CSS variables so the same
     palette drives both themes. Re-read whenever data-ui flips. */
  function meshColors() {
    const cs = getComputedStyle(root);
    const v = (name, fallback) => (cs.getPropertyValue(name).trim() || fallback);
    return {
      node: v("--mesh-node", "10,10,10"),
      link: v("--mesh-link", "10,10,10"),
      accent: v("--mesh-accent", "15,159,119")
    };
  }
  const themeWatchers = [];
  new MutationObserver(() => themeWatchers.forEach(fn => fn()))
    .observe(root, { attributes: true, attributeFilter: ["data-ui"] });

  /* ================= Hero mesh ================= */
  (function initMesh() {
    const canvas = document.getElementById("heroMesh");
    const hero = document.getElementById("home");
    if (!canvas || !hero || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");

    const LINK_DIST = 130;
    const PULSE_PERIOD = 4200;
    const PULSE_LIFE = 1200;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: -1e4, y: -1e4 };

    let colors = meshColors();
    let nodes = [];
    let W = 0, H = 0;
    let raf = 0;
    let running = false;
    let heroVisible = true;

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.offsetWidth;
      H = hero.offsetHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      const count = Math.max(30, Math.min(80, Math.floor((W * H) / 22000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: 1.4 + Math.random() * 1.1,
        // every ~14th node is a "monitored asset" that pulses green
        pulse: i % 14 === 0 ? Math.random() * PULSE_PERIOD : -1
      }));
    }

    function drawFrame(now, animate) {
      ctx.clearRect(0, 0, W, H);

      if (animate) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -10) n.x = W + 10; else if (n.x > W + 10) n.x = -10;
          if (n.y < -10) n.y = H + 10; else if (n.y > H + 10) n.y = -10;
          if (finePointer) {
            const dx = n.x - pointer.x, dy = n.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 140 * 140 && d2 > 1) {
              const d = Math.sqrt(d2);
              const f = ((140 - d) / 140) * 0.35;
              n.x += (dx / d) * f;
              n.y += (dy / d) * f;
            }
          }
        }
      }

      // links (n ≤ 80 → the O(n²) pass is ~3k checks, negligible)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.4;
          ctx.strokeStyle = `rgba(${colors.link},${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const isAsset = n.pulse >= 0;
        ctx.fillStyle = isAsset
          ? `rgba(${colors.accent},.9)`
          : `rgba(${colors.node},.55)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        if (isAsset && animate) {
          const age = (now + n.pulse) % PULSE_PERIOD;
          if (age < PULSE_LIFE) {
            const t = age / PULSE_LIFE;
            ctx.strokeStyle = `rgba(${colors.accent},${((1 - t) * 0.5).toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 4 + t * 26, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    }

    function loop(now) {
      drawFrame(now, true);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion() || document.hidden || !heroVisible) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }
    function staticFrame() {
      drawFrame(performance.now(), false);
    }

    size();
    seed();
    if (reduceMotion()) staticFrame(); else start();

    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible) start(); else stop();
    }, { threshold: 0 }).observe(hero);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        size();
        seed();
        if (!running) staticFrame();
      }, 150);
    });

    if (finePointer) {
      hero.addEventListener("pointermove", (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
      });
      hero.addEventListener("pointerleave", () => {
        pointer.x = -1e4;
        pointer.y = -1e4;
      });
    }

    themeWatchers.push(() => {
      colors = meshColors();
      if (!running) staticFrame();
    });

    motionQuery.addEventListener?.("change", () => {
      if (reduceMotion()) { stop(); staticFrame(); } else start();
    });
  })();

  /* ================= Typed rotating role ================= */
  (function initRoleTyper() {
    const el = document.getElementById("roleTyper");
    if (!el) return;
    const roles = ["DevSecOps Engineer", "Cloud Security Engineer", "Cybersecurity Analyst"];
    const TYPE_MS = 45, ERASE_MS = 25, HOLD_MS = 2200, GAP_MS = 350;
    let i = 0, timer = 0, stopped = false;

    function setStatic() {
      stopped = true;
      clearTimeout(timer);
      el.textContent = roles[0];
    }
    if (reduceMotion()) { setStatic(); return; }

    function typeRole(role, pos) {
      if (stopped) return;
      el.textContent = role.slice(0, pos);
      if (pos < role.length) {
        timer = setTimeout(() => typeRole(role, pos + 1), TYPE_MS);
      } else {
        timer = setTimeout(() => eraseRole(role, role.length), HOLD_MS);
      }
    }
    function eraseRole(role, pos) {
      if (stopped) return;
      el.textContent = role.slice(0, pos);
      if (pos > 0) {
        timer = setTimeout(() => eraseRole(role, pos - 1), ERASE_MS);
      } else {
        i = (i + 1) % roles.length;
        timer = setTimeout(() => typeRole(roles[i], 0), GAP_MS);
      }
    }
    typeRole(roles[0], el.textContent.length);

    motionQuery.addEventListener?.("change", () => {
      if (reduceMotion()) setStatic();
    });
  })();

  /* ================= Project terminals ================= */
  const termScripts = {
    siem: [
      { c: "cmd", t: "$ python risk_engine.py --stream" },
      { c: "info", t: "[INFO]  ingesting 1,204 events/min from 6 sources" },
      { c: "warn", t: "[ML]    RandomForest verdict: score 87 → HIGH" },
      { c: "info", t: "[MITRE] T1078 Valid Accounts · T1110 Brute Force" },
      { c: "ok", t: "[OK]    auto-triage complete — 3 alerts escalated ✓" }
    ],
    pentest: [
      { c: "cmd", t: "$ python agent.py --target dvwa.lab --safe-rails on" },
      { c: "info", t: "[PLAN]  recon → nmap -sV 10.0.0.12" },
      { c: "info", t: "[SCAN]  3 open ports · http 80 · apache 2.4" },
      { c: "warn", t: "[VULN]  SQLi confirmed at /login.php — CRITICAL" },
      { c: "ok", t: "[OK]    report.md written · 17 tools orchestrated ✓" }
    ],
    cloud: [
      { c: "cmd", t: "$ ./cspm scan --provider aws --all-regions" },
      { c: "info", t: "[SCAN]  IAM · S3 · EC2 misconfiguration sweep" },
      { c: "warn", t: "[WARN]  s3://prod-logs public-read detected" },
      { c: "info", t: "[HONEY] decoy keys deployed · tripwire armed" },
      { c: "ok", t: "[OK]    CIS posture report ready — MTTD ↓ ✓" }
    ],
    attackid: [
      { c: "cmd", t: "$ uvicorn app:main --ws live-feed" },
      { c: "info", t: "[INGEST] suricata.json + zeek.log normalized" },
      { c: "warn", t: "[SCORE]  risk 92/100 · exploitability HIGH" },
      { c: "info", t: "[BLOCK]  198.51.100.7 → denylist · playbook run" },
      { c: "ok", t: "[OK]     dashboard streaming via WebSocket ✓" }
    ]
  };

  (function initTerminals() {
    const bodies = document.querySelectorAll(".term-body[data-term]");
    if (!bodies.length) return;

    function addLine(body, cls) {
      const div = document.createElement("div");
      div.className = "term-line" + (cls ? " " + cls : "");
      body.appendChild(div);
      return div;
    }

    function renderInstant(body, lines) {
      lines.forEach(l => { addLine(body, l.c).textContent = l.t; });
      addLine(body, "cmd typing").textContent = "$ ";
    }

    function play(body, lines) {
      let li = 0;
      function nextLine() {
        if (li >= lines.length) {
          addLine(body, "cmd typing").textContent = "$ ";
          return;
        }
        const line = lines[li++];
        const el = addLine(body, line.c + " typing");
        if (line.c === "cmd") {
          let p = 0;
          (function typeChar() {
            el.textContent = line.t.slice(0, ++p);
            if (p < line.t.length) {
              setTimeout(typeChar, 26);
            } else {
              el.classList.remove("typing");
              setTimeout(nextLine, 220);
            }
          })();
        } else {
          el.textContent = line.t;
          el.classList.remove("typing");
          setTimeout(nextLine, 170);
        }
      }
      nextLine();
    }

    if (reduceMotion() || !("IntersectionObserver" in window)) {
      bodies.forEach(b => renderInstant(b, termScripts[b.dataset.term] || []));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const body = entry.target;
        if (body.dataset.typed) return;
        body.dataset.typed = "1";
        io.unobserve(body);
        play(body, termScripts[body.dataset.term] || []);
      });
    }, { threshold: 0.35 });
    bodies.forEach(b => io.observe(b));
  })();

  /* ================= Boot intro (once per session) ================= */
  (function initBoot() {
    const boot = document.getElementById("boot");
    if (!boot) return;
    if (!root.classList.contains("booting")) { boot.remove(); return; }

    try { sessionStorage.setItem("skv-boot", "1"); } catch { /* private mode */ }

    const linesEl = boot.querySelector(".boot-lines");
    const barEl = boot.querySelector(".boot-bar span");
    const LINES = [
      "▸ init secure session",
      "▸ verify integrity … ok",
      "▸ load portfolio v2.0",
      "▸ access granted"
    ];
    const DURATION = 1200;
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      boot.classList.add("boot-done");
      setTimeout(() => {
        boot.remove();
        root.classList.remove("booting");
      }, 280);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    }

    LINES.forEach((text, idx) => {
      setTimeout(() => {
        if (finished || !linesEl) return;
        const div = document.createElement("div");
        div.textContent = text;
        linesEl.appendChild(div);
      }, idx * (DURATION / LINES.length));
    });

    if (barEl) {
      barEl.style.transition = `width ${DURATION}ms linear`;
      requestAnimationFrame(() => { barEl.style.width = "100%"; });
    }
    setTimeout(finish, DURATION + 150);

    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
  })();
})();
