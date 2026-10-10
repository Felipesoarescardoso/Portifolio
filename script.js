(function () {
  "use strict";

  var anoEl = document.getElementById("ano");
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

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
