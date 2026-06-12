const canvas = document.querySelector("#paintCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const wrap = document.querySelector("#canvasWrap");
const textInput = document.querySelector("#textInput");

const state = {
  tool: "brush",
  drawing: false,
  start: null,
  last: null,
  snapshot: null,
  zoom: 1,
  history: [],
  redo: [],
  primary: "#1f2937",
  background: "#ffffff",
  size: 8,
  opacity: 1,
  fillShape: false,
};

const toolNames = {
  brush: "Кисть",
  eraser: "Ластик",
  bucket: "Заливка",
  picker: "Пипетка",
  line: "Линия",
  curve: "Кривая",
  rect: "Прямоугольник",
  roundRect: "Скругленный прямоугольник",
  ellipse: "Эллипс",
  triangle: "Треугольник",
  rightTriangle: "Прямоугольный треугольник",
  diamond: "Ромб",
  pentagon: "Пятиугольник",
  hexagon: "Шестиугольник",
  arrowRight: "Стрелка вправо",
  arrowLeft: "Стрелка влево",
  arrowUp: "Стрелка вверх",
  arrowDown: "Стрелка вниз",
  star4: "Четырехконечная звезда",
  star5: "Пятиконечная звезда",
  starburst: "Вспышка",
  speech: "Выноска",
  thought: "Облако",
  heart: "Сердце",
  text: "Текст",
};

const shapeDefinitions = [
  { tool: "line", label: "Линия", svg: '<path d="M5 19 19 5" />' },
  { tool: "curve", label: "Кривая", svg: '<path d="M4 15c5-10 9 8 16-2" />' },
  { tool: "ellipse", label: "Эллипс", svg: '<ellipse cx="12" cy="12" rx="7" ry="7" />' },
  { tool: "rect", label: "Прямоугольник", svg: '<rect x="5" y="7" width="14" height="10" rx="1" />' },
  { tool: "roundRect", label: "Скругленный прямоугольник", svg: '<rect x="5" y="7" width="14" height="10" rx="3" />' },
  { tool: "rightTriangle", label: "Прямоугольный треугольник", svg: '<path d="M6 5v14h13Z" />' },
  { tool: "triangle", label: "Треугольник", svg: '<path d="M12 5 20 19H4Z" />' },
  { tool: "diamond", label: "Ромб", svg: '<path d="M12 4 20 12 12 20 4 12Z" />' },
  { tool: "pentagon", label: "Пятиугольник", svg: '<path d="M12 4 20 10 17 20H7L4 10Z" />' },
  { tool: "hexagon", label: "Шестиугольник", svg: '<path d="M8 5h8l4 7-4 7H8l-4-7Z" />' },
  { tool: "arrowRight", label: "Стрелка вправо", svg: '<path d="M4 10h9V6l7 6-7 6v-4H4Z" />' },
  { tool: "arrowLeft", label: "Стрелка влево", svg: '<path d="M20 10h-9V6l-7 6 7 6v-4h9Z" />' },
  { tool: "arrowUp", label: "Стрелка вверх", svg: '<path d="M10 20v-9H6l6-7 6 7h-4v9Z" />' },
  { tool: "arrowDown", label: "Стрелка вниз", svg: '<path d="M10 4v9H6l6 7 6-7h-4V4Z" />' },
  { tool: "star4", label: "Четырехконечная звезда", svg: '<path d="M12 3 14.8 9.2 21 12l-6.2 2.8L12 21l-2.8-6.2L3 12l6.2-2.8Z" />' },
  { tool: "star5", label: "Пятиконечная звезда", svg: '<path d="m12 3 2.5 5.4 5.9.7-4.4 4 1.2 5.8-5.2-3-5.2 3 1.2-5.8-4.4-4 5.9-.7Z" />' },
  { tool: "starburst", label: "Вспышка", svg: '<path d="m12 3 2 5 5-2-2 5 4 3-5 1 1 5-5-3-5 3 1-5-5-1 4-3-2-5 5 2Z" />' },
  { tool: "speech", label: "Выноска", svg: '<path d="M5 6h14v9H11l-5 4v-4H5Z" />' },
  { tool: "thought", label: "Облако", svg: '<path d="M7.4 16.2c-2.3 0-3.9-1.5-3.9-3.4 0-1.7 1.2-3.1 3-3.4C7 6.7 9.2 5.2 12 5.2c2.4 0 4.4 1.2 5.2 3.2 2 .2 3.3 1.7 3.3 3.6 0 2.2-1.7 4.2-4.2 4.2Z" /><circle cx="7" cy="19" r="1.2" />' },
  { tool: "heart", label: "Сердце", svg: '<path d="M12 20S4 15.3 4 9.5A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8 2.5C20 15.3 12 20 12 20Z" />' },
];

const palette = [
  "#111827",
  "#ffffff",
  "#b91c1c",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#475569",
  "#94a3b8",
  "#fde68a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecdd3",
];

const ui = {
  toolGrid: document.querySelector("#toolGrid"),
  shapeGrid: document.querySelector("#shapeGrid"),
  brushSize: document.querySelector("#brushSize"),
  opacity: document.querySelector("#opacity"),
  primaryColor: document.querySelector("#primaryColor"),
  backgroundColor: document.querySelector("#backgroundColor"),
  sizeOutput: document.querySelector("#sizeOutput"),
  opacityOutput: document.querySelector("#opacityOutput"),
  fillShape: document.querySelector("#fillShape"),
  swatches: document.querySelector("#swatches"),
  statusLine: document.querySelector("#statusLine"),
  zoomLabel: document.querySelector("#zoomLabel"),
  canvasWidth: document.querySelector("#canvasWidth"),
  canvasHeight: document.querySelector("#canvasHeight"),
};

function init() {
  document.documentElement.style.setProperty("--canvas-width", `${canvas.width}px`);
  document.documentElement.style.setProperty("--canvas-height", `${canvas.height}px`);
  fillBackground();
  pushHistory();
  buildSwatches();
  buildShapes();
  bindEvents();
  updateUi();
  fitCanvas();
}

function bindEvents() {
  document.querySelector(".tool-panel").addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (!button) return;
    setTool(button.dataset.tool);
  });

  ui.brushSize.addEventListener("input", () => {
    state.size = Number(ui.brushSize.value);
    updateUi();
  });

  ui.opacity.addEventListener("input", () => {
    state.opacity = Number(ui.opacity.value) / 100;
    updateUi();
  });

  ui.primaryColor.addEventListener("input", () => {
    state.primary = ui.primaryColor.value;
    updateUi();
  });

  ui.backgroundColor.addEventListener("input", () => {
    state.background = ui.backgroundColor.value;
  });

  ui.fillShape.addEventListener("change", () => {
    state.fillShape = ui.fillShape.checked;
  });

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  document.querySelector("#undo").addEventListener("click", undo);
  document.querySelector("#redo").addEventListener("click", redo);
  document.querySelector("#clearCanvas").addEventListener("click", clearCanvas);
  document.querySelector("#resizeCanvas").addEventListener("click", resizeCanvas);
  document.querySelector("#downloadPng").addEventListener("click", downloadPng);
  document.querySelector("#imageLoader").addEventListener("change", loadImage);
  document.querySelector("#zoomIn").addEventListener("click", () => setZoom(state.zoom + 0.1));
  document.querySelector("#zoomOut").addEventListener("click", () => setZoom(state.zoom - 0.1));
  document.querySelector("#fitCanvas").addEventListener("click", fitCanvas);

  textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") commitText();
    if (event.key === "Escape") hideTextInput();
  });
  textInput.addEventListener("blur", commitText);

  window.addEventListener("keydown", (event) => {
    const modifier = event.ctrlKey || event.metaKey;
    if (!modifier) return;
    const key = event.key.toLowerCase();
    const code = event.code;
    if (key === "z" || key === "я" || code === "KeyZ") {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
    }
    if (key === "y" || key === "н" || code === "KeyY") {
      event.preventDefault();
      redo();
    }
    if (key === "s" || key === "ы" || code === "KeyS") {
      event.preventDefault();
      downloadPng();
    }
  });
}

