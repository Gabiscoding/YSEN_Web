# Tools, languages, and references

Notes for the ysen site in `YSEN_Web`. The site is static. Open `index.html` in a browser. There is no package install and no build step.

## Languages

- HTML
- CSS
- JavaScript

Pages: `index.html`, `education.html`, `skills.html`, `work.html`, `about.html`. Shared styles are in `styles.css`. Behavior is in `script.js`, `skills.js`, and `about.js`.

## Tools and libraries

- [Sulphur Point](https://fonts.google.com/specimen/Sulphur+Point) (weights 400 and 700), loaded from Google Fonts. Used for the wordmark, navigation, and page type.
- [Matter.js 0.20.0](https://github.com/liabru/matter-js) for the skill pit. Loaded from jsDelivr: `https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js`.
- [poly-decomp 0.3.0](https://github.com/schteppe/poly-decomp.js) so concave skill shapes can be split into convex parts. Loaded from jsDelivr: `https://cdn.jsdelivr.net/npm/poly-decomp@0.3.0/build/decomp.min.js`. Wired with `Common.setDecomp(decomp)` and `Bodies.fromVertices`.
- SVG assets in `assets/` for the bunny mark, navigation icons, and toolkit icons. The bunny SVG is also the browser icon.
- Resume file: `assets/Magpili_Resume_new.pdf`.

The text scramble, color wipe, home tilt, capsule motion, and about-page cursor trail are written in plain JavaScript and CSS. GSAP is not a dependency.

## References

- Figma file for the home layout, bunny logo, and color ramps. The ramp notes live in `design-token-structure.md` (one folder above this site).
- [Figma profile](https://www.figma.com/@gabidesigns), [GitHub](https://github.com/Gabiscoding), and [LinkedIn](https://www.linkedin.com/in/yssa-gabrielle-magpili/) are the navbar links. Email opens a Gmail compose window to yssagabrielle.d.magpili@gmail.com.
- [Hipuku parallax pen](https://codepen.io/hipuku/pen/01a10641-116c-78db-8a4a-0b79c1ee452c) for the resting home: a full-window perspective, three depth planes, and pointer tilt. The same visual language informed the education page and the skill pit.
- [Matter.js docs](https://brm.io/matter-js/docs/) for the rigid-body world, mouse constraint, and vertex bodies in the skill pit.
