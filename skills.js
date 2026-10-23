const board = document.querySelector("#pit-board");
const { Engine, Render, Runner, Bodies, Body, Composite, Events, Mouse, MouseConstraint, Common } = Matter;

Common.setDecomp(decomp);

const hues = ["#7193ed", "#bf9ff1", "#f28bad", "#fc692b", "#ffc700", "#82d25d", "#15ad70", "#4a9fd0", "#e14f30", "#8da9f1", "#f5a2bd", "#9bdb7d"];
const skills = [
    ["Computational problem solving", "rect"],
    ["Object Abstraction", "hex"],
    ["Project Management", "plus"],
    ["Design", "tri"],
    ["Machine Learning", "star"],
    ["Automata & Language theory", "rect"],
    ["Software Engineering", "rect"],
    ["Language processing", "arrow"],
    ["UI/UX", "plus"],
    ["Object oriented programming", "rect"],
    ["C", "circle"],
    ["Java & C++", "hex"],
    ["Scheme & Prolog", "rect"],
    ["Python", "circle"],
    ["Cobol", "tri"],
    ["R", "circle"],
    ["Rust", "hex"],
    ["Erlang", "tri"],
    ["JavaScript", "hex"],
    ["HTML & CSS + Tailwind", "rect"],
    ["MERN", "circle"],
    ["Next.js", "hex"],
    ["Figma", "circle"],
    ["Adobe PS", "rect"],
    ["React", "circle"],
    ["SvelteKit", "hex"],
    ["Illustrator & XDesign", "rect"],
    ["HTML & Node.js", "rect"],
    ["LaTeX", "circle"],
    ["Filipino", "star"],
    ["English", "circle"]
];

const engine = Engine.create();
const render = Render.create({
    element: board,
    engine,
    options: {
        width: board.clientWidth,
        height: board.clientHeight,
        wireframes: false,
        background: "transparent",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2)
    }
});
const runner = Runner.create();

function plus(size) {
    const a = size;
    const b = size / 3;
    return [
        { x: -a, y: -b }, { x: -b, y: -b }, { x: -b, y: -a }, { x: b, y: -a },
        { x: b, y: -b }, { x: a, y: -b }, { x: a, y: b }, { x: b, y: b },
        { x: b, y: a }, { x: -b, y: a }, { x: -b, y: b }, { x: -a, y: b }
    ];
}

function star(radius) {
    const points = [];
    for (let i = 0; i < 10; i += 1) {
        const span = i % 2 === 0 ? radius : radius * 0.42;
        const angle = -Math.PI / 2 + i * Math.PI / 5;
        points.push({ x: Math.cos(angle) * span, y: Math.sin(angle) * span });
    }
    return points;
}

function arrow(width, height) {
    return [
        { x: -width, y: -height * 0.32 },
        { x: width * 0.2, y: -height * 0.32 },
        { x: width * 0.2, y: -height },
        { x: width, y: 0 },
        { x: width * 0.2, y: height },
        { x: width * 0.2, y: height * 0.32 },
        { x: -width, y: height * 0.32 }
    ];
}

function fill(hue) {
    return {
        restitution: 0.35,
        friction: 0.15,
        frictionAir: 0.02,
        density: 0.002,
        render: { fillStyle: hue, strokeStyle: hue, lineWidth: 0 }
    };
}

function skillBody(name, kind, x, y, hue) {
    const options = fill(hue);
    let body;
    if (kind === "circle") body = Bodies.circle(x, y, 34, options);
    else if (kind === "tri") body = Bodies.polygon(x, y, 3, 40, options);
    else if (kind === "hex") body = Bodies.polygon(x, y, 6, 38, options);
    else if (kind === "rect") body = Bodies.rectangle(x, y, Math.max(112, name.length * 7), 48, { ...options, chamfer: { radius: 12 } });
    else {
        const vertices = kind === "plus" ? plus(36) : kind === "star" ? star(44) : arrow(50, 34);
        body = Bodies.fromVertices(x, y, [vertices], options, true);
        if (!body) body = Bodies.rectangle(x, y, 108, 48, options);
    }
    body.plugin.skill = name;
    return body;
}

function walls(width, height) {
    const thick = 48;
    const hidden = { isStatic: true, render: { visible: false } };
    return [
        Bodies.rectangle(width / 2, height + thick / 2, width + thick * 2, thick, hidden),
        Bodies.rectangle(width / 2, -thick / 2, width + thick * 2, thick, hidden),
        Bodies.rectangle(-thick / 2, height / 2, thick, height * 2, hidden),
        Bodies.rectangle(width + thick / 2, height / 2, thick, height * 2, hidden)
    ];
}

function drop() {
    const width = render.options.width;
    skills.forEach(([name, kind], index) => {
        const column = index % 6;
        const row = Math.floor(index / 6);
        const x = 70 + column * ((width - 120) / 5);
        const y = 36 + row * 8;
        const body = skillBody(name, kind, x, y, hues[index % hues.length]);
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: 1 + row });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
        Composite.add(engine.world, body);
    });
}

function clearSkills() {
    Composite.allBodies(engine.world).forEach((body) => {
        if (body.plugin.skill) Composite.remove(engine.world, body);
    });
}

function wrapLabel(context, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    words.forEach((word) => {
        const next = line ? line + " " + word : word;
        if (context.measureText(next).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = next;
        }
    });
    if (line) lines.push(line);
    return lines.slice(0, 3);
}

Composite.add(engine.world, walls(render.options.width, render.options.height));
drop();

const mouse = Mouse.create(render.canvas);
mouse.element.removeEventListener("wheel", mouse.mousewheel);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.18, render: { visible: false } }
});
Composite.add(engine.world, mouseConstraint);
render.mouse = mouse;

Events.on(render, "afterRender", () => {
    const context = render.context;
    const ratio = render.options.pixelRatio || 1;
    context.save();
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.font = "700 11px Sulphur Point, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#1c1c1c";
    Composite.allBodies(engine.world).forEach((body) => {
        if (!body.plugin || !body.plugin.skill) return;
        context.save();
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);
        const lines = wrapLabel(context, body.plugin.skill, 72);
        lines.forEach((line, index) => {
            context.fillText(line, 0, (index - (lines.length - 1) / 2) * 13);
        });
        context.restore();
    });
    context.restore();
});

document.querySelector(".pit-replay").addEventListener("click", () => {
    clearSkills();
    drop();
});

Render.run(render);
Runner.run(runner, engine);
