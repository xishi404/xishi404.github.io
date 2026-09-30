(() => {
  'use strict';

  const cat = document.createElement('button');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  cat.type = 'button';
  cat.className = 'pixel-cat';
  cat.setAttribute('aria-label', 'Pixel cat. Click the page to make it walk there.');
  cat.title = '点击页面空白处，小猫会走过去';
  canvas.width = 36;
  canvas.height = 36;
  canvas.setAttribute('aria-hidden', 'true');
  cat.appendChild(canvas);
  document.body.appendChild(cat);

  const colors = {
    outline: '#69727d', gray: '#aab3be', shade: '#8e99a5',
    light: '#d0d8e1', white: '#f4f5f8', pink: '#eb8298',
    blue: '#68b9e2', pupil: '#283c55'
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let size = cat.getBoundingClientRect().width;
  let x = Math.max(8, window.innerWidth - size - 18);
  let y = Math.max(8, window.innerHeight - size - 12);
  let targetX = x;
  let targetY = y;
  let facing = 1;
  let frame = 0;
  let lastTime = 0;
  let animation = 0;

  function block(color, left, top, width, height) {
    ctx.fillStyle = color;
    ctx.fillRect(left, top, width, height);
  }

  function draw(walking = false) {
    ctx.clearRect(0, 0, 36, 36);
    ctx.save();
    if (facing < 0) {
      ctx.translate(36, 0);
      ctx.scale(-1, 1);
    }
    const step = walking && frame % 2 === 1 ? 1 : 0;

    // Curled tail, drawn behind the body.
    block(colors.outline, 5, 15 - step, 3, 3);
    block(colors.outline, 3, 13 - step, 3, 3);
    block(colors.outline, 2, 10 - step, 3, 4);
    block(colors.gray, 4, 11 - step, 2, 4);
    block(colors.outline, 5, 17, 3, 8);
    block(colors.gray, 7, 19, 3, 7);
    block(colors.outline, 8, 24, 5, 4);
    block(colors.light, 10, 25, 4, 2);

    // Rounded body and a lighter belly.
    block(colors.outline, 10, 18, 17, 12);
    block(colors.outline, 12, 16, 14, 2);
    block(colors.outline, 12, 30, 13, 2);
    block(colors.gray, 11, 19, 16, 10);
    block(colors.light, 14, 17, 12, 8);
    block(colors.shade, 11, 25, 5, 4);
    block(colors.white, 20, 22, 7, 8);
    block(colors.light, 17, 27, 5, 4);

    // Four small paws alternate while walking.
    block(colors.outline, 12 + step, 29, 5, 4);
    block(colors.gray, 13 + step, 29, 4, 3);
    block(colors.white, 13 + step, 32, 5, 2);
    block(colors.outline, 20 - step, 29, 5, 4);
    block(colors.light, 21 - step, 29, 4, 3);
    block(colors.white, 20 - step, 32, 5, 2);
    block(colors.outline, 26 + step, 28, 4, 5);
    block(colors.gray, 26 + step, 29, 3, 3);
    block(colors.white, 26 + step, 32, 5, 2);

    // Upright ears, head, cheeks and blue eyes.
    block(colors.outline, 19, 7, 5, 8);
    block(colors.outline, 28, 5, 5, 9);
    block(colors.pink, 21, 9, 2, 4);
    block(colors.pink, 30, 7, 2, 5);
    block(colors.outline, 18, 13, 16, 9);
    block(colors.gray, 19, 12, 14, 9);
    block(colors.light, 20, 15, 13, 7);
    block(colors.white, 25, 19, 9, 4);
    block(colors.blue, 23, 16, 3, 4);
    block(colors.blue, 30, 16, 3, 4);
    block(colors.pupil, 24, 17, 1, 2);
    block(colors.pupil, 31, 17, 1, 2);
    block(colors.pink, 28, 20, 2, 2);
    block(colors.shade, 23, 21, 3, 1);
    block(colors.shade, 31, 21, 3, 1);
    ctx.restore();
  }

  function place() {
    cat.style.left = Math.round(x) + 'px';
    cat.style.top = Math.round(y) + 'px';
  }

  function clamp(value, limit) {
    return Math.min(Math.max(8, value), Math.max(8, limit - size - 8));
  }

  function tick(time) {
    const delta = Math.min((time - (lastTime || time)) / 1000, 0.05);
    lastTime = time;
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.hypot(dx, dy);
    if (distance < 2) {
      x = targetX;
      y = targetY;
      place();
      draw();
      animation = 0;
      lastTime = 0;
      return;
    }
    const step = Math.min(distance, 250 * delta);
    x += dx / distance * step;
    y += dy / distance * step;
    frame = Math.floor(time / 125);
    place();
    draw(true);
    animation = requestAnimationFrame(tick);
  }

  function walkTo(nextX, nextY) {
    targetX = clamp(nextX, window.innerWidth);
    targetY = clamp(nextY, window.innerHeight);
    if (Math.abs(targetX - x) > 2) facing = targetX > x ? 1 : -1;
    if (reducedMotion.matches) {
      cancelAnimationFrame(animation);
      animation = 0;
      x = targetX;
      y = targetY;
      place();
      draw();
      return;
    }
    if (!animation) animation = requestAnimationFrame(tick);
  }

  cat.addEventListener('click', event => {
    event.stopPropagation();
    walkTo(x + facing * 100, y - 12);
  });

  document.addEventListener('click', event => {
    if (event.target.closest('a, button, input, textarea, select, label, [role="button"]')) return;
    walkTo(event.clientX - size / 2, event.clientY - size / 2);
  });

  window.addEventListener('resize', () => {
    size = cat.getBoundingClientRect().width;
    x = clamp(x, window.innerWidth);
    y = clamp(y, window.innerHeight);
    targetX = clamp(targetX, window.innerWidth);
    targetY = clamp(targetY, window.innerHeight);
    place();
  });

  place();
  draw();
})();
