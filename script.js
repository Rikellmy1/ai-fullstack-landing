const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const progressBar = document.querySelector("[data-scroll-progress]");
let lenisInstance = null;

function updateHeaderAndProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (header) {
    header.classList.toggle("is-scrolled", scrollTop > 24);
  }

  if (progressBar) {
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
  }
}

updateHeaderAndProgress();
window.addEventListener("scroll", updateHeaderAndProgress, { passive: true });

function initLenis() {
  if (prefersReducedMotion || !window.Lenis) return;

  lenisInstance = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    anchors: true,
  });

  if (window.gsap && window.ScrollTrigger) {
    lenisInstance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    return;
  }

  const raf = (time) => {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  };

  requestAnimationFrame(raf);
}

function initCosmos() {
  const canvas = document.querySelector("#cosmos-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const particles = [];
  const particleCount = prefersReducedMotion ? 42 : 88;
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const random = (min, max) => Math.random() * (max - min) + min;

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function createParticle() {
    return {
      x: random(0, width),
      y: random(0, height),
      radius: random(0.7, 2.1),
      alpha: random(0.28, 0.9),
      speed: random(0.05, 0.28),
      drift: random(-0.12, 0.12),
      pulse: random(0, Math.PI * 2),
    };
  }

  function seedParticles() {
    particles.length = 0;
    for (let index = 0; index < particleCount; index += 1) {
      particles.push(createParticle());
    }
  }

  function drawParticle(particle) {
    const pulse = prefersReducedMotion ? 0.7 : (Math.sin(particle.pulse) + 1) / 2;
    const alpha = particle.alpha * (0.42 + pulse * 0.58);
    const gradient = context.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.radius * 8
    );

    gradient.addColorStop(0, `rgba(242, 92, 59, ${alpha})`);
    gradient.addColorStop(0.34, `rgba(232, 168, 87, ${alpha * 0.4})`);
    gradient.addColorStop(1, "rgba(242, 92, 59, 0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius * 8, 0, Math.PI * 2);
    context.fill();
  }

  function render() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(10, 10, 11, 0.34)";
    context.fillRect(0, 0, width, height);

    particles.forEach((particle) => {
      drawParticle(particle);

      if (!prefersReducedMotion) {
        particle.y -= particle.speed;
        particle.x += particle.drift;
        particle.pulse += 0.018;

        if (particle.y < -20 || particle.x < -20 || particle.x > width + 20) {
          Object.assign(particle, createParticle(), { y: height + 20 });
        }
      }
    });

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else if (!prefersReducedMotion) {
      render();
    }
  });

  resize();
  seedParticles();
  render();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resize();
    seedParticles();
    render();
  });
}

