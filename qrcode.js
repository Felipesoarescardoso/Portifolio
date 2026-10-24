(function (global) {
  "use strict";

  var TOTAL = [0, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346];
  var ECC_LEN = {
    L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
    M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
    Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
    H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28]
  };
  var BLOCKS = {
    L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
    M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
    Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
    H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8]
  };
  var FMT_BITS = { L: 1, M: 0, Q: 3, H: 2 };
  var ALIGN = [
    [], [], [6, 18], [6, 22], [6, 26], [6, 30],
    [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]
  ];

  function mulGf(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function geradorRs(grau) {
    var r = [];
    for (var i = 0; i < grau; i++) r.push(0);
    r[grau - 1] = 1;
    var raiz = 1;
    for (var i = 0; i < grau; i++) {
      for (var j = 0; j < grau; j++) {
        r[j] = mulGf(r[j], raiz);
        if (j + 1 < grau) r[j] ^= r[j + 1];
      }
      raiz = mulGf(raiz, 2);
    }
    return r;
  }

  function restoRs(dados, gen) {
    var res = [];
    for (var i = 0; i < gen.length; i++) res.push(0);
    for (var i = 0; i < dados.length; i++) {
      var fator = dados[i] ^ res.shift();
      res.push(0);
      for (var j = 0; j < gen.length; j++) res[j] ^= mulGf(gen[j], fator);
    }
    return res;
  }

  function utf8(texto) {
    var out = [];
    for (var i = 0; i < texto.length; i++) {
      var c = texto.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      } else if (c < 0xd800 || c >= 0xe000) {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      } else {
        i++;
        var cp = 0x10000 + (((c & 0x3ff) << 10) | (texto.charCodeAt(i) & 0x3ff));
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      }
    }
    return out;
  }

  function intercalar(dados, versao, nivel) {
    var numBlocos = BLOCKS[nivel][versao];
    var eccLen = ECC_LEN[nivel][versao];
    var totalCw = TOTAL[versao];
    var shortLen = Math.floor(totalCw / numBlocos);
    var numShort = numBlocos - (totalCw % numBlocos);
    var gen = geradorRs(eccLen);
    var blocos = [];
    var eccs = [];
    var idx = 0;
    for (var i = 0; i < numBlocos; i++) {
      var tam = shortLen - eccLen + (i < numShort ? 0 : 1);
      var bloco = dados.slice(idx, idx + tam);
      idx += tam;
      blocos.push(bloco);
      eccs.push(restoRs(bloco, gen));
    }
    var maior = 0;
    for (var i = 0; i < blocos.length; i++) {
      if (blocos[i].length > maior) maior = blocos[i].length;
    }
    var out = [];
    for (var j = 0; j < maior; j++) {
      for (var i = 0; i < blocos.length; i++) {
        if (j < blocos[i].length) out.push(blocos[i][j]);
      }
    }
    for (var j = 0; j < eccLen; j++) {
      for (var i = 0; i < blocos.length; i++) out.push(eccs[i][j]);
    }
    return out;
  }

  function grade(n) {
    var g = [];
    for (var y = 0; y < n; y++) {
      var linha = [];
      for (var x = 0; x < n; x++) linha.push(false);
      g.push(linha);
    }
    return g;
  }

  function montar(cw, versao, nivel) {
    var size = versao * 4 + 17;
    var m = grade(size);
    var fn = grade(size);

    function set(x, y, escuro) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      m[y][x] = escuro;
      fn[y][x] = true;
    }

    for (var i = 0; i < size; i++) {
      set(6, i, i % 2 === 0);
      set(i, 6, i % 2 === 0);
    }

    var achar = [[3, 3], [size - 4, 3], [3, size - 4]];
    for (var a = 0; a < achar.length; a++) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          set(achar[a][0] + dx, achar[a][1] + dy, dist !== 2 && dist !== 4);
        }
      }
    }

    var al = ALIGN[versao];
    for (var i = 0; i < al.length; i++) {
      for (var j = 0; j < al.length; j++) {
        if (i === 0 && j === 0) continue;
        if (i === 0 && j === al.length - 1) continue;
        if (i === al.length - 1 && j === 0) continue;
        for (var dy = -2; dy <= 2; dy++) {
          for (var dx = -2; dx <= 2; dx++) {
            set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
          }
        }
      }
    }

    function desenharFormato(mascara) {
      var dado = (FMT_BITS[nivel] << 3) | mascara;
      var rem = dado;
      for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = ((dado << 10) | rem) ^ 0x5412;
      function bit(i) {
        return ((bits >>> i) & 1) !== 0;
      }
      for (var i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6));
      set(8, 8, bit(7));
      set(7, 8, bit(8));
      for (var i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (var i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
      for (var i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
      set(8, size - 8, true);
    }

    desenharFormato(0);

    if (versao >= 7) {
      var rem = versao;
      for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var vbits = (versao << 12) | rem;
      for (var i = 0; i < 18; i++) {
        var vbit = ((vbits >>> i) & 1) !== 0;
        var x = size - 11 + (i % 3);
        var y = Math.floor(i / 3);
        set(x, y, vbit);
        set(y, x, vbit);
      }
    }

    var idx = 0;
    for (var dir = size - 1; dir >= 1; dir -= 2) {
      if (dir === 6) dir = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = dir - j;
          var subir = ((dir + 1) & 2) === 0;
          var y = subir ? size - 1 - vert : vert;
          if (!fn[y][x] && idx < cw.length * 8) {
            m[y][x] = ((cw[idx >>> 3] >>> (7 - (idx & 7))) & 1) !== 0;
            idx++;
          }
        }
      }
    }

    function mascaraAplicar(mask) {
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          if (fn[y][x]) continue;
          var inv = false;
          if (mask === 0) inv = (x + y) % 2 === 0;
          else if (mask === 1) inv = y % 2 === 0;
          else if (mask === 2) inv = x % 3 === 0;
          else if (mask === 3) inv = (x + y) % 3 === 0;
          else if (mask === 4) inv = (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
          else if (mask === 5) inv = ((x * y) % 2) + ((x * y) % 3) === 0;
          else if (mask === 6) inv = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
          else inv = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
          if (inv) m[y][x] = !m[y][x];
        }
      }
    }

    function penalidade() {
      var score = 0;
      var padraoA = [true, false, true, true, true, false, true, false, false, false, false];
      var padraoB = [false, false, false, false, true, false, true, true, true, false, true];

      function casar(linha, ini) {
        for (var k = 0; k < 11; k++) {
          if (linha[ini + k] !== padraoA[k]) break;
          if (k === 10) return true;
        }
        for (var k = 0; k < 11; k++) {
          if (linha[ini + k] !== padraoB[k]) break;
          if (k === 10) return true;
        }
        return false;
      }

      for (var t = 0; t < 2; t++) {
        for (var i = 0; i < size; i++) {
          var linha = [];
          for (var j = 0; j < size; j++) {
            linha.push(t === 0 ? m[i][j] : m[j][i]);
          }
          var igual = 1;
          for (var j = 1; j < size; j++) {
            if (linha[j] === linha[j - 1]) {
              igual++;
            } else {
              if (igual >= 5) score += 3 + (igual - 5);
              igual = 1;
            }
          }
          if (igual >= 5) score += 3 + (igual - 5);
          for (var j = 0; j + 11 <= size; j++) {
            if (casar(linha, j)) score += 40;
          }
        }
      }

      for (var y = 0; y < size - 1; y++) {
        for (var x = 0; x < size - 1; x++) {
          var c = m[y][x];
          if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
        }
      }

      var escuros = 0;
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          if (m[y][x]) escuros++;
        }
      }
      var total = size * size;
      var pct = (escuros * 100) / total;
      score += Math.floor(Math.abs(pct - 50) / 5) * 10;

      return score;
    }

    var melhor = 0;
    var melhorScore = Infinity;
    for (var mask = 0; mask < 8; mask++) {
      mascaraAplicar(mask);
      desenharFormato(mask);
      var s = penalidade();
      if (s < melhorScore) {
        melhorScore = s;
        melhor = mask;
      }
      mascaraAplicar(mask);
    }
    mascaraAplicar(melhor);
    desenharFormato(melhor);

    return m;
  }

  function fazer(texto, nivel) {
    var bytes = utf8(texto);
    var versao = 0;
    for (var v = 1; v <= 10; v++) {
      var cap = (TOTAL[v] - ECC_LEN[nivel][v] * BLOCKS[nivel][v]) * 8;
      var cc = v < 10 ? 8 : 16;
      if (4 + cc + bytes.length * 8 <= cap) {
        versao = v;
        break;
      }
    }
    if (!versao) throw new Error("conteudo longo demais");

    var numData = TOTAL[versao] - ECC_LEN[nivel][versao] * BLOCKS[nivel][versao];
    var bits = [];
    function empurrar(valor, qtde) {
      for (var i = qtde - 1; i >= 0; i--) bits.push((valor >>> i) & 1);
    }
    empurrar(4, 4);
    empurrar(bytes.length, versao < 10 ? 8 : 16);
    for (var i = 0; i < bytes.length; i++) empurrar(bytes[i], 8);

    var limite = numData * 8;
    for (var t = 0; t < 4 && bits.length < limite; t++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    var dados = [];
    for (var i = 0; i < bits.length; i += 8) {
      var b = 0;
      for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      dados.push(b);
    }
    for (var pad = 0xec; dados.length < numData; pad ^= 0xec ^ 0x11) dados.push(pad);

    return montar(intercalar(dados, versao, nivel), versao, nivel);
  }

  function escapar(texto) {
    return texto
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function paraSvg(matriz, rotulo) {
    var silencio = 4;
    var dim = matriz.length + silencio * 2;
    var path = "";
    for (var y = 0; y < matriz.length; y++) {
      for (var x = 0; x < matriz.length; x++) {
        if (matriz[y][x]) {
          path += "M" + (x + silencio) + " " + (y + silencio) + "h1v1h-1z";
        }
      }
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + dim + '" height="' + dim +
      '" viewBox="0 0 ' + dim + " " + dim +
      '" shape-rendering="crispEdges" role="img" aria-label="' + escapar(rotulo) + '">' +
      '<rect width="' + dim + '" height="' + dim + '" fill="#ffffff"/>' +
      '<path d="' + path + '" fill="#1e1e22"/></svg>'
    );
  }

  var QR = { fazer: fazer, paraSvg: paraSvg };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = QR;
  }
  global.QR = QR;
})(typeof globalThis !== "undefined" ? globalThis : this);
