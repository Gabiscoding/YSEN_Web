const home = document.querySelector(".home");
const lockup = document.querySelector(".lockup");

if (lockup) {
    const live = lockup.querySelector(".letters-live");
    const ghost = live.cloneNode(true);
    ghost.classList.remove("letters-live");
    ghost.classList.add("letters-ghost");
    ghost.removeAttribute("aria-label");
    ghost.setAttribute("aria-hidden", "true");
    live.before(ghost);

    const mixes = [1, 0.84, 0.68, 0.52, 0.36, 0.2];
    const ramps = ["#7193ed", "#bf9ff1", "#f28bad", "#fc692b", "#ffc700", "#82d25d", "#15ad70", "#4a9fd0", "#e14f30"];
    let ramp = ramps[0];
    const meter = document.querySelector(".hue-meter");
    const readout = document.querySelector(".hue-readout");
    const frame = document.querySelector(".type-frame");
    const wordmark = document.querySelector(".wordmark");
    const sizeReadout = document.querySelector("#size-readout");
    const trackReadout = document.querySelector("#track-readout");
    let mode = "rest";
    let hue = 0;
    let hueTarget = 0;
    let hueRunning = false;
    let fontSize = 210;
    let track = 16;

    function pointIn(event, el) {
        const rect = el.getBoundingClientRect();
        const scale = rect.width / el.offsetWidth || 1;
        return {
            x: (event.clientX - rect.left) / scale,
            y: (event.clientY - rect.top) / scale,
            width: el.offsetWidth
        };
    }

    function mixWhite(hex, amount) {
        const value = hex.replace("#", "");
        const channel = (start) => parseInt(value.slice(start, start + 2), 16);
        const mix = (color) => Math.round(color * amount + 255 * (1 - amount));
        return "#" + [mix(channel(0)), mix(channel(2)), mix(channel(4))]
            .map((part) => part.toString(16).padStart(2, "0"))
            .join("");
    }

    function paintHue() {
        const colors = mixes.map((amount) => mixWhite(ramp, amount));
        colors.forEach((color, index) => {
            live.style.setProperty("--c" + index, color);
        });
        live.style.setProperty("--word", live.offsetWidth + "px");
        live.querySelectorAll(".letter").forEach((letter) => {
            letter.style.backgroundPositionX = -letter.offsetLeft + "px";
        });
        if (meter) meter.style.setProperty("--dot", colors[0]);
        if (readout) readout.textContent = "fill: " + ramp + " → 20%";
    }

    function hueTick() {
        if (mode !== "color") {
            hueRunning = false;
            return;
        }
        let delta = hueTarget - hue;
        delta = ((delta + 540) % 360) - 180;
        hue = (hue + delta * 0.08 + 360) % 360;
        const index = Math.round((hue / 360) * (ramps.length - 1));
        ramp = ramps[Math.max(0, Math.min(ramps.length - 1, index))];
        paintHue();
        requestAnimationFrame(hueTick);
    }

    function playWipe() {
        document.body.classList.remove("is-wiping");
        void document.body.offsetWidth;
        document.body.classList.add("is-wiping");
    }

    const glyphs = "*%)]/=#$&@?+<>~^";
    const scrambleColors = ["#7193ed", "#bf9ff1", "#f28bad", "#fc692b", "#82d25d", "#4a9fd0"];

    function randomGlyph() {
        return glyphs[Math.floor(Math.random() * glyphs.length)];
    }

    function scramble(nodes) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
            lockup.classList.remove("is-scrambling");
            return;
        }
        lockup.classList.add("is-scrambling");
        const welcome = document.querySelector(".welcome");
        if (welcome) welcome.classList.add("is-scrambling");
        const started = performance.now();
        const swaps = nodes.map(() => 0);
        const duration = 1.1;
        const step = () => {
            const now = performance.now();
            let pending = false;
            nodes.forEach((node, index) => {
                const local = (now - started) / 1000 - index * 0.08;
                if (local >= duration) {
                    node.el.textContent = node.char;
                    if (node.color) node.el.style.color = "";
                    return;
                }
                pending = true;
                if (local < 0 || now - swaps[index] < 70) return;
                swaps[index] = now;
                node.el.textContent = randomGlyph();
                if (node.color) {
                    node.el.style.color = scrambleColors[Math.floor(Math.random() * scrambleColors.length)];
                }
            });
            if (pending) requestAnimationFrame(step);
            else {
                lockup.classList.remove("is-scrambling");
                if (welcome) welcome.classList.remove("is-scrambling");
            }
        };
        requestAnimationFrame(step);
    }

    const scrambleNodes = [...live.querySelectorAll(".letter")].map((el) => ({
        el,
        char: el.textContent
    }));
    const welcome = document.querySelector(".welcome");
    if (welcome) {
        const text = welcome.textContent;
        welcome.textContent = "";
        [...text].forEach((char) => {
            const el = document.createElement("span");
            el.className = char === " " ? "scramble-space" : "scramble";
            el.textContent = char;
            welcome.appendChild(el);
            if (char !== " ") scrambleNodes.push({ el, char, color: true });
        });
    }
    scramble(scrambleNodes);

    function setMode(next) {
        const changed = next !== mode;
        mode = next;
        lockup.classList.toggle("is-tool", mode === "text" || mode === "opacity" || mode === "color");
        lockup.classList.toggle("is-opacity", mode === "opacity");
        lockup.classList.toggle("is-color", mode === "color");
        lockup.classList.remove("is-active");
        document.body.classList.toggle("is-logo", mode === "logo");
        const story = document.querySelector(".story");
        if (story) story.hidden = mode !== "logo";
        document.querySelectorAll(".tool").forEach((tool) => {
            tool.classList.toggle("is-on", tool.dataset.tool === mode && mode !== "rest");
        });
        if (frame) frame.hidden = mode !== "text";
        if (meter) meter.hidden = mode !== "color";
        if (readout) readout.hidden = mode !== "color";
        if (mode === "text") applyType();
        if (mode === "color") requestAnimationFrame(placeMeter);
        if (mode === "color" && !hueRunning) {
            hueRunning = true;
            paintHue();
            requestAnimationFrame(hueTick);
        }
        if (changed) playWipe();
    }

    document.querySelectorAll(".toolkit .tool").forEach((tool) => {
        tool.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const next = tool.dataset.tool;
            setMode(mode === next ? "rest" : next);
        });
    });

    const brand = document.querySelector(".brand");
    if (brand) {
        brand.addEventListener("click", (event) => {
            event.preventDefault();
            setMode("rest");
        });
    }

    function applyType() {
        lockup.style.setProperty("--font-size", fontSize + "px");
        lockup.style.setProperty("--track", track + "px");
        if (sizeReadout) sizeReadout.textContent = Math.round(fontSize) + "px";
        if (trackReadout) trackReadout.textContent = (track / fontSize).toFixed(2) + "em";
        requestAnimationFrame(placeFrame);
    }

    function inkBox(el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const rect = range.getBoundingClientRect();
        range.detach();
        return rect;
    }

    function placeFrame() {
        if (!frame || frame.hidden) return;
        const word = wordmark.getBoundingClientRect();
        const scale = word.width / wordmark.offsetWidth || 1;
        const glyphs = [...live.querySelectorAll(".letter")].map(inkBox);
        const left = Math.min(...glyphs.map((rect) => rect.left));
        const top = Math.min(...glyphs.map((rect) => rect.top));
        const right = Math.max(...glyphs.map((rect) => rect.right));
        const bottom = Math.max(...glyphs.map((rect) => rect.bottom));
        const xHeight = inkBox(live.querySelector(".letter-s")).top;
        const pad = 14;
        frame.style.left = (left - word.left) / scale - pad + "px";
        frame.style.top = (top - word.top) / scale - pad + "px";
        frame.style.width = (right - left) / scale + pad * 2 + "px";
        frame.style.height = (bottom - top) / scale + pad * 2 + "px";
        frame.style.setProperty("--x", (xHeight - top) / scale + pad + "px");
    }

    function placeMeter() {
        if (!meter || meter.hidden) return;
        const word = wordmark.getBoundingClientRect();
        const scale = word.width / wordmark.offsetWidth || 1;
        const glyphs = [...live.querySelectorAll(".letter")].map(inkBox);
        const left = Math.min(...glyphs.map((rect) => rect.left));
        const right = Math.max(...glyphs.map((rect) => rect.right));
        const top = Math.min(...glyphs.map((rect) => rect.top));
        meter.style.left = (left - word.left) / scale + "px";
        meter.style.width = (right - left) / scale + "px";
        meter.style.top = (top - word.top) / scale - 48 + "px";
    }

    function drag(event, onMove) {
        event.preventDefault();
        event.stopPropagation();
        function move(moveEvent) { onMove(moveEvent); }
        function up() {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        }
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
    }

    if (frame) {
        frame.querySelectorAll("i").forEach((handle) => {
            handle.addEventListener("pointerdown", (event) => {
                const word = wordmark.getBoundingClientRect();
                const originX = word.left + word.width / 2;
                const originY = word.top + word.height / 2;
                const startDist = Math.hypot(event.clientX - originX, event.clientY - originY) || 1;
                const startSize = fontSize;
                drag(event, (moveEvent) => {
                    const dist = Math.hypot(moveEvent.clientX - originX, moveEvent.clientY - originY);
                    fontSize = Math.max(140, Math.min(280, startSize * dist / startDist));
                    applyType();
                });
            });
        });

        frame.addEventListener("pointerdown", (event) => {
            if (event.target.closest("i")) return;
            const startX = event.clientX;
            const startTrack = track;
            const scale = wordmark.getBoundingClientRect().width / wordmark.offsetWidth || 1;
            drag(event, (moveEvent) => {
                track = Math.max(-20, Math.min(90, startTrack + (moveEvent.clientX - startX) / scale));
                applyType();
            });
        });
    }

    function onPointer(event) {
        if (mode === "opacity") {
            const point = pointIn(event, live);
            lockup.style.setProperty("--mx", point.x + "px");
            lockup.style.setProperty("--my", point.y + "px");
            return;
        }
        if (mode === "color") {
            const point = pointIn(event, live);
            hueTarget = (point.x / point.width) * 360;
        }
    }

    lockup.addEventListener("pointerenter", onPointer);
    lockup.addEventListener("pointermove", onPointer);
    lockup.addEventListener("pointerleave", () => {
        lockup.classList.remove("is-active");
        if (mode === "opacity") {
            lockup.style.setProperty("--mx", "-400px");
            lockup.style.setProperty("--my", "-400px");
        }
    });
}

