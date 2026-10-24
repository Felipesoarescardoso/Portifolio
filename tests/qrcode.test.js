"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const QR = require("../qrcode.js");
const QRCode = require("qrcode");

const CASOS = [
  { texto: "https://felipesoarescardoso.github.io/Portifolio/", nivel: "M" },
  { texto: "https://felipesoarescardoso.github.io/Portifolio/", nivel: "L" },
  { texto: "https://e-commerce-one-green.vercel.app", nivel: "M" },
  { texto: "https://id-telegram.vercel.app", nivel: "Q" },
  { texto: "https://wa.me/5585997375179", nivel: "M" },
  { texto: "mailto:wfelipe.analista@gmail.com", nivel: "H" },
  { texto: "A", nivel: "M" },
  { texto: "Hello, World!", nivel: "M" },
  { texto: "Portfólio com acentuação — ç ã é", nivel: "M" },
  { texto: "https://github.com/Felipesoarescardoso/admitidosrm-dashboard", nivel: "M" },
  { texto: "x".repeat(80), nivel: "L" },
  { texto: "y".repeat(150), nivel: "M" }
];

function matrizNossa(texto, nivel) {
  const m = QR.fazer(texto, nivel);
  return m.map((linha) => linha.map((c) => (c ? 1 : 0)));
}

function matrizReferencia(texto, nivel) {
  const qr = QRCode.create([{ data: texto, mode: "byte" }], {
    errorCorrectionLevel: nivel
  });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const m = [];
  for (let y = 0; y < size; y++) {
    const linha = [];
    for (let x = 0; x < size; x++) {
      linha.push(data[y * size + x] ? 1 : 0);
    }
    m.push(linha);
  }
  return m;
}

function formatarMatriz(m) {
  return m.map((linha) => linha.map((c) => (c ? "██" : "  ")).join("")).join("\n");
}

for (const { texto, nivel } of CASOS) {
  test(`bate com a lib de referência: "${texto.slice(0, 40)}" [${nivel}]`, () => {
    const nossa = matrizNossa(texto, nivel);
    const ref = matrizReferencia(texto, nivel);

    assert.equal(nossa.length, ref.length, "tamanho da matriz diverge");

    let divergencias = 0;
    for (let y = 0; y < ref.length; y++) {
      for (let x = 0; x < ref.length; x++) {
        if (nossa[y][x] !== ref[y][x]) divergencias++;
      }
    }

    if (divergencias > 0) {
      console.log("\n--- nossa ---\n" + formatarMatriz(nossa));
      console.log("\n--- referência ---\n" + formatarMatriz(ref));
    }

    assert.equal(divergencias, 0, `${divergencias} módulos divergentes`);
  });
}

test("paraSvg gera SVG válido com path e aria-label escapado", () => {
  const m = QR.fazer("teste", "M");
  const svg = QR.paraSvg(m, 'QR "com" <tags> & ampersand');
  assert.ok(svg.startsWith("<svg "));
  assert.ok(svg.includes('aria-label="QR &quot;com&quot; &lt;tags> &amp; ampersand"'));
  assert.ok(svg.includes('fill="#1e1e22"'));
  assert.ok(svg.includes('fill="#ffffff"'));
  assert.equal((svg.match(/h1v1h-1z/g) || []).length, m.flat().filter(Boolean).length);
});

test("conteúdo longo demais lança erro", () => {
  assert.throws(() => QR.fazer("z".repeat(300), "H"), /longo demais/);
});

test("silêncio de 4 módulos nas bordas do SVG", () => {
  const m = QR.fazer("abc", "M");
  const svg = QR.paraSvg(m, "abc");
  const dim = m.length + 8;
  assert.ok(svg.includes(`viewBox="0 0 ${dim} ${dim}"`));
  assert.ok(svg.includes(`width="${dim}"`));
});
