(() => {
  "use strict";

  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-button");
  const navLinksContainer = document.querySelector(".nav-links");
  const languageButtons = document.querySelectorAll("[data-language]");
  const translatableElements = document.querySelectorAll("[data-es][data-en]");
  const ariaTranslatableElements = document.querySelectorAll("[data-aria-es][data-aria-en]");
  const imageAltElements = document.querySelectorAll("[data-alt-es][data-alt-en]");
  const typingLine = document.querySelector(".typing-line");
  const glitchElements = document.querySelectorAll(".glitch-text");
  const glitchPanels = document.querySelectorAll(".portrait-terminal");
  const glitchCards = document.querySelectorAll(".stack-card, .project-card, .metric-card, .education-panel, .contact-panel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentLanguage = "es";

  const translations = {
    es: {
      title: "Diego Ibarra — Desarrollador Full Stack",
      description: "Portafolio de Diego Alonso Ibarra Galindo, desarrollador full stack especializado en React, TypeScript, Java, .NET y Python.",
      menuOpen: "Abrir menú",
      menuClose: "Cerrar menú"
    },
    en: {
      title: "Diego Ibarra — Full Stack Developer",
      description: "Portfolio of Diego Alonso Ibarra Galindo, a full stack developer specializing in React, TypeScript, Java, .NET and Python.",
      menuOpen: "Open menu",
      menuClose: "Close menu"
    }
  };

  function getStoredLanguage() {
    try {
      const saved = localStorage.getItem("portfolio-language");
      return saved === "en" || saved === "es" ? saved : "es";
    } catch {
      return "es";
    }
  }

  function storeLanguage(language) {
    try {
      localStorage.setItem("portfolio-language", language);
    } catch {
      // The page still works when storage is restricted.
    }
  }

  function setLanguage(language, persist = true) {
    currentLanguage = language === "en" ? "en" : "es";
    root.lang = currentLanguage;
    document.title = translations[currentLanguage].title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = translations[currentLanguage].description;

    translatableElements.forEach((element) => {
      element.textContent = element.dataset[currentLanguage];
    });

    ariaTranslatableElements.forEach((element) => {
      element.setAttribute("aria-label", element.dataset[`aria${currentLanguage === "es" ? "Es" : "En"}`]);
    });

    imageAltElements.forEach((element) => {
      element.alt = element.dataset[`alt${currentLanguage === "es" ? "Es" : "En"}`];
    });

    glitchElements.forEach((element) => {
      element.dataset.glitch = element.dataset[`glitch${currentLanguage === "es" ? "Es" : "En"}`] || element.textContent;
    });

    languageButtons.forEach((button) => {
      const active = button.dataset.language === currentLanguage;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (typingLine) {
      typingLine.textContent = typingLine.dataset[`type${currentLanguage === "es" ? "Es" : "En"}`] || "whoami --verbose";
    }

    updateMenuLabel();
    if (persist) storeLanguage(currentLanguage);
  }

  function updateMenuLabel() {
    if (!menuButton) return;
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-label", expanded ? translations[currentLanguage].menuClose : translations[currentLanguage].menuOpen);
  }

  function setMenu(open) {
    if (!menuButton || !navLinksContainer) return;
    menuButton.setAttribute("aria-expanded", String(open));
    navLinksContainer.classList.toggle("is-open", open);
    updateMenuLabel();
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  navLinksContainer?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  function typeCommand() {
    if (!typingLine || reduceMotion.matches || sessionStorage.getItem("portfolio-booted")) return;
    const text = typingLine.dataset[`type${currentLanguage === "es" ? "Es" : "En"}`] || "whoami --verbose";
    typingLine.textContent = "";
    document.body.classList.add("booting");
    let index = 0;

    const timer = window.setInterval(() => {
      typingLine.textContent = text.slice(0, index + 1);
      index += 1;
      if (index >= text.length) {
        window.clearInterval(timer);
        document.body.classList.remove("booting");
        try { sessionStorage.setItem("portfolio-booted", "true"); } catch { /* Ignore restricted storage. */ }
      }
    }, 52);
  }

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -45px" });

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const sections = document.querySelectorAll("main section[id]");
  const navigationLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;
      if (!target) return;

      event.preventDefault();
      if (reduceMotion.matches) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        try { history.pushState(null, "", targetId); } catch { /* Local files may restrict history updates. */ }
        return;
      }

      if (document.body.classList.contains("is-teleporting")) return;
      document.body.classList.add("is-teleporting");

      window.setTimeout(() => {
        root.classList.add("teleport-jump");
        target.scrollIntoView({ behavior: "auto", block: "start" });
        try { history.pushState(null, "", targetId); } catch { /* Local files may restrict history updates. */ }
        window.requestAnimationFrame(() => root.classList.remove("teleport-jump"));
      }, 355);

      window.setTimeout(() => document.body.classList.remove("is-teleporting"), 820);
    });
  });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visibleEntry) return;
      navigationLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visibleEntry.target.id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -60%", threshold: [0, 0.2, 0.5] });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  function updateHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const pointerGlow = document.querySelector(".pointer-glow");
  if (pointerGlow && window.matchMedia("(pointer: fine)").matches && !reduceMotion.matches) {
    window.addEventListener("pointermove", (event) => {
      pointerGlow.style.left = `${event.clientX}px`;
      pointerGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  } else if (pointerGlow) {
    pointerGlow.hidden = true;
  }

  if (glitchElements.length && !reduceMotion.matches) {
    const runGlitch = () => {
      glitchElements.forEach((element) => element.classList.add("is-glitching"));
      glitchPanels.forEach((element) => element.classList.add("is-glitching"));
      window.setTimeout(() => {
        glitchElements.forEach((element) => element.classList.remove("is-glitching"));
        glitchPanels.forEach((element) => element.classList.remove("is-glitching"));
      }, 680);
    };
    window.setTimeout(runGlitch, 850);
    window.setInterval(runGlitch, 3800);
  }

  glitchCards.forEach((card) => {
    const effect = document.createElement("span");
    effect.className = "card-glitch";
    effect.setAttribute("aria-hidden", "true");
    effect.innerHTML = "<i></i><i></i><i></i>";
    card.append(effect);
  });

  if (glitchCards.length && !reduceMotion.matches) {
    let previousCard = null;
    const variants = ["glitch-variant-a", "glitch-variant-b", "glitch-variant-c"];

    const triggerCardGlitch = (card) => {
      if (!card || card.classList.contains("is-card-glitching")) return;

      const variant = variants[Math.floor(Math.random() * variants.length)];
      const bars = card.querySelectorAll(".card-glitch i");
      bars.forEach((bar) => {
        bar.style.setProperty("--card-glitch-top", `${10 + Math.random() * 78}%`);
        bar.style.setProperty("--card-glitch-width", `${8 + Math.random() * 25}%`);
        bar.style.setProperty("--card-glitch-height", `${2 + Math.random() * 9}px`);
        bar.style.setProperty("--card-glitch-duration", `${520 + Math.random() * 420}ms`);
        bar.style.setProperty("--card-glitch-direction", Math.random() > .5 ? "normal" : "reverse");
        bar.style.animationDelay = `${Math.random() * 190}ms`;
      });

      card.classList.add("is-card-glitching", variant);
      window.setTimeout(() => card.classList.remove("is-card-glitching", variant), 1150);
    };

    glitchCards.forEach((card) => {
      card.addEventListener("pointerenter", () => triggerCardGlitch(card));
      card.addEventListener("focusin", () => triggerCardGlitch(card));
    });

    const scheduleCardGlitch = () => {
      const delay = 2200 + Math.random() * 4200;
      window.setTimeout(() => {
        const availableCards = Array.from(glitchCards).filter((card) => card !== previousCard);
        const card = availableCards[Math.floor(Math.random() * availableCards.length)] || glitchCards[0];
        previousCard = card;

        if (!document.hidden) {
          triggerCardGlitch(card);
        }

        scheduleCardGlitch();
      }, delay);
    };

    scheduleCardGlitch();
  }

  document.querySelectorAll(".portrait-frame img").forEach((image) => {
    image.addEventListener("error", () => image.classList.add("is-hidden"));
  });

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  setLanguage(getStoredLanguage(), false);
  typeCommand();
})();
