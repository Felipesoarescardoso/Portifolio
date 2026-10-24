(function () {
  "use strict";

  var anoEl = document.getElementById("ano");
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

  /* ---------- Menu mobile ---------- */

  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("menu-nav");

  function atualizarLabelMenu() {
    if (!toggle || !nav) return;
    var aberto = nav.classList.contains("aberto");
    var lang = idiomaAtual();
    var labels = {
      pt: aberto ? "Fechar menu" : "Abrir menu",
      en: aberto ? "Close menu" : "Open menu",
      es: aberto ? "Cerrar menú" : "Abrir menú"
    };
    toggle.setAttribute("aria-label", labels[lang] || labels.pt);
  }

  function abrirMenu() {
    if (!nav || !toggle) return;
    nav.classList.add("aberto");
    toggle.setAttribute("aria-expanded", "true");
    atualizarLabelMenu();
  }

  function fecharMenu() {
    if (!nav || !toggle) return;
    if (!nav.classList.contains("aberto")) return;
    nav.classList.remove("aberto");
    toggle.setAttribute("aria-expanded", "false");
    atualizarLabelMenu();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      if (nav.classList.contains("aberto")) {
        fecharMenu();
      } else {
        abrirMenu();
      }
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        fecharMenu();
      }
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("aberto")) return;
      if (e.target === toggle || toggle.contains(e.target)) return;
      if (nav.contains(e.target)) return;
      fecharMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("aberto")) {
        fecharMenu();
        toggle.focus();
      }
    });

    var mqMobile = window.matchMedia("(max-width: 640px)");
    function aoMudarViewport(mq) {
      if (!mq.matches) fecharMenu();
    }
    if (mqMobile.addEventListener) {
      mqMobile.addEventListener("change", aoMudarViewport);
    } else if (mqMobile.addListener) {
      mqMobile.addListener(aoMudarViewport);
    }

    atualizarLabelMenu();
  }

  /* ---------- Idioma PT/EN/ES ---------- */

  var IDIOMA_PROXIMO = { pt: "en", en: "es", es: "pt" };
  var LANG_TAG = { pt: "pt-BR", en: "en", es: "es" };
  var LANG_ARIA = { pt: "Mudar idioma", en: "Change language", es: "Cambiar idioma" };

  var elementos = document.querySelectorAll("[data-en]");
  elementos.forEach(function (el) {
    el.dataset.pt = el.innerHTML;
  });

  var elemsAria = document.querySelectorAll("[data-en-aria]");
  elemsAria.forEach(function (el) {
    el.dataset.ptAria = el.getAttribute("aria-label") || "";
  });

  var elemsAlt = document.querySelectorAll("[data-en-alt]");
  elemsAlt.forEach(function (el) {
    el.dataset.ptAlt = el.getAttribute("alt") || "";
  });

  var langBtn = document.getElementById("lang-toggle");

  function idiomaAtual() {
    var l = document.documentElement.lang;
    if (l.indexOf("en") === 0) return "en";
    if (l.indexOf("es") === 0) return "es";
    return "pt";
  }

  function definirIdioma(lang) {
    elementos.forEach(function (el) {
      var v = lang === "en" ? el.dataset.en : lang === "es" ? el.dataset.es : el.dataset.pt;
      if (v != null) el.innerHTML = v;
    });
    elemsAria.forEach(function (el) {
      var v = lang === "en" ? el.dataset.enAria : lang === "es" ? el.dataset.esAria : el.dataset.ptAria;
      if (v != null) el.setAttribute("aria-label", v);
    });
    elemsAlt.forEach(function (el) {
      var v = lang === "en" ? el.dataset.enAlt : lang === "es" ? el.dataset.esAlt : el.dataset.ptAlt;
      if (v != null) el.setAttribute("alt", v);
    });
    document.documentElement.lang = LANG_TAG[lang] || "pt-BR";
    if (langBtn) {
      langBtn.textContent = (IDIOMA_PROXIMO[lang] || "en").toUpperCase();
      langBtn.setAttribute("aria-label", LANG_ARIA[lang] || LANG_ARIA.pt);
    }
    atualizarLabelMenu();
    try {
      localStorage.setItem("idioma", lang);
    } catch (e) { /* sem storage */ }
  }

  if (langBtn) {
    langBtn.addEventListener("click", function () {
      definirIdioma(IDIOMA_PROXIMO[idiomaAtual()] || "en");
    });
  }

  try {
    var salvo = localStorage.getItem("idioma");
    if (salvo && LANG_TAG[salvo]) {
      definirIdioma(salvo);
    } else if (!salvo && navigator.language) {
      var navLang = navigator.language.toLowerCase();
      if (navLang.indexOf("en") === 0) {
        definirIdioma("en");
      } else if (navLang.indexOf("es") === 0) {
        definirIdioma("es");
      }
    }
  } catch (e) { /* sem storage */ }

  /* ---------- Copiar e-mail ---------- */

  var btnCopiar = document.getElementById("copiar-email");

  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      var email = "wfelipe.analista@gmail.com";
      var lang = idiomaAtual();
      var feedback = lang === "en" ? btnCopiar.dataset.copiedEn
        : lang === "es" ? btnCopiar.dataset.copiedEs
          : btnCopiar.dataset.copiedPt;

      function sucesso() {
        btnCopiar.textContent = feedback;
        setTimeout(function () {
          var v = lang === "en" ? btnCopiar.dataset.en
            : lang === "es" ? btnCopiar.dataset.es
              : btnCopiar.dataset.pt;
          btnCopiar.textContent = v;
        }, 2000);
      }

      function fallback() {
        var tmp = document.createElement("textarea");
        tmp.value = email;
        tmp.style.position = "fixed";
        tmp.style.opacity = "0";
        document.body.appendChild(tmp);
        tmp.select();
        try {
          document.execCommand("copy");
          sucesso();
        } catch (e) { /* falhou */ }
        document.body.removeChild(tmp);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(sucesso, fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------- Stats animados ---------- */

  var numeros = document.querySelectorAll(".numero[data-alvo]");
  var reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animar(el) {
    var alvo = parseInt(el.dataset.alvo, 10) || 0;
    var sufixo = el.dataset.sufixo || "";
    if (reduzido) {
      el.textContent = alvo + sufixo;
      return;
    }
    var duracao = 900;
    var inicio = null;
    function passo(ts) {
      if (!inicio) inicio = ts;
      var p = Math.min((ts - inicio) / duracao, 1);
      var suave = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(alvo * suave) + sufixo;
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  if (numeros.length) {
    if ("IntersectionObserver" in window) {
      var obsStats = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            animar(entrada.target);
            obsStats.unobserve(entrada.target);
          }
        });
      }, { threshold: 0.6 });
      numeros.forEach(function (n) {
        obsStats.observe(n);
      });
    } else {
      numeros.forEach(animar);
    }
  }

  /* ---------- Scroll reveal e nav ativa ---------- */

  var secoes = document.querySelectorAll("section[id], header[id]");
  var links = document.querySelectorAll("nav a");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });

    function marcarAtivo(id) {
      links.forEach(function (link) {
        var ativo = id !== "" && link.getAttribute("href") === "#" + id;
        link.classList.toggle("ativo", ativo);
        if (ativo) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    var observerNav = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          marcarAtivo(entrada.target.id === "topo" ? "" : entrada.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    secoes.forEach(function (secao) {
      observerNav.observe(secao);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("visivel");
    });
  }

  /* ---------- QR Code (cartão de visita) ---------- */
  /* Implementação em qrcode.js (carregada antes deste script) */

  var overlayQr = document.getElementById("qr-overlay");
  var btnQrAbrir = document.getElementById("qr-abrir");
  var btnQrFechar = document.getElementById("qr-fechar");
  var btnQrBaixar = document.getElementById("qr-baixar");
  var caixaQr = document.getElementById("qr-codigo");
  var textoQr = document.getElementById("qr-url");
  var svgQr = "";

  function urlPortifolio() {
    if (location.protocol === "https:") {
      return location.href.split("#")[0];
    }
    return "https://felipesoarescardoso.github.io/Portifolio/";
  }

  function gerarQr() {
    var url = urlPortifolio();
    textoQr.textContent = url;
    try {
      var matriz = QR.fazer(url, "M");
      svgQr = QR.paraSvg(matriz, "QR Code do portfólio: " + url);
      caixaQr.innerHTML = svgQr;
      btnQrBaixar.disabled = false;
    } catch (e) {
      svgQr = "";
      caixaQr.innerHTML = "";
      btnQrBaixar.disabled = true;
    }
  }

  function abrirQr() {
    if (!overlayQr) return;
    gerarQr();
    overlayQr.hidden = false;
    document.body.style.overflow = "hidden";
    btnQrFechar.focus();
  }

  function fecharQr() {
    if (!overlayQr || overlayQr.hidden) return;
    overlayQr.hidden = true;
    document.body.style.overflow = "";
    btnQrAbrir.focus();
  }

  if (overlayQr && btnQrAbrir) {
    btnQrAbrir.addEventListener("click", abrirQr);
    btnQrFechar.addEventListener("click", fecharQr);
    overlayQr.addEventListener("click", function (e) {
      if (e.target === overlayQr) fecharQr();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fecharQr();
    });
    overlayQr.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var botoes = overlayQr.querySelectorAll("button");
      if (!botoes.length) return;
      var primeiro = botoes[0];
      var ultimo = botoes[botoes.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    });
    btnQrBaixar.addEventListener("click", function () {
      if (!svgQr) return;
      var conteudo = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgQr;
      var blob = new Blob([conteudo], { type: "image/svg+xml;charset=utf-8" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "qr-code-portifolio.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function () {
        URL.revokeObjectURL(link.href);
      }, 1000);
    });
  }

  /* ---------- Lightbox reutilizável (galeria + projetos em fotos) ---------- */

  function criarLightbox(cfg) {
    var overlay = document.getElementById(cfg.overlay);
    var imgLb = document.getElementById(cfg.img);
    var legendaLb = document.getElementById(cfg.legenda);
    var contadorLb = document.getElementById(cfg.contador);
    var btnFechar = document.getElementById(cfg.fechar);
    var btnAnterior = document.getElementById(cfg.anterior);
    var btnProximo = document.getElementById(cfg.proximo);
    var itens = document.querySelectorAll(cfg.itens);
    var indice = 0;
    var focoAnterior = null;

    if (!overlay || !itens.length) return null;

    function mostrar(i) {
      indice = (i + itens.length) % itens.length;
      var item = itens[indice];
      var img = item.querySelector("img");
      var leg = item.querySelector(cfg.itemLegenda);
      imgLb.src = img.getAttribute("src");
      imgLb.alt = img.getAttribute("alt") || "";
      legendaLb.textContent = leg ? leg.textContent : "";
      contadorLb.textContent = (indice + 1) + " / " + itens.length;
    }

    function abrir(i) {
      focoAnterior = document.activeElement;
      mostrar(i);
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      if (btnFechar) btnFechar.focus();
    }

    function fechar() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      document.body.style.overflow = "";
      if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
    }

    itens.forEach(function (item) {
      item.addEventListener("click", function () {
        abrir(parseInt(item.dataset.index, 10) || 0);
      });
    });

    btnFechar.addEventListener("click", fechar);
    btnAnterior.addEventListener("click", function () {
      mostrar(indice - 1);
    });
    btnProximo.addEventListener("click", function () {
      mostrar(indice + 1);
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) fechar();
    });

    document.addEventListener("keydown", function (e) {
      if (overlay.hidden) return;
      if (e.key === "Escape") {
        fechar();
      } else if (e.key === "ArrowLeft") {
        mostrar(indice - 1);
      } else if (e.key === "ArrowRight") {
        mostrar(indice + 1);
      }
    });

    overlay.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var botoes = overlay.querySelectorAll("button");
      if (!botoes.length) return;
      var primeiro = botoes[0];
      var ultimo = botoes[botoes.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    });

    return { abrir: abrir, fechar: fechar };
  }

  criarLightbox({
    overlay: "lightbox-overlay",
    img: "lightbox-img",
    legenda: "lightbox-legenda",
    contador: "lightbox-contador",
    fechar: "lightbox-fechar",
    anterior: "lightbox-anterior",
    proximo: "lightbox-proximo",
    itens: ".galeria-item",
    itemLegenda: ".galeria-legenda"
  });

  /* ---------- Filtro de projetos por empresa ---------- */

  var btnsFiltro = document.querySelectorAll(".filtro");
  var cardsEmp = document.querySelectorAll(".projeto-emp");
  var vazioFiltro = document.getElementById("vazio-filtro");

  if (btnsFiltro.length && cardsEmp.length) {
    btnsFiltro.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filtro = btn.dataset.filtro;
        btnsFiltro.forEach(function (b) {
          var ativo = b === btn;
          b.classList.toggle("ativo", ativo);
          b.setAttribute("aria-pressed", ativo ? "true" : "false");
        });
        var visiveis = 0;
        cardsEmp.forEach(function (card) {
          var mostrar = filtro === "todos" || card.dataset.empresa === filtro;
          card.hidden = !mostrar;
          if (mostrar) visiveis++;
        });
        if (vazioFiltro) vazioFiltro.hidden = visiveis > 0;
      });
    });
  }
})();