function buildSwatches() {
  ui.swatches.innerHTML = "";
  palette.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.setProperty("--swatch", color);
    button.title = color;
    button.setAttribute("aria-label", `Цвет ${color}`);
    button.addEventListener("click", () => {
      state.primary = color;
      ui.primaryColor.value = color;
      updateUi();
    });
    ui.swatches.append(button);
  });
}

function buildShapes() {
  ui.shapeGrid.innerHTML = "";
  shapeDefinitions.forEach((shape) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "shape-button";
    button.dataset.tool = shape.tool;
    button.title = shape.label;
    button.setAttribute("aria-label", shape.label);
    button.innerHTML = `<span class="shape-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${shape.svg}</svg></span>`;
    ui.shapeGrid.append(button);
  });
}

function setTool(tool) {
  state.tool = tool;
  hideTextInput();
  updateUi();
}

function updateUi() {
  ui.brushSize.value = state.size;
  ui.opacity.value = Math.round(state.opacity * 100);
  ui.primaryColor.value = state.primary;
  ui.backgroundColor.value = state.background;
  ui.sizeOutput.value = state.size;
  ui.opacityOutput.value = `${Math.round(state.opacity * 100)}%`;
  ui.fillShape.checked = state.fillShape;
  ui.statusLine.textContent = `${toolNames[state.tool]} · ${canvas.width} × ${canvas.height}`;
  ui.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;

  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === state.tool);
  });

  document.querySelectorAll(".swatch").forEach((button) => {
    button.classList.toggle("is-selected", button.title.toLowerCase() === state.primary.toLowerCase());
  });

  canvas.style.cursor = state.tool === "text" ? "text" : "crosshair";
}