function initAnimations() {
  if (prefersReducedMotion || !window.gsap) return;

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  gsap.defaults({
    duration: 0.95,
    ease: "power3.out",
  });

  gsap.from(".site-header", {
    y: -22,
    autoAlpha: 0,
    duration: 0.75,
  });

  gsap.from(".hero [data-animate]", {
    y: 26,
    stagger: 0.12,
    delay: 0.12,
    clearProps: "transform",
  });

  gsap.from(".hero-line", {
    scaleY: 0,
    transformOrigin: "center top",
    duration: 1.1,
    delay: 0.2,
  });

  if (!window.ScrollTrigger) return;

  if (window.innerWidth > 760) {
    gsap.to(".hero-grid", {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }

  requestAnimationFrame(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

function initReveals() {
  const elements = Array.from(document.querySelectorAll("[data-animate]"));
  if (!elements.length) return;

  elements.forEach((element, index) => {
    if (element.closest(".hero")) {
      element.classList.add("is-revealed");
      return;
    }

    if (element.matches(".project-item, .delivery-grid article")) {
      element.style.setProperty("--reveal-delay", `${(index % 3) * 80}ms`);
    }
  });

  document.documentElement.classList.add("reveal-ready");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  elements.forEach((element) => {
    if (!element.classList.contains("is-revealed")) {
      observer.observe(element);
    }
  });
}

function initTicker() {
  const track = document.querySelector("[data-marquee]");
  const group = track?.querySelector(".marquee-group");
  if (!track || !group || track.querySelector("[data-marquee-clone]")) return;

  const clone = group.cloneNode(true);
  clone.dataset.marqueeClone = "";
  clone.setAttribute("aria-hidden", "true");
  track.appendChild(clone);
}

function animateCounter(element, target, suffix, duration = 1800) {
  if (prefersReducedMotion) {
    element.textContent = `${target}${suffix}`;
    return;
  }

  const start = performance.now();
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.floor(ease * target)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const startCounter = (counter) => {
    if (counter.dataset.animated === "true") return;

    counter.dataset.animated = "true";
    animateCounter(
      counter,
      Number(counter.dataset.target),
      counter.dataset.suffix || ""
    );
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(startCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        startCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("#main-navigation");
  if (!header || !toggle || !navigation) return;

  const closeMenu = () => {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  };

  toggle.addEventListener("click", () => {
    const willOpen = !header.classList.contains("menu-open");
    header.classList.toggle("menu-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!header.classList.contains("menu-open") || header.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      if (window.location.hash !== targetId) {
        window.history.pushState(null, "", targetId);
      }

      if (lenisInstance) {
        lenisInstance.scrollTo(target, { offset: -72 });
        return;
      }

      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
}

function initContactForm() {
  const contactForm = document.querySelector("[data-mail-form]");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector("[data-submit-button]");
    const status = contactForm.querySelector(".form-status");
    if (!submitButton || submitButton.disabled) return;

    const formData = new FormData(contactForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const projectSelect = contactForm.querySelector("#projeto");
    const project = projectSelect?.selectedOptions[0]?.textContent || formData.get("projeto");
    const message = formData.get("message");
    const subject = encodeURIComponent(`Novo projeto com IA: ${project}`);
    const body = encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\nTipo de projeto: ${project}\n\nMensagem:\n${message}`
    );
    const mailto = `mailto:gustavorikellmy45@gmail.com?subject=${subject}&body=${body}`;

    const showSuccess = (title, description) => {
      contactForm.innerHTML = `
        <div class="form-success" role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>${title}</strong>
            <p>${description}</p>
          </div>
        </div>
      `;
    };

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    contactForm.classList.add("is-submitting");

    if (status) {
      status.textContent = "";
      status.classList.remove("is-error");
    }

    const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (isLocal) {
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      showSuccess(
        "Briefing preparado!",
        "Conclua o envio no seu app de email. Retorno em até 24h."
      );
      window.location.href = mailto;
      return;
    }

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) {
        throw new Error(`Falha no envio: ${response.status}`);
      }

      showSuccess(
        "Mensagem enviada!",
        "Recebi seu briefing e retorno em até 24h."
      );
    } catch (error) {
      contactForm.classList.remove("is-submitting");
      submitButton.disabled = false;
      submitButton.textContent = "Tentar novamente";

      if (status) {
        status.textContent = "Não foi possível enviar agora. Use o botão de email ao lado.";
        status.classList.add("is-error");
      }
    }
  });
}

function initContactPhone() {
  // ┌──────────────────────────────────────────────────────────────────┐
  // │  TROQUE pelo seu número no formato internacional (somente dígitos):│
  // │  55 (Brasil) + DDD (2 dígitos) + número.  Ex.: "5511999998888"     │
  // │  Enquanto estiver "55XXXXXXXXXXX", os botões ficam escondidos.      │
  // └──────────────────────────────────────────────────────────────────┘
  const CONTACT_PHONE = "5511986036017";

  const container = document.querySelector("[data-contact-methods]");
  if (!container) return;

  const digits = CONTACT_PHONE.replace(/\D/g, "");
  const isValid = /^\d{12,13}$/.test(digits); // 55 + DDD + 8 ou 9 dígitos

  if (!isValid) {
    console.warn(
      "[contato] Defina CONTACT_PHONE em script.js (ex.: \"5511999998888\") para ativar WhatsApp e Ligação."
    );
    return; // mantém os botões escondidos até o número ser preenchido
  }

  const message = encodeURIComponent(
    "Oi! Vim pelo seu site e quero criar um projeto com IA."
  );
  const whatsapp = container.querySelector("[data-whatsapp]");
  const call = container.querySelector("[data-call]");

  if (whatsapp) whatsapp.href = `https://wa.me/${digits}?text=${message}`;
  if (call) call.href = `tel:+${digits}`;

  container.hidden = false;
}

// Reveal disparado por IntersectionObserver (confiável com Lenis) que toca uma
// animação GSAP ao entrar em tela. Substitui os triggers `toggleActions:"play"`
// do ScrollTrigger, que neste setup (Lenis + pin) não disparavam o onEnter e
// deixavam seções presas em opacity:0.
function revealOnEnter(elements, makeStates, opts) {
  const els = Array.from(elements);
  if (!els.length || prefersReducedMotion || !window.gsap) return;
  if (!("IntersectionObserver" in window)) return;

  const states = els.map((el, i) => makeStates(el, i));
  els.forEach((el, i) => gsap.set(el, states[i].from)); // estado inicial (sem flash)

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        gsap.to(entry.target, states[els.indexOf(entry.target)].to);
      });
    },
    {
      threshold: opts && opts.threshold != null ? opts.threshold : 0.15,
      rootMargin: opts && opts.rootMargin ? opts.rootMargin : "0px 0px -10% 0px",
    }
  );

  els.forEach((el) => observer.observe(el));
}

function initScrollAnimations() {
  if (prefersReducedMotion || !window.gsap) return;

  // Containers que só precisam aparecer (sem animação própria). Marcá-los como
  // is-revealed evita que o IntersectionObserver de initReveals os processe de novo.
  document
    .querySelectorAll(
      ".section-intro, .projects-heading, .impact-title, .impact-copy, .impact-metrics, .contact-lead, .delivery-grid article, .timeline article, .stack-grid, .editorial-item"
    )
    .forEach((el) => el.classList.add("is-revealed"));

  // Delivery grid — sobe em cascata
  revealOnEnter(document.querySelectorAll(".delivery-grid article"), (el, i) => ({
    from: { opacity: 0, y: 42 },
    to: { opacity: 1, y: 0, duration: 0.8, delay: (i % 2) * 0.08, ease: "power3.out" },
  }));

  // Editorial — direção alternada
  revealOnEnter(document.querySelectorAll(".editorial-item"), (el, i) => ({
    from: { opacity: 0, xPercent: i % 2 === 0 ? -4 : 4 },
    to: { opacity: 1, xPercent: 0, duration: 0.9, ease: "power3.out" },
  }));

  // Timeline — desliza da esquerda em stagger
  revealOnEnter(document.querySelectorAll(".timeline article"), (el, i) => ({
    from: { opacity: 0, x: -40 },
    to: { opacity: 1, x: 0, duration: 0.8, delay: i * 0.08, ease: "power3.out" },
  }));

  // Stack badges — pop-in elástico em stagger
  revealOnEnter(
    document.querySelectorAll(".stack-badge"),
    (el, i) => ({
      from: { opacity: 0, scale: 0.7, y: 12 },
      to: { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: i * 0.04, ease: "back.out(1.6)" },
    }),
    { threshold: 0.1 }
  );
}

/* ─── Cursor magnético (dot + ring) ─────────────── */
function initCursor() {
  const dot = document.querySelector("[data-cursor-dot]");
  const ring = document.querySelector("[data-cursor-ring]");
  if (!dot || !ring || prefersReducedMotion || !window.gsap) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.body.classList.add("cursor-ready");

  const xDot = gsap.quickTo(dot, "x", { duration: 0.16, ease: "power3" });
  const yDot = gsap.quickTo(dot, "y", { duration: 0.16, ease: "power3" });
  const xRing = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3" });
  const yRing = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3" });

  let visible = false;
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      xDot(event.clientX);
      yDot(event.clientY);
      xRing(event.clientX);
      yRing(event.clientY);
    },
    { passive: true }
  );

  window.addEventListener("pointerdown", () => gsap.to(ring, { scale: 0.8, duration: 0.18 }));
  window.addEventListener("pointerup", () => gsap.to(ring, { scale: 1, duration: 0.18 }));

  document
    .querySelectorAll("a, button, [data-magnetic], input, select, textarea, .stack-badge")
    .forEach((el) => {
      el.addEventListener("pointerenter", () => ring.classList.add("is-hovering"));
      el.addEventListener("pointerleave", () => ring.classList.remove("is-hovering"));
    });

  document.addEventListener("mouseleave", () => {
    visible = false;
    gsap.to([dot, ring], { autoAlpha: 0, duration: 0.3 });
  });
}

/* ─── Botões/links magnéticos ───────────────────── */
function initMagnetic() {
  if (prefersReducedMotion || !window.gsap) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = el.classList.contains("button") ? 0.4 : 0.26;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
      yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
    });
    el.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}

/* ─── Split-text reveal (hero + h2) ─────────────── */
function splitWords(el) {
  const tokens = el.textContent.split(/(\s+)/);
  el.textContent = "";
  const frag = document.createDocumentFragment();

  tokens.forEach((token) => {
    if (token === "") return;
    if (/^\s+$/.test(token)) {
      frag.appendChild(document.createTextNode(token));
      return;
    }
    const mask = document.createElement("span");
    mask.className = "word-mask";
    const inner = document.createElement("span");
    inner.className = "word-inner";
    inner.textContent = token;
    mask.appendChild(inner);
    frag.appendChild(mask);
  });

  el.appendChild(frag);
  return el.querySelectorAll(".word-inner");
}

function initSplitReveal() {
  if (!window.gsap) return;

  // Hero title — split por linhas (entrada imediata)
  const heroTitle = document.querySelector(".mega-title[data-split]");
  if (heroTitle) {
    const lines = [];
    heroTitle.querySelectorAll(".t-line").forEach((line) => {
      const inner = document.createElement("span");
      inner.className = "line-inner";
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
      line.classList.add("line-mask");
      lines.push(inner);
    });

    if (!prefersReducedMotion && lines.length) {
      gsap.from(lines, {
        yPercent: 120,
        duration: 1.1,
        delay: 0.18,
        stagger: 0.1,
        ease: "power4.out",
      });
    }
  }

  // h2 das seções — split por palavras revelado no scroll (via IntersectionObserver)
  document.querySelectorAll("main section h2").forEach((h2) => {
    const parent = h2.closest("[data-animate]");
    if (parent) parent.classList.add("is-revealed");

    const words = splitWords(h2);
    if (prefersReducedMotion || !words.length || !("IntersectionObserver" in window)) return;

    gsap.set(words, { yPercent: 115 });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          gsap.to(words, {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.05,
            ease: "power4.out",
          });
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(h2);
  });
}

/* ─── Signal field — rede de pontos (substitui Spline) ─── */
function initSignalField() {
  const canvas = document.querySelector("#signal-field");
  const stage = canvas?.parentElement;
  if (!canvas || !stage) return;

  const ctx = canvas.getContext("2d");
  const reduced = prefersReducedMotion;
  const pointer = { x: -999, y: -999, active: false };
  let width = 0;
  let height = 0;
  let nodes = [];
  let frameId = 0;

  const nodeCount = () => {
    const base = Math.round((width * height) / 11500);
    return Math.max(18, Math.min(reduced ? 28 : 56, base));
  };

  const makeNode = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.6 + 1,
  });

  function seed() {
    nodes = Array.from({ length: nodeCount() }, makeNode);
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    const maxDist = Math.min(Math.min(width, height) * 0.4, 205);

    for (let i = 0; i < nodes.length; i += 1) {
      const n = nodes[i];

      if (!reduced) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));

        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist * 1.3 && d > 0.01) {
            n.x += (dx / d) * 0.3;
            n.y += (dy / d) * 0.3;
          }
        }
      }

      for (let j = i + 1; j < nodes.length; j += 1) {
        const m = nodes[j];
        const dist = Math.hypot(n.x - m.x, n.y - m.y);
        if (dist < maxDist) {
          ctx.strokeStyle = `rgba(242, 92, 59, ${(1 - dist / maxDist) * 0.42})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      let near = false;
      if (pointer.active) {
        const d = Math.hypot(pointer.x - n.x, pointer.y - n.y);
        if (d < maxDist) {
          near = true;
          ctx.strokeStyle = `rgba(232, 168, 87, ${(1 - d / maxDist) * 0.8})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = near ? "rgba(232, 168, 87, 0.95)" : "rgba(236, 232, 225, 0.72)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (pointer.active) {
      ctx.fillStyle = "rgba(242, 92, 59, 0.95)";
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduced) frameId = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(frameId);
    if (reduced) {
      frame();
    } else {
      frameId = requestAnimationFrame(frame);
    }
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.x = -999;
    pointer.y = -999;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else {
      start();
    }
  });

  const refresh = () => {
    cancelAnimationFrame(frameId);
    resize();
    start();
  };

  // Mantém o canvas sincronizado com o tamanho real do stage
  // (fontes carregando, mudança de breakpoint, scrollbar, parallax).
  if ("ResizeObserver" in window) {
    new ResizeObserver(refresh).observe(stage);
  } else {
    window.addEventListener("resize", refresh);
  }

  resize();
  start();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh);
  }
}