const capsules = [...document.querySelectorAll(".capsule")];

if (capsules.length && home) {
    const STAGE_W = 1440;
    const STAGE_H = 1024;
    const GRAVITY = 0.92;
    const bodies = capsules.map((el) => {
        const body = {
            el,
            x: Number(el.dataset.x) || 0,
            y: Number(el.dataset.y) || 0,
            vx: 0,
            vy: 0,
            va: 0,
            angle: 0,
            w: el.offsetWidth,
            h: el.offsetHeight,
            dragging: false,
            asleep: true,
            moved: false
        };
        place(body);
        return body;
    });

    let running = false;

    function homePoint(event) {
        const rect = home.getBoundingClientRect();
        const scale = rect.width / home.offsetWidth || 1;
        return {
            x: (event.clientX - rect.left) / scale,
            y: (event.clientY - rect.top) / scale
        };
    }

    function bounds(body) {
        const aabbW = Math.abs(body.w * Math.cos(body.angle)) + Math.abs(body.h * Math.sin(body.angle));
        const aabbH = Math.abs(body.w * Math.sin(body.angle)) + Math.abs(body.h * Math.cos(body.angle));
        const padX = (aabbW - body.w) / 2;
        const padY = (aabbH - body.h) / 2;
        return {
            minX: 16 + padX,
            maxX: STAGE_W - body.w - 16 - padX,
            minY: 16 + padY,
            maxY: STAGE_H - body.h - 20 - padY
        };
    }

    function place(body) {
        body.el.style.left = body.x + "px";
        body.el.style.top = body.y + "px";
        body.el.style.transform = "rotate(" + (body.angle * 180 / Math.PI) + "deg)";
    }

    function wrapAngle(delta) {
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        return delta;
    }

    function wake() {
        if (running) return;
        running = true;
        requestAnimationFrame(tick);
    }

    function tick() {
        let awake = false;
        for (const body of bodies) {
            if (body.dragging || body.asleep) continue;
            awake = true;
            body.vy += GRAVITY;
            body.vx *= 0.992;
            body.va *= 0.985;
            body.x += body.vx;
            body.y += body.vy;
            body.angle += body.va;

            const limit = bounds(body);
            if (body.x < limit.minX) {
                body.x = limit.minX;
                body.va += body.vy * 0.004;
                body.vx *= -0.35;
            } else if (body.x > limit.maxX) {
                body.x = limit.maxX;
                body.va -= body.vy * 0.004;
                body.vx *= -0.35;
            }

            if (body.y > limit.maxY) {
                body.y = limit.maxY;
                body.va += body.vx * 0.008;
                body.vy *= -0.32;
                body.vx *= 0.82;
                const flat = Math.round(body.angle / Math.PI) * Math.PI;
                body.va += wrapAngle(flat - body.angle) * 0.08;
                if (Math.abs(body.vy) < 1.4) body.vy = 0;
            } else if (body.y < limit.minY) {
                body.y = limit.minY;
                body.va -= body.vx * 0.004;
                body.vy *= -0.3;
            }

            const onFloor = body.y >= limit.maxY - 0.5;
            if (body.vy === 0 && Math.abs(body.vx) < 0.35 && Math.abs(body.va) < 0.01 && onFloor) {
                body.vx = 0;
                body.va = 0;
                body.angle = Math.round(body.angle / Math.PI) * Math.PI;
                body.asleep = true;
            }
            place(body);
        }
        if (awake) requestAnimationFrame(tick);
        else running = false;
    }

    for (const body of bodies) {
        const el = body.el;
        let grabX = 0;
        let grabY = 0;
        let lastPX = 0;
        let lastPY = 0;
        let lastTime = 0;

        el.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) return;
            const point = homePoint(event);
            body.dragging = true;
            body.asleep = true;
            body.moved = false;
            body.vx = 0;
            body.vy = 0;
            body.va = 0;
            grabX = point.x - body.x;
            grabY = point.y - body.y;
            lastPX = point.x;
            lastPY = point.y;
            lastTime = event.timeStamp;
            el.classList.add("is-dragging");
            el.setPointerCapture(event.pointerId);
        });

        el.addEventListener("pointermove", (event) => {
            if (!body.dragging) return;
            const point = homePoint(event);
            const nextX = point.x - grabX;
            const nextY = point.y - grabY;
            if (Math.hypot(nextX - body.x, nextY - body.y) > 3) body.moved = true;
            const dt = Math.max(event.timeStamp - lastTime, 16);
            const cx = body.x + body.w / 2;
            const cy = body.y + body.h / 2;
            const ox = lastPX - cx;
            const oy = lastPY - cy;
            const pvx = (point.x - lastPX) / dt * 16;
            const pvy = (point.y - lastPY) / dt * 16;
            const reach = ox * ox + oy * oy;
            if (reach > 900) body.va = (ox * pvy - oy * pvx) / reach;
            body.angle += body.va;
            body.vx = (nextX - body.x) / dt * 16;
            body.vy = (nextY - body.y) / dt * 16;
            body.x = nextX;
            body.y = nextY;
            lastPX = point.x;
            lastPY = point.y;
            lastTime = event.timeStamp;
            place(body);
        });

        function release(event) {
            if (!body.dragging) return;
            body.dragging = false;
            el.classList.remove("is-dragging");
            if (body.moved) {
                body.vx = Math.max(-28, Math.min(28, body.vx));
                body.vy = Math.max(-28, Math.min(28, body.vy));
                body.va = Math.max(-0.35, Math.min(0.35, body.va));
                body.asleep = false;
                wake();
            } else if (el.href) {
                window.location.href = el.href;
            }
        }

        el.addEventListener("pointerup", release);
        el.addEventListener("pointercancel", release);
        el.addEventListener("click", (event) => {
            event.preventDefault();
        });
        el.addEventListener("dragstart", (event) => event.preventDefault());
    }
}

