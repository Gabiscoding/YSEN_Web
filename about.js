const field = document.querySelector(".about-field");
if (field && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const kinds = ["circle", "ring", "triangle", "plus", "chevron", "bar", "star", "squiggle"];
    const hues = ["#7193ed", "#bf9ff1", "#f28bad", "#fc692b", "#ffc700", "#82d25d", "#15ad70", "#4a9fd0", "#e14f30", "#68d0ca"];
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
    const trail = [];
    let last = null;

    field.addEventListener("pointermove", (event) => {
        if (event.target.closest(".about-window")) return;
        const box = field.getBoundingClientRect();
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        if (last && Math.hypot(x - last.x, y - last.y) < 26) return;
        last = { x, y };
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        const hue = hues[Math.floor(Math.random() * hues.length)];
        const size = 16 + Math.random() * 22;
        const shape = document.createElement("span");
        shape.className = "about-shape";
        shape.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;rotate:${(Math.random() * 50 - 25).toFixed(1)}deg`;
        shape.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${glyphs[kind](hue)}</svg>`;
        field.append(shape);
        trail.push(shape);
        if (trail.length > 110) trail.shift().remove();
    });
}