/* ─── Projetos — scroll horizontal pinado (desktop) ─── */
// Os projetos agora são uma grade CSS (3 colunas) e usam o reveal padrão de
// [data-animate] do initReveals (mesmo sistema da build-manifest, com stagger
// via --reveal-delay). Sem pin horizontal = nenhum card cortado.

/* ─── Aurora — drift leve do fundo ──────────────── */
function initAurora() {
  if (prefersReducedMotion || !window.gsap) return;
  if (!document.querySelector(".aurora-blob")) return;

  gsap.to(".aurora-blob-1", {
    xPercent: -14,
    yPercent: 18,
    scale: 1.16,
    opacity: 0.72,
    duration: 19,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".aurora-blob-2", {
    xPercent: 16,
    yPercent: -14,
    scale: 1.22,
    opacity: 0.7,
    duration: 24,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

/* ─── Parallax em camadas ───────────────────────── */
function initParallax() {
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;
  if (window.innerWidth <= 760) return;

  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    const speed = parseFloat(el.dataset.speed || "0.1");
    gsap.to(el, {
      yPercent: speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}

initLenis();
initCosmos();
initAurora();
initTicker();
initCounters();
initSignalField();
initSplitReveal();
initScrollAnimations();
initParallax();
initReveals();
initAnimations();
initCursor();
initMagnetic();
initMobileMenu();
initAnchors();
initContactForm();
initContactPhone();

const yearEl = document.getElementById("footer-year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

if (window.gsap && window.ScrollTrigger) {
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

  // As web fonts (Fraunces/Space Grotesk) carregam de forma assíncrona e mudam
  // a altura das seções DEPOIS que o ScrollTrigger já calculou start/end. Sem
  // recalcular, os triggers de reveal (delivery-grid, timeline, stack) e o pin
  // dos projetos ficam desalinhados — daí seções "vazias" e o card cortado.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}