const scene = document.querySelector(".scene");
if (scene) {
    const shapes = [
        { kind: "ring", x: 0.04, y: 0.42, size: 13, hue: "#68d0ca", rotate: 0, depth: "back" },
        { kind: "circle", x: 0.46, y: 0.07, size: 4.5, hue: "#f9c3d6", rotate: 0, depth: "back" },
        { kind: "bar", x: 0.58, y: 0.1, size: 16, hue: "#73bde7", rotate: -38, depth: "back" },
        { kind: "squiggle", x: 0.3, y: 0.94, size: 18, hue: "#bf9ff1", rotate: 0, depth: "back" },
        { kind: "circle", x: 0.52, y: 0.9, size: 3.5, hue: "#82d25d", rotate: 0, depth: "back" },
        { kind: "ring", x: 0.96, y: 0.48, size: 10, hue: "#f5d4c0", rotate: 0, depth: "back" },
        { kind: "triangle", x: 0.05, y: 0.58, size: 15.5, hue: "#7193ed", rotate: -18, depth: "mid" },
        { kind: "star", x: 0.96, y: 0.22, size: 11, hue: "#ffc700", rotate: 12, depth: "mid" },
        { kind: "plus", x: 0.97, y: 0.62, size: 8, hue: "#e15e42", rotate: 20, depth: "mid" },
        { kind: "chevron", x: 0.42, y: 0.93, size: 12, hue: "#15ad70", rotate: -8, depth: "mid" },
        { kind: "squiggle", x: 0.7, y: 0.94, size: 16, hue: "#f78d2c", rotate: 8, depth: "mid" }
    ];
    const glyphs = {
        circle: (hue) => `<circle cx="12" cy="12" r="10" fill="${hue}" />`,
        ring: (hue) => `<circle cx="12" cy="12" r="9" fill="none" stroke="${hue}" stroke-width="2" />`,
        triangle: (hue) => `<path d="M12 3 22 21H2Z" fill="${hue}" />`,
        plus: (hue) => `<path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8Z" fill="${hue}" />`,
        chevron: (hue) => `<path d="M4 3 16 12 4 21V3Z" fill="${hue}" />`,
        bar: (hue) => `<rect x="10" y="1" width="4" height="22" rx="2" fill="${hue}" />`,
        star: (hue) => `<path d="M12 1.5 14.6 9H22l-6 4.6L18.3 21 12 16.4 5.7 21 8 13.6 2 9h7.4Z" fill="${hue}" />`,
        squiggle: (hue) => `<path d="M1 15c3-6 6 6 9 0s6 6 9 0" fill="none" stroke="${hue}" stroke-width="2" stroke-linecap="round" />`
    };
    shapes.forEach((shape) => {
        const layer = scene.querySelector(`.layer[data-depth="${shape.depth}"]`);
        if (!layer) return;
        const el = document.createElement("span");
        el.className = "shape";
        el.style.cssText = `left:${shape.x * 100}%;top:${shape.y * 100}%;width:${shape.size}cqw;height:${shape.size}cqw;rotate:${shape.rotate}deg`;
        el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${glyphs[shape.kind](shape.hue)}</svg>`;
        layer.append(el);
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && home) {
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let last = 0;
        let frame = 0;
        const step = (now) => {
            const dt = last ? Math.min(now - last, 48) : 16;
            last = now;
            const ease = 1 - Math.exp(-dt / 180);
            currentX += (targetX - currentX) * ease;
            currentY += (targetY - currentY) * ease;
            const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 1024);
            scene.style.transform = "translate(-50%, -50%) scale(" + scale + ") rotateX(" + currentX.toFixed(3) + "deg) rotateY(" + currentY.toFixed(3) + "deg)";
            if (Math.abs(targetX - currentX) > 0.04 || Math.abs(targetY - currentY) > 0.04) {
                frame = requestAnimationFrame(step);
            } else {
                frame = 0;
                last = 0;
            }
        };
        const parallax = document.querySelector(".parallax");
        const aim = (event) => {
            if (document.body.classList.contains("is-logo")) return;
            const box = parallax.getBoundingClientRect();
            const nx = (event.clientX - box.left) / box.width - 0.5;
            const ny = (event.clientY - box.top) / box.height - 0.5;
            targetY = nx * 26;
            targetX = -ny * 20;
            if (!frame) frame = requestAnimationFrame(step);
        };
        window.addEventListener("pointermove", aim);
        document.addEventListener("pointerleave", () => {
            targetX = 0;
            targetY = 0;
            if (!frame) frame = requestAnimationFrame(step);
        });
    }
}

const comments = document.querySelector(".story-comments");
if (comments) {
    let stack = 2;
    comments.querySelectorAll(".ig").forEach((card) => {
        let drag = null;
        card.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) return;
            const box = comments.getBoundingClientRect();
            const rect = card.getBoundingClientRect();
            drag = {
                dx: event.clientX - rect.left,
                dy: event.clientY - rect.top,
                box
            };
            card.classList.add("is-dragging");
            card.style.position = "absolute";
            card.style.zIndex = String(++stack);
            card.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
        card.addEventListener("pointermove", (event) => {
            if (!drag) return;
            const box = comments.getBoundingClientRect();
            card.style.left = (event.clientX - box.left - drag.dx) + "px";
            card.style.top = (event.clientY - box.top - drag.dy) + "px";
        });
        const release = () => {
            drag = null;
            card.classList.remove("is-dragging");
        };
        card.addEventListener("pointerup", release);
        card.addEventListener("pointercancel", release);
    });
}
