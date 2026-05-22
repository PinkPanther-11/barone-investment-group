# Entrance Animation — What to Add

Do NOT replace any existing files. Make only the three additions below.

---

## 1. Upload entrance.js (new file)

Drop `entrance.js` into the site root alongside `script.js` and `content.js`. No edits needed — it's a standalone file.

---

## 2. Add to index.html — two spots

### Spot A: Overlay HTML
Paste this block immediately after the opening `<body>` tag (before anything else in the body):

```html
<!-- Cinematic Entrance Overlay -->
<div id="entrance-overlay" role="presentation" aria-hidden="true">
  <canvas id="entrance-canvas"></canvas>
  <div class="entrance-curtain entrance-curtain-left"></div>
  <div class="entrance-curtain entrance-curtain-right"></div>
  <div class="entrance-stage">
    <div class="entrance-mark">
      <span class="entrance-mark-letter">B</span>
      <div class="entrance-mark-shimmer"></div>
    </div>
    <div class="entrance-wordmark">
      <span class="entrance-wordmark-name">Barone</span>
      <span class="entrance-wordmark-sub">Investment Group</span>
    </div>
    <div class="entrance-rule"></div>
    <p class="entrance-tagline"></p>
  </div>
  <button class="entrance-skip" type="button">Skip</button>
</div>
```

### Spot B: Script tag
Paste this line immediately before the first existing `<script src=` tag (so it loads first):

```html
<script src="entrance.js?v=20260522v1"></script>
```

---

## 3. Add to styles.css — paste at the very end

```css
/* ═══════════════════════════════════════════════════════
   ENTRANCE ANIMATION OVERLAY
   ═══════════════════════════════════════════════════════ */

#entrance-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #06060e;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity 0.7s ease;
}
#entrance-overlay.fade-out {
  opacity: 0;
  pointer-events: none;
}
#entrance-overlay.hidden {
  display: none;
}

#entrance-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.entrance-curtain {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background: #0b0b18;
  z-index: 2;
  transition: transform 0.72s cubic-bezier(0.76, 0, 0.24, 1);
}
.entrance-curtain-left  { left: 0; transform-origin: left;  }
.entrance-curtain-right { right: 0; transform-origin: right; }
.entrance-curtain-left.open  { transform: translateX(-100%); }
.entrance-curtain-right.open { transform: translateX(100%);  }

.entrance-curtain-left::after {
  content: '';
  position: absolute;
  right: 0; top: 0;
  width: 1px; height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.6), transparent);
}
.entrance-curtain-right::after {
  content: '';
  position: absolute;
  left: 0; top: 0;
  width: 1px; height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.6), transparent);
}

.entrance-stage {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.entrance-stage.fade-out {
  opacity: 0;
  transform: scale(0.94);
}

.entrance-mark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 1.5px solid rgba(201,168,76,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
  opacity: 0;
  transform: scale(0.3);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.entrance-mark.stamped {
  opacity: 1;
  transform: scale(1);
}
.entrance-mark::before,
.entrance-mark::after {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 1px solid rgba(201,168,76,0.25);
  opacity: 0;
}
.entrance-mark::after {
  inset: -24px;
  border-color: rgba(201,168,76,0.12);
}
.entrance-mark.stamped::before,
.entrance-mark.stamped::after {
  animation: entrance-ring 2s ease-out infinite;
}
.entrance-mark.stamped::after {
  animation-delay: 0.4s;
}
@keyframes entrance-ring {
  0%   { opacity: 0.7; transform: scale(0.85); }
  100% { opacity: 0;   transform: scale(1.4);  }
}

.entrance-mark-letter {
  font-size: 2.2rem;
  font-weight: 700;
  color: #c9a84c;
  line-height: 1;
  font-family: 'Cormorant Garamond', serif;
}

.entrance-mark-shimmer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
}
.entrance-mark-shimmer::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -150%;
  width: 80%;
  height: 200%;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255,255,255,0.35) 50%,
    transparent 70%
  );
  transform: skewX(-20deg);
  animation: entrance-shimmer 0.8s 0.35s ease-out forwards;
  opacity: 0;
}
@keyframes entrance-shimmer {
  0%   { left: -150%; opacity: 1; }
  100% { left: 200%;  opacity: 1; }
}

.entrance-wordmark {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.entrance-wordmark.visible {
  opacity: 1;
  transform: translateY(0);
}
.entrance-wordmark-name {
  display: block;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  color: #c9a84c;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: 'Cormorant Garamond', serif;
  line-height: 1;
}
.entrance-wordmark-sub {
  display: block;
  font-size: clamp(0.6rem, 1.2vw, 0.75rem);
  color: rgba(201,168,76,0.55);
  letter-spacing: 0.35em;
  text-transform: uppercase;
  margin-top: 8px;
}

.entrance-tagline {
  margin-top: 28px;
  min-height: 1.4em;
  font-size: clamp(0.78rem, 1.4vw, 0.9rem);
  color: rgba(255,255,255,0.38);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  border-right: 1.5px solid rgba(201,168,76,0.7);
  width: 0;
  opacity: 0;
}
.entrance-tagline.typing {
  opacity: 1;
  transition: opacity 0.2s ease;
  animation: entrance-cursor 0.75s step-end infinite;
}
.entrance-tagline.done {
  border-right-color: transparent;
  animation: none;
}
@keyframes entrance-cursor {
  0%, 100% { border-right-color: rgba(201,168,76,0.7); }
  50%       { border-right-color: transparent; }
}

.entrance-skip {
  position: absolute;
  bottom: 32px;
  right: 32px;
  z-index: 10;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 18px;
  border-radius: 30px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.4s ease, color 0.2s, border-color 0.2s;
  font-family: inherit;
}
.entrance-skip.visible {
  opacity: 1;
}
.entrance-skip:hover {
  color: rgba(255,255,255,0.75);
  border-color: rgba(255,255,255,0.35);
}

.entrance-rule {
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent);
  margin: 16px auto 0;
  transition: width 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}
.entrance-rule.expanded {
  width: 180px;
}

body.entrance-active {
  overflow: hidden;
}
```
