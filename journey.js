/* =========================================================
   Sai Kumar Vemula — Laptop OS experience switcher
   The laptop opens into a mini OS: the latest role appears as
   an app window, the other roles wait in the dock, and scroll
   swaps between them like switching apps. Progressive
   enhancement: with no GSAP (CDN blocked), on small screens,
   or with reduced motion, the CSS fallback simply shows the
   open laptop with all three windows stacked inside.
   ========================================================= */

(() => {
  const section = document.getElementById("journey");
  if (!section) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    section.classList.add("is-cinematic");

    const q       = gsap.utils.selector(section);
    const stage   = q(".journey-stage")[0];
    const laptop  = q(".laptop")[0];
    const lid     = q(".laptop-lid")[0];
    const splash  = q(".laptop-screen-content")[0];
    const os      = q(".os")[0];
    const windows = q(".os-window");
    const dots    = q(".dock-dot");
    const apps    = q(".dock-app");
    const hint    = q(".journey-hint")[0];

    // Initial states
    gsap.set(lid, { rotationX: -88, transformOrigin: "50% 100%" });
    gsap.set(os, { autoAlpha: 0 });
    gsap.set(windows, { yPercent: -50, autoAlpha: 0, scale: 0.92, y: 34 });
    gsap.set(dots, { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * 3.8),
        scrub: 1,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // ── Boot: lid opens over the splash, laptop leans in
    tl.to(lid, { rotationX: 0, duration: 1.2 }, 0)
      .to(laptop, { scale: 1.3, duration: 0.6 }, 0.9)
      .to(hint, { autoAlpha: 0, duration: 0.3 }, 1.0)
      // ── Log in: splash gives way to the OS
      .to(splash, { autoAlpha: 0, duration: 0.3 }, 1.3)
      .to(os, { autoAlpha: 1, duration: 0.3 }, 1.5);

    // ── App windows: open latest, then swap like switching apps
    const OPEN  = { autoAlpha: 1, scale: 1, y: 0, duration: 0.5 };
    const CLOSE = { autoAlpha: 0, scale: 0.92, y: 34, duration: 0.45 };
    const times = [1.7, 2.9, 4.4]; // when each app takes focus

    times.forEach((t, i) => {
      if (i > 0) {
        tl.to(windows[i - 1], { ...CLOSE }, t)          // minimize toward dock
          .to(dots[i - 1], { autoAlpha: 0, duration: 0.3 }, t);
      }
      tl.addLabel("app" + i, t + 0.25)
        .to(windows[i], { ...OPEN }, t + 0.25)          // next app scales up
        .to(dots[i], { autoAlpha: 1, duration: 0.3 }, t + 0.25);
    });

    tl.to({}, { duration: 0.7 });                        // dwell on the last window

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
      gsap.set([lid, laptop, splash, os, hint, ...windows, ...dots], { clearProps: "all" });
    };
  });
})();
