window.addEventListener("DOMContentLoaded", () => {
  const boot = document.getElementById("boot");
  const site = document.getElementById("site");
  const bootText = document.getElementById("bootText");
  const bootBarFill = document.getElementById("bootBarFill");
  const bootPct = document.getElementById("bootPct");
  const bootStatus = document.getElementById("bootStatus");

  if (!boot || !site || !bootText || !bootBarFill || !bootPct || !bootStatus) {
    if (boot) boot.classList.add("hidden");
    if (site) site.classList.remove("hidden");
    return;
  }

  const lines = [
    ">> Initializing kernel modules...",
    ">> Loading system drivers...",
    ">> Mounting file systems...",
    ">> Scanning network interfaces...",
    ">> Initializing 3D renderer...",
    ">> Loading security protocols...",
    ">> Establishing secure connection...",
    ">> Compiling portfolio data...",
    ">> System check complete."
  ];

  let i = 0;
  let pct = 0;
  let done = false;

  function finishBoot() {
    boot.classList.add("hidden");
    site.classList.remove("hidden");
    boot.style.pointerEvents = "none";
    boot.style.opacity = "0";
    document.body.style.overflowY = "auto";
  }

  function step() {
    if (done) return;

    if (i < lines.length) {
      bootText.textContent += lines[i] + "\n";
      bootText.scrollTop = bootText.scrollHeight;
      i++;
    }

    pct = Math.min(100, pct + Math.floor(Math.random() * 10) + 6);
    bootBarFill.style.width = pct + "%";
    bootPct.textContent = pct + "%";
    bootStatus.textContent = lines[Math.min(lines.length - 1, i - 1)] || "Initializing...";

    if (pct >= 100) {
      done = true;
      setTimeout(finishBoot, 350);
      return;
    }

    setTimeout(step, 250);
  }

  document.body.style.overflow = "hidden";
  step();

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !done) {
      done = true;
      bootBarFill.style.width = "100%";
      bootPct.textContent = "100%";
      bootStatus.textContent = "System check complete.";
      setTimeout(finishBoot, 250);
    }
  });
});
