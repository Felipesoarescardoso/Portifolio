(function () {
  "use strict";

  var anoEl = document.getElementById("ano");
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

  /* ---------- Menu mobile ---------- */

  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("menu-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var aberto = nav.classList.toggle("aberto");
      toggle.setAttribute("aria-expanded", String(aberto));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("aberto");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Idioma PT/EN ---------- */

  var elementos = document.querySelectorAll("[data-en]");
  elementos.forEach(function (el) {
    el.dataset.pt = el.innerHTML;
  });

  var langBtn = document.getElementById("lang-toggle");

  function idiomaAtual() {
    return document.documentElement.lang.indexOf("en") === 0 ? "en" : "pt";
  }

  function definirIdioma(lang) {
    elementos.forEach(function (el) {
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.pt;
    });
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    if (langBtn) {
      langBtn.textContent = lang === "en" ? "PT" : "EN";
    }
    try {
      localStorage.setItem("idioma", lang);
    } catch (e) { /* sem storage */ }
  }

  if (langBtn) {
    langBtn.addEventListener("click", function () {
      definirIdioma(idiomaAtual() === "pt" ? "en" : "pt");
    });
  }

  try {
    var salvo = localStorage.getItem("idioma");
    if (salvo === "en") {
      definirIdioma("en");
    }
  } catch (e) { /* sem storage */ }

  /* ---------- Copiar e-mail ---------- */

  var btnCopiar = document.getElementById("copiar-email");

  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      var email = "wfelipe.analista@gmail.com";
      var en = idiomaAtual() === "en";
      var feedback = en ? btnCopiar.dataset.copiedEn : btnCopiar.dataset.copiedPt;

      function sucesso() {
        btnCopiar.textContent = feedback;
        setTimeout(function () {
          btnCopiar.textContent = en ? btnCopiar.dataset.en : btnCopiar.dataset.pt;
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

  var secoes = document.querySelectorAll("section[id]");
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

    var observerNav = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle(
              "ativo",
              link.getAttribute("href") === "#" + entrada.target.id
            );
          });
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
})();