function fillBackground() {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = state.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  const point = getPoint(event);
  state.start = point;
  state.last = point;
  state.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (state.tool === "picker") {
    pickColor(point);
    return;
  }

  if (state.tool === "bucket") {
    floodFill(point, hexToRgba(state.primary, state.opacity));
    pushHistory();
    return;
  }

  if (state.tool === "text") {
    showTextInput(point);
    return;
  }

  state.drawing = true;
  canvas.setPointerCapture(event.pointerId);

  if (state.tool === "brush" || state.tool === "eraser") {
    drawFreehand(point, point);
  }
}

function onPointerMove(event) {
  if (!state.drawing) return;
  const point = getPoint(event);

  if (state.tool === "brush" || state.tool === "eraser") {
    drawFreehand(state.last, point);
    state.last = point;
    return;
  }

  ctx.putImageData(state.snapshot, 0, 0);
  drawShape(state.start, point);
}

function onPointerUp() {
  if (!state.drawing) return;
  state.drawing = false;
  state.snapshot = null;
  pushHistory();
}

function getPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(((event.clientX - rect.left) / rect.width) * canvas.width),
    y: Math.round(((event.clientY - rect.top) / rect.height) * canvas.height),
  };
}

function configureStroke() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = state.size;
  ctx.globalAlpha = state.opacity;
  ctx.strokeStyle = state.tool === "eraser" ? state.background : state.primary;
  ctx.fillStyle = state.primary;
  ctx.globalCompositeOperation = "source-over";
}

