(() => {
  "use strict";
  const board = document.querySelector("#artboard");
  const panels = [...document.querySelectorAll(".panel")];
  const state = panels.map((panel, index) => ({ panel, canvas: panel.querySelector("canvas"), image: null, x: 0, y: 0, zoom: 1, seed: index }));
  let dragging = null;

  const $ = selector => document.querySelector(selector);
  const fitBoard = () => {
    const shell = document.querySelector(".stage-shell");
    const ratio = board.classList.contains("ratio-square") ? 1 : board.classList.contains("ratio-wide") ? 1200 / 630 : 4 / 5;
    const width = Math.min(shell.clientWidth - 40, (shell.clientHeight - 40) * ratio);
    board.style.width = `${Math.max(220, width)}px`;
    board.style.height = `${Math.max(220, width) / ratio}px`;
  };

  function sampleScene(ctx, w, h, variant) {
    const palettes = [["#ffaf63", "#d93a79", "#31214f"], ["#20b9c5", "#40336f", "#ef507d"], ["#f59c4c", "#c43869", "#173c59"]];
    const p = palettes[variant];
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, p[0]); sky.addColorStop(.48, p[1]); sky.addColorStop(1, p[2]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffe5bb"; ctx.beginPath(); ctx.arc(w * (.72 - variant * .13), h * .18, w * .1, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .22; for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? "#fff" : "#351d4b"; ctx.fillRect(0, h * (.42 + i * .075), w, h * .038); } ctx.globalAlpha = 1;
    ctx.fillStyle = "#151b30"; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h * .66); ctx.quadraticCurveTo(w * .3, h * .51, w * .52, h * .7); ctx.quadraticCurveTo(w * .75, h * .53, w, h * .62); ctx.lineTo(w, h); ctx.fill();
    const palm = (x, y, s) => { ctx.strokeStyle = "#10162a"; ctx.lineWidth = s * .045; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - s * .12, y - s * .5, x, y - s); ctx.stroke(); for (let a = -1.2; a <= 1.2; a += .3) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x + Math.sin(a) * s * .42, y - s - Math.cos(a) * s * .17, x + Math.sin(a) * s * .6, y - s + Math.cos(a) * s * .08); ctx.stroke(); } };
    palm(w * .15, h * .8, w * .24); palm(w * .88, h * .72, w * .18);
    ctx.fillStyle = variant === 1 ? "#f4d5b3" : "#df526e"; ctx.beginPath(); ctx.ellipse(w * .52, h * .64, w * .13, h * .22, variant ? .25 : -.18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#20152d"; ctx.beginPath(); ctx.arc(w * .52, h * .43, w * .095, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f8c998"; ctx.fillRect(w * .47, h * .49, w * .1, h * .17);
    ctx.fillStyle = "#1d1630"; ctx.beginPath(); ctx.ellipse(w * .52, h * .45, w * .11, h * .13, 0, Math.PI, Math.PI * 2); ctx.fill();
    if (variant === 2) { ctx.fillStyle = "#40d8c1"; ctx.fillRect(w * .13, h * .7, w * .75, h * .07); ctx.fillStyle = "#16182b"; ctx.beginPath(); ctx.arc(w * .25, h * .8, w * .07, 0, 7); ctx.arc(w * .75, h * .8, w * .07, 0, 7); ctx.fill(); }
  }

  function renderPanel(item) {
    const rect = item.panel.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * scale)), h = Math.max(1, Math.round(rect.height * scale));
    if (item.canvas.width !== w || item.canvas.height !== h) { item.canvas.width = w; item.canvas.height = h; }
    const ctx = item.canvas.getContext("2d"); ctx.clearRect(0, 0, w, h); ctx.save(); ctx.translate(w / 2 + item.x * scale, h / 2 + item.y * scale); ctx.scale(item.zoom, item.zoom);
    if (item.image) { const ratio = Math.max(w / item.image.width, h / item.image.height); const iw = item.image.width * ratio, ih = item.image.height * ratio; ctx.drawImage(item.image, -iw / 2, -ih / 2, iw, ih); }
    else { ctx.translate(-w / 2, -h / 2); sampleScene(ctx, w, h, item.seed); }
    ctx.restore();
  }
  const render = () => state.forEach(renderPanel);
  const reset = item => { item.x = 0; item.y = 0; item.zoom = 1; renderPanel(item); };
  function loadFile(file, index) { if (!file || !file.type.startsWith("image/")) return; const img = new Image(); img.onload = () => { state[index].image = img; reset(state[index]); $(`#file${index}`).textContent = file.name; URL.revokeObjectURL(img.src); }; img.src = URL.createObjectURL(file); }

  panels.forEach((panel, index) => {
    panel.addEventListener("pointerdown", event => { panel.focus(); dragging = { index, x: event.clientX, y: event.clientY }; panel.setPointerCapture(event.pointerId); });
    panel.addEventListener("pointermove", event => { if (!dragging || dragging.index !== index) return; state[index].x += event.clientX - dragging.x; state[index].y += event.clientY - dragging.y; dragging.x = event.clientX; dragging.y = event.clientY; renderPanel(state[index]); });
    panel.addEventListener("pointerup", () => dragging = null);
    panel.addEventListener("wheel", event => { event.preventDefault(); state[index].zoom = Math.min(4, Math.max(.7, state[index].zoom * (event.deltaY < 0 ? 1.08 : .92))); renderPanel(state[index]); }, { passive: false });
    panel.addEventListener("keydown", event => { if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return; event.preventDefault(); const step = event.shiftKey ? 10 : 2; state[index].x += event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0; state[index].y += event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0; renderPanel(state[index]); });
    ["dragenter", "dragover"].forEach(type => panel.addEventListener(type, event => { event.preventDefault(); panel.classList.add("dragover"); }));
    ["dragleave", "drop"].forEach(type => panel.addEventListener(type, event => { event.preventDefault(); panel.classList.remove("dragover"); if (type === "drop") loadFile(event.dataTransfer.files[0], index); }));
  });
  document.querySelectorAll("[data-file]").forEach(input => input.addEventListener("change", () => loadFile(input.files[0], Number(input.dataset.file))));
  document.querySelectorAll("[data-layout]").forEach(button => button.addEventListener("click", () => { document.querySelectorAll("[data-layout]").forEach(x => x.classList.toggle("active", x === button)); board.className = `artboard layout-${button.dataset.layout}`; if ($("#bloom").checked) board.classList.add("bloom"); setTimeout(render); }));
  document.querySelectorAll("[data-grade]").forEach(button => button.addEventListener("click", () => { document.querySelectorAll("[data-grade]").forEach(x => x.classList.toggle("active", x === button)); [...board.classList].filter(x => x.startsWith("grade-")).forEach(x => board.classList.remove(x)); if (button.dataset.grade !== "sunset") board.classList.add(`grade-${button.dataset.grade}`); }));
  [["#topLine", "#previewTop"], ["#credits", "#previewCredits"]].forEach(([input, output]) => $(input).addEventListener("input", () => $(output).textContent = $(input).value));
  $("#title").addEventListener("input", () => $("#previewTitle").innerHTML = $("#title").value.trim().split(/\s+/).join("<br>"));
  $("#bloom").addEventListener("change", event => board.classList.toggle("bloom", event.target.checked));
  $("#grain").addEventListener("change", event => board.querySelector(".grain").classList.toggle("off", !event.target.checked));
  $("#resetAll").addEventListener("click", () => state.forEach(reset));
  $("#exportSize").addEventListener("change", event => $("#sizeLabel").textContent = event.target.value.replace("x", " × "));

  async function exportPNG() {
    const [width, height] = $("#exportSize").value.split("x").map(Number); const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#201a29"; ctx.fillRect(0, 0, width, height);
    const boardRect = board.getBoundingClientRect();
    state.forEach(item => { if (getComputedStyle(item.panel).display === "none") return; const r = item.panel.getBoundingClientRect(); const x = (r.left - boardRect.left) / boardRect.width * width, y = (r.top - boardRect.top) / boardRect.height * height, w = r.width / boardRect.width * width, h = r.height / boardRect.height * height; ctx.drawImage(item.canvas, x, y, w, h); });
    const grade = ctx.createLinearGradient(0, 0, width, height); grade.addColorStop(0, "#ff9b5238"); grade.addColorStop(.5, "#00000000"); grade.addColorStop(1, "#ef4b8355"); ctx.fillStyle = grade; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "white"; ctx.font = `800 ${Math.round(width * .018)}px Arial`; ctx.letterSpacing = `${width * .003}px`; ctx.fillText($("#topLine").value.toUpperCase(), width * .07, height * .73);
    ctx.save(); ctx.translate(width * .065, height * .77); ctx.scale(.9, 1); ctx.font = `italic 900 ${Math.round(width * .14)}px Impact, Arial Black`; ctx.lineWidth = width * .009; ctx.strokeStyle = "#ef4b83"; const words = $("#title").value.trim().toUpperCase().split(/\s+/); words.forEach((word, i) => { ctx.strokeText(word, 0, i * width * .105); ctx.fillText(word, 0, i * width * .105); }); ctx.restore();
    ctx.font = `700 ${Math.round(width * .012)}px Arial`; ctx.fillText($("#credits").value.toUpperCase(), width * .07, height * .94);
    canvas.toBlob(blob => { const link = document.createElement("a"); link.download = `viceframe-${width}x${height}.png`; link.href = URL.createObjectURL(blob); link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); const toast = $("#toast"); toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1800); }, "image/png");
  }
  $("#exportButton").addEventListener("click", exportPNG); $("#exportTop").addEventListener("click", exportPNG);
  window.addEventListener("resize", () => { fitBoard(); render(); });
  board.classList.add("bloom");
  const preset = location.hash.slice(1);
  if (preset === "neon-duet") { document.querySelector('[data-layout="two"]').click(); document.querySelector('[data-grade="neon"]').click(); }
  if (preset === "aqua-full") { document.querySelector('[data-layout="full"]').click(); document.querySelector('[data-grade="aqua"]').click(); $("#exportSize").value = "1080x1080"; $("#exportSize").dispatchEvent(new Event("change")); }
  fitBoard(); requestAnimationFrame(render);
})();
