"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const canvas = $("#art");
const preview = canvas.getContext("2d");

const layouts = {
  triple: { name: "Three panel", note: "Editorial", count: 3 },
  double: { name: "Two panel", note: "Split screen", count: 2 },
  full: { name: "Full bleed", note: "Hero frame", count: 1 }
};

const gradePresets = {
  "Vice sunset": ["#28134f", "#e63c87", "#ff9c55"],
  "Neon night": ["#06143c", "#6f25c9", "#14d9d0"],
  "Hot pink": ["#4d1038", "#ff287d", "#ff805c"],
  "Teal & orange": ["#063b44", "#008f8d", "#ff743b"]
};

const state = {
  layout: "triple", grade: "Vice sunset", width: 1080, height: 1350,
  bloom: 42, grain: 22, active: 0, pointer: null,
  copy: { top: "A COASTLINE CHRONICLE", title: "MIDNIGHT HEAT", credits: "AN AFTERGLOW ORIGINAL · MMXXVI" },
  panels: Array.from({ length: 3 }, (_, sample) => ({ image: null, name: "Studio sample", x: 0, y: 0, zoom: 1, sample }))
};

function rectangles(width, height) {
  const gap = Math.max(7, width * 0.012);
  if (state.layout === "full") return [{ x: 0, y: 0, w: width, h: height }];
  if (state.layout === "double") {
    const split = width * 0.57;
    return [{ x: 0, y: 0, w: split - gap / 2, h: height }, { x: split + gap / 2, y: 0, w: width - split - gap / 2, h: height }];
  }
  const x = width * 0.57;
  const y = height * 0.51;
  return [
    { x: 0, y: 0, w: x - gap / 2, h: height },
    { x: x + gap / 2, y: 0, w: width - x - gap / 2, h: y - gap / 2 },
    { x: x + gap / 2, y: y + gap / 2, w: width - x - gap / 2, h: height - y - gap / 2 }
  ];
}

function seeded(number) {
  const wave = Math.sin(number * 91.731 + 7.13) * 27191.418;
  return wave - Math.floor(wave);
}

