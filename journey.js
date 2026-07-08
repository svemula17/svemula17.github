/* =========================================================
   Sai Kumar Vemula — Laptop OS experience switcher
   The laptop opens straight into a mini macOS desktop: the
   latest role is an app window, the other roles wait in the
   dock (with year labels + a timeline progress strip), and
   scroll swaps windows like switching apps. Progressive
   enhancement: with no GSAP (CDN blocked), on small screens,
   or with reduced motion, the CSS fallback shows the open
   laptop with all three windows stacked.
   ========================================================= */

(() => {
  const section = document.getElementById("journey");
  if (!section) return;

  /* ----- Menu-bar clock (runs in every mode) ----- */
  const clockEl = document.getElementById("osClock");
  if (clockEl) {
    const tick = () => {
      const now = new Date();
      const day  = now.toLocaleDateString("en-US", { weekday: "short" });
      const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      clockEl.textContent = `${day} ${date}  ${time}`;
    };
    tick();
    setInterval(tick, 30000);
  }

  // No GSAP (CDN blocked/offline) → leave the stacked fallback as-is.
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    section.classList.add("is-cinematic");

    const q        = gsap.utils.selector(section);
    const stage    = q(".journey-stage")[0];
    const laptop   = q(".laptop")[0];
    const lid      = q(".laptop-lid")[0];
    const windows  = q(".os-window");
    const dots     = q(".dock-dot");
    const apps     = q(".dock-app");
    const appnames = q(".os-appname");
    const progFill = q(".dock-progress-fill")[0];
    const hint     = q(".journey-hint")[0];

    // Initial states — desktop (wallpaper/menubar/dock) is alive from the start
    gsap.set(lid, { rotationX: -88, transformOrigin: "50% 100%" });
    gsap.set(windows, { autoAlpha: 0, scale: 0.94, y: 26 });
    gsap.set(dots, { autoAlpha: 0 });
    gsap.set(appnames, { autoAlpha: 0 });
    gsap.set(progFill, { scaleX: 0, transformOrigin: "0 50%" });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * 3.8),
        scrub: 1,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // hide the site nav while pinned — full-screen app immersion
        onToggle: (self) =>
          document.querySelector(".nav")?.classList.toggle("nav--journey-hide", self.isActive)
      }
    });

    // ── Boot: lid opens onto the desktop, laptop leans in
    tl.to(lid, { rotationX: 0, duration: 1.2 }, 0)
      .to(laptop, { scale: 1.22, duration: 0.6 }, 0.9)
      .to(hint, { autoAlpha: 0, duration: 0.3 }, 1.0);

    // ── App windows: open latest, then swap like switching apps
    const OPEN  = { autoAlpha: 1, scale: 1, y: 0, duration: 0.5 };
    const CLOSE = { autoAlpha: 0, scale: 0.94, y: 26, duration: 0.45 };
    const times = [1.6, 2.9, 4.4]; // when each app takes focus

    times.forEach((t, i) => {
      if (i > 0) {
        tl.to(windows[i - 1], { ...CLOSE }, t)               // minimize toward dock
          .to([dots[i - 1], appnames[i - 1]], { autoAlpha: 0, duration: 0.3 }, t);
      }
      tl.addLabel("app" + i, t + 0.25)
        .to(windows[i], { ...OPEN }, t + 0.25)               // next app scales up
        .to([dots[i], appnames[i]], { autoAlpha: 1, duration: 0.3 }, t + 0.25);
    });

    // ── Dock timeline strip fills across the whole work history
    tl.to(progFill, { scaleX: 1, duration: 5.3 - 1.6 }, 1.6);

    tl.to({}, { duration: 0.7 });                             // dwell on the last window

    // ── Dock: click an app to jump to its window. The jump is instant;
    // the scrubbed timeline (scrub: 1) supplies the smooth app-switch
    // animation itself, and instant jumps are the only scroll form that
    // behaves reliably inside a pinned range across browsers.
    const st = tl.scrollTrigger;
    const onDockClick = (e) => {
      const i = apps.indexOf(e.currentTarget);
      let time = tl.labels["app" + i];
      if (time == null) return;
      time = Math.min(time + 0.6, tl.duration()); // land after the window has fully opened
      const top = st.start + (time / tl.duration()) * (st.end - st.start);
      window.scrollTo({ top, behavior: "instant" });
      ScrollTrigger.update();
    };
    apps.forEach((a) => a.addEventListener("click", onDockClick));

    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

    // Cleanup when the media query stops matching (e.g. resize to mobile).
    return () => {
      apps.forEach((a) => a.removeEventListener("click", onDockClick));
      section.classList.remove("is-cinematic");
      st && st.kill();
      tl.kill();
      gsap.set([lid, laptop, hint, progFill, ...windows, ...dots, ...appnames],
               { clearProps: "all" });
    };
  });
})();
