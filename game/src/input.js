// Shadow Lantern — keyboard + mouse input.
export function createInput(canvas) {
  const keys = new Set();
  const input = {
    keys,
    moveX: 0,
    moveY: 0,
    running: false,
    click: null, // {x, y} in canvas coords, consumed by the game loop
    anyKey: false,
    pausedToggle: false,
    muteToggle: false,
    restartToggle: false,
    startToggle: false,
  };

  function updateMove() {
    let x = 0;
    let y = 0;
    if (keys.has("a") || keys.has("arrowleft")) x -= 1;
    if (keys.has("d") || keys.has("arrowright")) x += 1;
    if (keys.has("w") || keys.has("arrowup")) y -= 1;
    if (keys.has("s") || keys.has("arrowdown")) y += 1;
    const len = Math.hypot(x, y) || 1;
    input.moveX = x / len;
    input.moveY = y / len;
    input.running = keys.has("shift");
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) {
      e.preventDefault();
    }
    if (k === "p" || k === "escape") input.pausedToggle = true;
    if (k === "m") input.muteToggle = true;
    if (k === "r") input.restartToggle = true;
    if (k === "enter" || k === " ") input.startToggle = true;
    keys.add(k);
    input.anyKey = true;
    updateMove();
  });
  window.addEventListener("keyup", (e) => {
    keys.delete(e.key.toLowerCase());
    updateMove();
  });
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    input.click = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
    input.startToggle = true;
  });
  return input;
}