function fillGradient(context, width, height, colors) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  colors.forEach((color, index) => gradient.addColorStop(index / (colors.length - 1), color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function stars(context, width, height, seed, count) {
  context.save();
  context.fillStyle = "#fff8df";
  for (let dot = 0; dot < count; dot += 1) {
    context.globalAlpha = 0.18 + seeded(seed + dot) * 0.5;
    context.beginPath();
    context.arc(seeded(seed + dot * 2) * width, seeded(seed + dot * 2 + 1) * height * 0.72, 0.5 + seeded(dot) * 1.2, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawPalm(context, width, height, x, scale, lean) {
  context.save();
  context.translate(width * x, height * 1.04);
  context.rotate(lean);
  context.strokeStyle = "#101120";
  context.lineWidth = width * 0.025 * scale;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(0, 0);
  context.bezierCurveTo(width * .04, -height * .2, -width * .025, -height * .47, width * .035, -height * .68);
  context.stroke();
  context.translate(width * .035, -height * .68);
  context.fillStyle = "#0d0f1e";
  for (let leaf = 0; leaf < 9; leaf += 1) {
    context.save();
    context.rotate(-2.7 + leaf * .67);
    context.beginPath();
    context.moveTo(0, 0);
    context.quadraticCurveTo(width * .16 * scale, -height * .035, width * .29 * scale, height * .025);
    context.quadraticCurveTo(width * .15 * scale, height * .06, 0, 0);
    context.fill();
    context.restore();
  }
  context.restore();
}

function samplePortrait(context, width, height) {
  fillGradient(context, width, height, ["#22144f", "#b92f79", "#ff895e"]);
  stars(context, width, height, 20, 85);
  const halo = context.createRadialGradient(width * .48, height * .34, 0, width * .48, height * .34, width * .42);
  halo.addColorStop(0, "#ffb5d266"); halo.addColorStop(1, "#ffb5d200");
  context.fillStyle = halo; context.fillRect(0, 0, width, height);
  context.fillStyle = "#151321";
  context.beginPath(); context.ellipse(width * .5, height * .35, width * .15, height * .13, -.1, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.moveTo(width * .39, height * .45); context.bezierCurveTo(width * .25, height * .56, width * .19, height * .8, width * .16, height); context.lineTo(width * .86, height); context.bezierCurveTo(width * .8, height * .67, width * .65, height * .5, width * .58, height * .45); context.fill();
  context.strokeStyle = "#ff86bc"; context.lineWidth = width * .012; context.shadowColor = "#ff4eaa"; context.shadowBlur = width * .04;
  context.beginPath(); context.arc(width * .49, height * .37, width * .16, .65 * Math.PI, 1.55 * Math.PI); context.stroke(); context.shadowBlur = 0;
}

function sampleRoad(context, width, height) {
  fillGradient(context, width, height, ["#071846", "#5d2f91", "#ef586f"]);
  stars(context, width, height, 170, 70);
  const sun = context.createRadialGradient(width * .72, height * .27, 2, width * .72, height * .27, width * .24);
  sun.addColorStop(0, "#fff3c9"); sun.addColorStop(.35, "#ffb35c"); sun.addColorStop(1, "#ff7c6900");
  context.fillStyle = sun; context.fillRect(0, 0, width, height * .58);
  context.fillStyle = "#14162a";
  for (let building = 0; building < 11; building += 1) {
    const unit = width / 10;
    const top = height * (.5 + seeded(building + 40) * .2);
    context.fillRect(building * unit, top, unit * .72, height - top);
  }
  context.fillStyle = "#090b15"; context.beginPath(); context.moveTo(0, height); context.lineTo(width * .4, height * .67); context.lineTo(width * .6, height * .67); context.lineTo(width, height); context.fill();
  context.strokeStyle = "#ffd17b"; context.lineWidth = width * .012; context.setLineDash([width * .08, width * .07]); context.beginPath(); context.moveTo(width * .5, height); context.lineTo(width * .5, height * .7); context.stroke(); context.setLineDash([]);
}

function sampleCoast(context, width, height) {
  fillGradient(context, width, height, ["#321b68", "#d83d7b", "#ffad5e"]);
  stars(context, width, height, 340, 55);
  const glow = context.createRadialGradient(width * .72, height * .28, 0, width * .72, height * .28, width * .25);
  glow.addColorStop(0, "#fff6c7"); glow.addColorStop(.45, "#ffbd63"); glow.addColorStop(1, "#ff916200");
  context.fillStyle = glow; context.fillRect(width * .35, 0, width * .65, height * .6);
  drawPalm(context, width, height, .18, 1, -.08); drawPalm(context, width, height, .6, .72, .12);
  context.fillStyle = "#0c1020"; context.beginPath(); context.moveTo(0, height * .84); context.quadraticCurveTo(width * .46, height * .77, width, height * .86); context.lineTo(width, height); context.lineTo(0, height); context.fill();
}

const samples = [samplePortrait, sampleRoad, sampleCoast];

function paintPanel(context, rect, panel) {
  context.save(); context.beginPath(); context.rect(rect.x, rect.y, rect.w, rect.h); context.clip(); context.translate(rect.x, rect.y);
  if (!panel.image) samples[panel.sample](context, rect.w, rect.h);
  else {
    const image = panel.image;
    const scale = Math.max(rect.w / image.naturalWidth, rect.h / image.naturalHeight) * panel.zoom;
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    context.drawImage(image, (rect.w - w) / 2 + panel.x * rect.w, (rect.h - h) / 2 + panel.y * rect.h, w, h);
  }
  context.restore();
}

function spacedText(context, text, x, y, spacing) {
  let cursor = x;
  for (const character of text) { context.fillText(character, cursor, y); cursor += context.measureText(character).width + spacing; }
}

function applyGrade(context, width, height) {
  const colors = gradePresets[state.grade];
  const wash = context.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, colors[0] + "66"); wash.addColorStop(.55, colors[1] + "30"); wash.addColorStop(1, colors[2] + "4d");
  context.save(); context.globalCompositeOperation = "color"; context.fillStyle = wash; context.fillRect(0, 0, width, height); context.restore();
  const bloom = context.createRadialGradient(width * .72, height * .23, 0, width * .72, height * .23, width * .58);
  bloom.addColorStop(0, `rgba(255,170,205,${state.bloom / 330})`); bloom.addColorStop(1, "rgba(255,170,205,0)");
  context.save(); context.globalCompositeOperation = "screen"; context.fillStyle = bloom; context.fillRect(0, 0, width, height); context.restore();
}

function drawCaption(context, width, height) {
  const base = Math.min(width, height); const left = width * .065;
  const shade = context.createLinearGradient(0, height * .5, 0, height); shade.addColorStop(0, "#09071300"); shade.addColorStop(1, "#08060eed"); context.fillStyle = shade; context.fillRect(0, height * .48, width, height * .52);
  context.fillStyle = "#fff"; context.font = `800 ${base * .018}px Arial`; spacedText(context, state.copy.top.toUpperCase(), left, height * .78, base * .008);
  let size = base * .092; context.font = `900 ${size}px Arial`;
  while (context.measureText(state.copy.title.toUpperCase()).width > width * .87 && size > 24) { size -= 2; context.font = `900 ${size}px Arial`; }
  context.shadowColor = "#ff2e8d"; context.shadowBlur = base * .012; context.strokeStyle = "#d91f76"; context.lineWidth = base * .004;
  context.strokeText(state.copy.title.toUpperCase(), left, height * .88); context.fillText(state.copy.title.toUpperCase(), left, height * .88); context.shadowBlur = 0;
  const line = context.createLinearGradient(left, 0, width * .55, 0); line.addColorStop(0, "#ff3d91"); line.addColorStop(1, "#ffb451"); context.fillStyle = line; context.fillRect(left, height * .907, width * .28, Math.max(3, base * .003));
  context.fillStyle = "#ffffff55"; context.fillRect(left, height * .935, width * .87, 1);
  context.fillStyle = "#fff"; context.font = `700 ${base * .011}px Arial`; const credit = state.copy.credits.toUpperCase(); context.fillText(credit, width - left - context.measureText(credit).width, height * .966);
}

function addGrain(context, width, height) {
  const count = Math.round(state.grain * width * height / 2100); context.save(); context.fillStyle = "#fff";
  for (let index = 0; index < count; index += 1) { context.globalAlpha = seeded(index + 900) * .1; context.fillRect(seeded(index * 2 + 1000) * width, seeded(index * 2 + 1001) * height, 1, 1); }
  context.restore();
}

function render(context, width, height) {
  context.clearRect(0, 0, width, height); context.fillStyle = "#171021"; context.fillRect(0, 0, width, height);
  rectangles(width, height).forEach((rect, index) => paintPanel(context, rect, state.panels[index]));
  applyGrade(context, width, height); drawCaption(context, width, height); addGrain(context, width, height);
  context.strokeStyle = "#ffffff99"; context.lineWidth = Math.max(2, width * .002); context.strokeRect(width * .025, height * .02, width * .95, height * .96);
}

function redraw() {
  canvas.width = state.width; canvas.height = state.height;
  const bay = $(".canvas-wrap"); const fit = Math.min((bay.clientWidth - 46) / state.width, (bay.clientHeight - 46) / state.height);
  canvas.style.width = `${Math.round(state.width * fit)}px`; canvas.style.height = `${Math.round(state.height * fit)}px`;
  render(preview, state.width, state.height);
}

function buildLayouts() {
  $("#layouts").innerHTML = Object.entries(layouts).map(([key, item]) => `<button class="layout ${key === state.layout ? "active" : ""}" data-layout="${key}"><span class="mini ${key}">${"<i></i>".repeat(item.count)}</span><b>${item.name}</b><small>${item.note}</small></button>`).join("");
}

function buildGrades() {
  $("#grades").innerHTML = Object.entries(gradePresets).map(([name, colors]) => `<button class="grade ${name === state.grade ? "active" : ""}" data-grade="${name}" style="--swatch:linear-gradient(135deg,${colors.join(",")})">${name}</button>`).join("");
}

function buildPanels() {
  const count = layouts[state.layout].count; $("#panelTotal").textContent = `${count} PANEL${count > 1 ? "S" : ""}`;
  $("#panels").innerHTML = state.panels.slice(0, count).map((panel, index) => `<div class="panel-card ${index === state.active ? "active" : ""}" data-panel="${index}"><span class="thumb"></span><span><b>PANEL 0${index + 1}</b><small>${panel.name}</small></span><button data-reset="${index}" title="Reset panel">↺</button></div>`).join("");
}

function loadFiles(files) {
  [...files].slice(0, 3).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = () => { const image = new Image(); image.onload = () => { Object.assign(state.panels[index], { image, name: file.name, x: 0, y: 0, zoom: 1 }); buildPanels(); redraw(); }; image.src = reader.result; };
    reader.readAsDataURL(file);
  });
}

function exportPNG(download = true) {
  const output = document.createElement("canvas"); output.width = state.width; output.height = state.height; render(output.getContext("2d"), state.width, state.height);
  const data = output.toDataURL("image/png"); $("#exportImage").src = data; $("#exportSize").textContent = `${state.width} × ${state.height}`; $("#lightbox").classList.add("open"); $("#lightbox").setAttribute("aria-hidden", "false");
  if (download) { const link = document.createElement("a"); link.download = `afterglow-${state.width}x${state.height}.png`; link.href = data; link.click(); $("#toast").classList.add("show"); setTimeout(() => $("#toast").classList.remove("show"), 1800); }
}

function canvasPoint(event) { const box = canvas.getBoundingClientRect(); return { x: (event.clientX - box.left) * state.width / box.width, y: (event.clientY - box.top) * state.height / box.height }; }
function panelAt(point) { return rectangles(state.width, state.height).findIndex(rect => point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h); }

function bindCanvas() {
  canvas.addEventListener("pointerdown", event => { const index = panelAt(canvasPoint(event)); if (index < 0) return; state.active = index; state.pointer = { x: event.clientX, y: event.clientY, panX: state.panels[index].x, panY: state.panels[index].y }; canvas.setPointerCapture(event.pointerId); canvas.focus(); buildPanels(); });
  canvas.addEventListener("pointermove", event => { if (!state.pointer) return; const panel = state.panels[state.active]; panel.x = state.pointer.panX + (event.clientX - state.pointer.x) / canvas.clientWidth; panel.y = state.pointer.panY + (event.clientY - state.pointer.y) / canvas.clientHeight; redraw(); });
  canvas.addEventListener("pointerup", () => { state.pointer = null; });
  canvas.addEventListener("wheel", event => { event.preventDefault(); const panel = state.panels[state.active]; panel.zoom = Math.max(1, Math.min(4, panel.zoom * (event.deltaY < 0 ? 1.08 : .92))); redraw(); }, { passive: false });
  canvas.addEventListener("keydown", event => { if (!event.key.startsWith("Arrow")) return; event.preventDefault(); const amount = event.shiftKey ? .03 : .006; const panel = state.panels[state.active]; if (event.key === "ArrowLeft") panel.x -= amount; if (event.key === "ArrowRight") panel.x += amount; if (event.key === "ArrowUp") panel.y -= amount; if (event.key === "ArrowDown") panel.y += amount; redraw(); });
}

function bindUI() {
  document.addEventListener("click", event => {
    const tab = event.target.closest("[data-tab]"); const layout = event.target.closest("[data-layout]"); const grade = event.target.closest("[data-grade]"); const panel = event.target.closest("[data-panel]"); const reset = event.target.closest("[data-reset]");
    if (tab) { $$(".tab").forEach(item => item.classList.toggle("active", item === tab)); $$(".pane").forEach(item => item.classList.toggle("active", item.dataset.pane === tab.dataset.tab)); }
    if (layout) { state.layout = layout.dataset.layout; state.active = Math.min(state.active, layouts[state.layout].count - 1); buildLayouts(); buildPanels(); redraw(); }
    if (grade) { state.grade = grade.dataset.grade; buildGrades(); redraw(); }
    if (panel && !reset) { state.active = Number(panel.dataset.panel); buildPanels(); canvas.focus(); }
    if (reset) { const item = state.panels[Number(reset.dataset.reset)]; Object.assign(item, { image: null, name: "Studio sample", x: 0, y: 0, zoom: 1 }); buildPanels(); redraw(); }
  });
  $("#files").addEventListener("change", event => loadFiles(event.target.files));
  const drop = $("#dropzone"); ["dragenter", "dragover"].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.add("drag"); })); ["dragleave", "drop"].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.remove("drag"); })); drop.addEventListener("drop", event => loadFiles(event.dataTransfer.files));
  [["topline", "top"], ["headline", "title"], ["credits", "credits"]].forEach(([id, key]) => $(`#${id}`).addEventListener("input", event => { state.copy[key] = event.target.value; redraw(); }));
  $("#bloom").addEventListener("input", event => { state.bloom = Number(event.target.value); $("#bloomOut").textContent = event.target.value; redraw(); });
  $$(".size").forEach(button => button.addEventListener("click", () => { state.width = Number(button.dataset.w); state.height = Number(button.dataset.h); $$(".size").forEach(item => item.classList.toggle("active", item === button)); $("#dimensions").textContent = `${state.width} × ${state.height}`; redraw(); }));
  $("#export").addEventListener("click", () => exportPNG(true)); $("#close").addEventListener("click", () => { $("#lightbox").classList.remove("open"); $("#lightbox").setAttribute("aria-hidden", "true"); });
}

function start() {
  buildLayouts(); buildGrades(); buildPanels(); bindUI(); bindCanvas(); window.addEventListener("resize", redraw); redraw();
  const shot = new URLSearchParams(location.search).get("shot");
  if (shot === "grade") $("[data-tab='grade']").click();
  if (shot === "export") exportPNG(false);
  if (shot === "square") $("[data-w='1080'][data-h='1080']").click();
}

start();
