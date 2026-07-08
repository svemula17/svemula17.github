/* =========================================================
   Sai Kumar Vemula — Cinematic scroll journey
   "Open the laptop" → Experience → Tools → Certs → Projects.
   Progressive enhancement: if GSAP is missing or the viewport
   is small / reduced-motion, the section stays as the plain
   stacked layout authored in the HTML (nothing here runs).
   ========================================================= */

(() => {
  const section = document.getElementById("journey");
  if (!section) return;

  // No GSAP (CDN blocked/offline) → leave the stacked fallback as-is.
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // Desktop + motion allowed: run the pinned, scrubbed cinematic.
  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    section.classList.add("is-cinematic");

    const q          = gsap.utils.selector(section);
    const stage      = q(".journey-stage")[0];
    const scenes     = q(".jscene");
    const lid        = q(".laptop-lid")[0];
    const laptop     = q(".laptop")[0];
    const hint       = q(".journey-hint")[0];
    const screenLines= q(".laptop-screen-content > *");
    const revealSel  = ".jscene-head, .jrole-card, .jtool-cluster, .jcert, .jproj-card, .jproj-cta";

    // Per-scene reveal items (scene 0 = laptop, handled separately).
    const items = scenes.map((s) => s.querySelectorAll(revealSel));

    // Initial states
    gsap.set(scenes, { autoAlpha: 0 });
    gsap.set(scenes[0], { autoAlpha: 1 });
    gsap.set(lid, { rotationX: -88, transformOrigin: "50% 100%" });
    gsap.set(screenLines, { autoAlpha: 0, y: 10 });
    items.forEach((group, i) => { if (i > 0) gsap.set(group, { autoAlpha: 0, y: 26 }); });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * 5.6),
        scrub: 1,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // ── Scene 0 — laptop opens, hero powers on, then zoom + hand off
    tl.to(lid, { rotationX: 0, duration: 1.2 }, 0)
      .to(screenLines, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.7 }, 0.55)
      .to(hint, { autoAlpha: 0, duration: 0.3 }, 1.15)
      .to(laptop, { scale: 1.26, duration: 1.0 }, 1.35)
      .to(scenes[0], { autoAlpha: 0, duration: 0.5 }, 2.05);

    // ── Content scenes: [sceneIndex, timeIn, timeOut|null]
    const seq = [
      [1, 2.3, 3.5],   // Experience
      [2, 3.7, 4.9],   // Tools
      [3, 5.1, 6.3],   // Certs
      [4, 6.5, null]   // Projects (finale — stays)
    ];

    seq.forEach(([idx, tin, tout]) => {
      tl.to(scenes[idx], { autoAlpha: 1, duration: 0.5 }, tin)
        .to(items[idx], { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.7 }, tin + 0.1);
      if (tout !== null) tl.to(scenes[idx], { autoAlpha: 0, duration: 0.45 }, tout);
    });

    // Keep layout accurate once lazy images / fonts settle.
    window.addEventListener("load", () => ScrollTrigger.refresh());

    // Cleanup when the media query stops matching (e.g. resize to mobile).
    return () => {
      section.classList.remove("is-cinematic");
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
      gsap.set([scenes, lid, laptop, hint, screenLines, ...items.flatMap(g => [...g])],
               { clearProps: "all" });
    };
  });
})();