function drawFreehand(from, to) {
  ctx.save();
  configureStroke();
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawShape(from, to) {
  ctx.save();
  configureStroke();
  const x = Math.min(from.x, to.x);
  const y = Math.min(from.y, to.y);
  const width = Math.abs(to.x - from.x);
  const height = Math.abs(to.y - from.y);
  const x2 = x + width;
  const y2 = y + height;
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.beginPath();
  if (state.tool === "line") {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  } else if (state.tool === "curve") {
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(cx, y - height * 0.35, to.x, to.y);
  } else if (state.tool === "rect") {
    ctx.rect(x, y, width, height);
  } else if (state.tool === "roundRect") {
    roundedRectPath(ctx, x, y, width, height, Math.min(width, height) * 0.18);
  } else if (state.tool === "ellipse") {
    ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else if (state.tool === "triangle") {
    polygonPath([
      [cx, y],
      [x2, y2],
      [x, y2],
    ]);
  } else if (state.tool === "rightTriangle") {
    polygonPath([
      [x, y],
      [x, y2],
      [x2, y2],
    ]);
  } else if (state.tool === "diamond") {
    polygonPath([
      [cx, y],
      [x2, cy],
      [cx, y2],
      [x, cy],
    ]);
  } else if (state.tool === "pentagon") {
    regularPolygonPath(cx, cy, width / 2, height / 2, 5, -Math.PI / 2);
  } else if (state.tool === "hexagon") {
    regularPolygonPath(cx, cy, width / 2, height / 2, 6, Math.PI / 6);
  } else if (state.tool === "arrowRight") {
    arrowPath(x, y, width, height, "right");
  } else if (state.tool === "arrowLeft") {
    arrowPath(x, y, width, height, "left");
  } else if (state.tool === "arrowUp") {
    arrowPath(x, y, width, height, "up");
  } else if (state.tool === "arrowDown") {
    arrowPath(x, y, width, height, "down");
  } else if (state.tool === "star4") {
    starPath(cx, cy, width / 2, height / 2, 4, 0.34, -Math.PI / 2);
  } else if (state.tool === "star5") {
    starPath(cx, cy, width / 2, height / 2, 5, 0.45, -Math.PI / 2);
  } else if (state.tool === "starburst") {
    starPath(cx, cy, width / 2, height / 2, 10, 0.62, -Math.PI / 2);
  } else if (state.tool === "speech") {
    speechPath(x, y, width, height);
  } else if (state.tool === "thought") {
    thoughtPath(x, y, width, height);
  } else if (state.tool === "heart") {
    heartPath(x, y, width, height);
  }

  if (state.fillShape && state.tool !== "line" && state.tool !== "curve") {
    ctx.globalAlpha = state.opacity;
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

function polygonPath(points) {
  points.forEach(([px, py], index) => {
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

function regularPolygonPath(cx, cy, rx, ry, sides, rotation = 0) {
  const points = [];
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + (Math.PI * 2 * index) / sides;
    points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]);
  }
  polygonPath(points);
}

function starPath(cx, cy, rx, ry, points, innerScale, rotation = 0) {
  const vertices = [];
  for (let index = 0; index < points * 2; index += 1) {
    const radiusScale = index % 2 === 0 ? 1 : innerScale;
    const angle = rotation + (Math.PI * index) / points;
    vertices.push([cx + Math.cos(angle) * rx * radiusScale, cy + Math.sin(angle) * ry * radiusScale]);
  }
  polygonPath(vertices);
}

function roundedRectPath(context, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function arrowPath(x, y, width, height, direction) {
  const x2 = x + width;
  const y2 = y + height;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const shaft = 0.28;

  if (direction === "right") {
    polygonPath([[x, cy - height * shaft], [cx, cy - height * shaft], [cx, y], [x2, cy], [cx, y2], [cx, cy + height * shaft], [x, cy + height * shaft]]);
  } else if (direction === "left") {
    polygonPath([[x2, cy - height * shaft], [cx, cy - height * shaft], [cx, y], [x, cy], [cx, y2], [cx, cy + height * shaft], [x2, cy + height * shaft]]);
  } else if (direction === "up") {
    polygonPath([[cx - width * shaft, y2], [cx - width * shaft, cy], [x, cy], [cx, y], [x2, cy], [cx + width * shaft, cy], [cx + width * shaft, y2]]);
  } else {
    polygonPath([[cx - width * shaft, y], [cx - width * shaft, cy], [x, cy], [cx, y2], [x2, cy], [cx + width * shaft, cy], [cx + width * shaft, y]]);
  }
}

function speechPath(x, y, width, height) {
  const tail = Math.min(width, height) * 0.22;
  roundedRectPath(ctx, x, y, width, height * 0.76, Math.min(width, height) * 0.12);
  ctx.moveTo(x + width * 0.34, y + height * 0.76);
  ctx.lineTo(x + width * 0.2, y + height);
  ctx.lineTo(x + width * 0.54, y + height * 0.76);
  ctx.lineTo(x + width * 0.34 + tail, y + height * 0.76);
}

function thoughtPath(x, y, width, height) {
  ctx.moveTo(x + width * 0.28, y + height * 0.72);
  ctx.bezierCurveTo(x + width * 0.1, y + height * 0.72, x + width * 0.04, y + height * 0.56, x + width * 0.12, y + height * 0.43);
  ctx.bezierCurveTo(x + width * 0.16, y + height * 0.33, x + width * 0.25, y + height * 0.28, x + width * 0.36, y + height * 0.28);
  ctx.bezierCurveTo(x + width * 0.42, y + height * 0.12, x + width * 0.62, y + height * 0.1, x + width * 0.74, y + height * 0.25);
  ctx.bezierCurveTo(x + width * 0.9, y + height * 0.26, x + width * 0.98, y + height * 0.39, x + width * 0.96, y + height * 0.54);
  ctx.bezierCurveTo(x + width * 0.94, y + height * 0.67, x + width * 0.83, y + height * 0.72, x + width * 0.7, y + height * 0.72);
  ctx.lineTo(x + width * 0.28, y + height * 0.72);
  ctx.closePath();
  ctx.moveTo(x + width * 0.28, y + height * 0.88);
  ctx.ellipse(x + width * 0.28, y + height * 0.88, width * 0.07, height * 0.05, 0, 0, Math.PI * 2);
}

function heartPath(x, y, width, height) {
  const top = y + height * 0.25;
  ctx.moveTo(x + width / 2, y + height);
  ctx.bezierCurveTo(x - width * 0.1, y + height * 0.58, x + width * 0.04, top, x + width * 0.28, top);
  ctx.bezierCurveTo(x + width * 0.42, top, x + width * 0.5, y + height * 0.38, x + width / 2, y + height * 0.45);
  ctx.bezierCurveTo(x + width * 0.5, y + height * 0.38, x + width * 0.58, top, x + width * 0.72, top);
  ctx.bezierCurveTo(x + width * 0.96, top, x + width * 1.1, y + height * 0.58, x + width / 2, y + height);
  ctx.closePath();
}

function floodFill(point, replacement) {
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const startX = clamp(point.x, 0, canvas.width - 1);
  const startY = clamp(point.y, 0, canvas.height - 1);
  const target = getPixel(data, startX, startY);

  if (colorsClose(target, replacement, 0)) return;

  const stack = [[startX, startY]];
  const visited = new Uint8Array(canvas.width * canvas.height);
  const tolerance = 18;

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
    const offset = y * canvas.width + x;
    if (visited[offset]) continue;
    visited[offset] = 1;
    if (!colorsClose(getPixel(data, x, y), target, tolerance)) continue;

    setPixel(data, x, y, replacement);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  ctx.putImageData(image, 0, 0);
}

function getPixel(data, x, y) {
  const index = (y * canvas.width + x) * 4;
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function setPixel(data, x, y, color) {
  const index = (y * canvas.width + x) * 4;
  data[index] = color[0];
  data[index + 1] = color[1];
  data[index + 2] = color[2];
  data[index + 3] = color[3];
}

function colorsClose(a, b, tolerance) {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance &&
    Math.abs(a[3] - b[3]) <= tolerance
  );
}

function pickColor(point) {
  const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
  state.primary = rgbToHex(pixel[0], pixel[1], pixel[2]);
  ui.primaryColor.value = state.primary;
  updateUi();
}

function showTextInput(point) {
  hideTextInput(false);
  const rect = canvas.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();
  textInput.dataset.x = point.x;
  textInput.dataset.y = point.y;
  textInput.value = "";
  textInput.style.display = "block";
  textInput.style.left = `${rect.left - wrapRect.left + point.x * state.zoom}px`;
  textInput.style.top = `${rect.top - wrapRect.top + point.y * state.zoom}px`;
  textInput.style.fontSize = `${Math.max(14, state.size * state.zoom * 2)}px`;
  textInput.focus();
}

function commitText() {
  if (textInput.style.display !== "block" || !textInput.value.trim()) {
    hideTextInput(false);
    return;
  }

  ctx.save();
  ctx.globalAlpha = state.opacity;
  ctx.fillStyle = state.primary;
  ctx.font = `${Math.max(14, state.size * 2)}px "Segoe UI", Arial, sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(textInput.value.trim(), Number(textInput.dataset.x), Number(textInput.dataset.y));
  ctx.restore();
  hideTextInput(false);
  pushHistory();
}

function hideTextInput(commit = true) {
  if (commit) commitText();
  textInput.style.display = "none";
}

function pushHistory() {
  state.history.push(canvas.toDataURL("image/png"));
  if (state.history.length > 40) state.history.shift();
  state.redo = [];
}

function restoreFromDataUrl(url) {
  const image = new Image();
  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  };
  image.src = url;
}

function undo() {
  if (state.history.length <= 1) return;
  state.redo.push(state.history.pop());
  restoreFromDataUrl(state.history[state.history.length - 1]);
}

function redo() {
  if (!state.redo.length) return;
  const item = state.redo.pop();
  state.history.push(item);
  restoreFromDataUrl(item);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fillBackground();
  pushHistory();
}

function resizeCanvas() {
  const nextWidth = clamp(Number(ui.canvasWidth.value) || canvas.width, 240, 3000);
  const nextHeight = clamp(Number(ui.canvasHeight.value) || canvas.height, 180, 2200);
  const previous = document.createElement("canvas");
  previous.width = canvas.width;
  previous.height = canvas.height;
  previous.getContext("2d").drawImage(canvas, 0, 0);

  canvas.width = nextWidth;
  canvas.height = nextHeight;
  document.documentElement.style.setProperty("--canvas-width", `${canvas.width}px`);
  document.documentElement.style.setProperty("--canvas-height", `${canvas.height}px`);
  fillBackground();
  ctx.drawImage(previous, 0, 0);
  pushHistory();
  updateUi();
  fitCanvas();
}

function loadImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      pushHistory();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function downloadPng() {
  const link = document.createElement("a");
  link.download = `paint-studio-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function setZoom(value) {
  state.zoom = clamp(Number(value.toFixed(2)), 0.2, 2.5);
  document.documentElement.style.setProperty("--zoom", state.zoom);
  updateUi();
}

function fitCanvas() {
  const availableWidth = Math.max(280, wrap.clientWidth - 58);
  const availableHeight = Math.max(220, wrap.clientHeight - 58);
  const fit = Math.min(availableWidth / canvas.width, availableHeight / canvas.height, 1);
  setZoom(fit);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgba(hex, opacity = 1) {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
    Math.round(opacity * 255),
  ];
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

init();
