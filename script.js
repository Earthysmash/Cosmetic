// ============== Floating bubbles ==============
function createBubbles() {
  const container = document.querySelector('.bubbles-container');
  if (!container) return;
  const count = window.innerWidth < 768 ? 12 : 25;
  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.random() * 80 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDuration = `${Math.random() * 15 + 12}s`;
    bubble.style.animationDelay = `${Math.random() * 15}s`;
    bubble.style.setProperty('--x-drift', `${(Math.random() - 0.5) * 200}px`);
    bubble.style.opacity = Math.random() * 0.4 + 0.1;
    container.appendChild(bubble);
  }
}

// ============== Scroll reveal ==============
function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// ============== Animated number counters ==============
function setupCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        const target = parseInt(entry.target.dataset.counter, 10);
        animateNumber(entry.target, target);
        entry.target.dataset.done = 'true';
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => observer.observe(el));
}

function animateNumber(el, target) {
  const duration = 1800;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

// ============== Saved time meter ==============
function setupSavedMeter() {
  const bar = document.getElementById('savedBar');
  const label = document.getElementById('savedTime');
  if (!bar || !label) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !bar.dataset.done) {
        bar.style.width = '66%';
        bar.dataset.done = 'true';
        const start = performance.now();
        const duration = 2000;
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          label.textContent = `${Math.round(30 * eased)} นาที`;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
  }, { threshold: 0.4 });
  observer.observe(bar);
}

// ============== Hero bomb click effect ==============
function setupHeroBomb() {
  const bomb = document.getElementById('heroBomb');
  if (!bomb) return;

  bomb.addEventListener('click', () => {
    bomb.classList.remove('clicked');
    void bomb.offsetWidth;
    bomb.classList.add('clicked');
    spawnFizz(bomb);
  });
}

function spawnFizz(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#67e8f9', '#f9a8d4', '#c4b5fd', '#fde047'];

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: fixed;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${cx}px; top: ${cy}px;
      pointer-events: none;
      z-index: 100;
      box-shadow: 0 0 10px currentColor;
    `;
    document.body.appendChild(p);

    const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5;
    const dist = 100 + Math.random() * 200;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const dur = 800 + Math.random() * 600;

    p.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 },
      ],
      { duration: dur, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    ).onfinish = () => p.remove();
  }
}

// ============== Cursor glow ==============
function setupCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow || window.innerWidth < 768) return;

  document.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

// ============== Problem card spotlight ==============
function setupCardSpotlight() {
  document.querySelectorAll('.problem-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });
}

// ============== Order form + cart ==============
function setupForm() {
  const form = document.getElementById('orderForm');
  const modal = document.getElementById('successModal');
  const orderIdEl = document.getElementById('orderId');
  const closeBtn = document.getElementById('closeModal');
  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const orderId = 'BB' + Date.now().toString(36).toUpperCase();
    const order = {
      id: orderId,
      ...data,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    // Persist to localStorage so we have data structure ready for an Excel dashboard later
    const orders = JSON.parse(localStorage.getItem('bombbath_orders') || '[]');
    orders.push(order);
    localStorage.setItem('bombbath_orders', JSON.stringify(orders));

    if (orderIdEl) orderIdEl.textContent = `เลขออเดอร์: ${orderId}`;
    modal.classList.add('show');
    form.reset();
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
}

// ============== Add to cart buttons ==============
function setupCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.dataset.product;

      // Toast notification
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: linear-gradient(90deg, #06b6d4, #ec4899);
        color: white;
        padding: 1rem 2rem;
        border-radius: 999px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 20px 60px -10px rgba(236, 72, 153, 0.5);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      toast.textContent = `เพิ่ม "${product}" ลงตะกร้าแล้ว! เลื่อนลงไปกรอกที่อยู่ ↓`;
      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });

      setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 400);
      }, 2500);

      // Pre-fill the form
      const select = document.querySelector('select[name="product"]');
      if (select) {
        const opts = Array.from(select.options);
        const match = opts.find((o) => o.text.startsWith(product));
        if (match) select.value = match.value;
      }

      // Smooth scroll to order
      setTimeout(() => {
        document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 600);
    });
  });
}

// ============== Admin: view orders (Ctrl+Shift+O) ==============
function setupAdminShortcut() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'O') {
      const orders = JSON.parse(localStorage.getItem('bombbath_orders') || '[]');
      if (!orders.length) {
        alert('ยังไม่มีออเดอร์');
        return;
      }
      const csv = ordersToCSV(orders);
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bombbath-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
}

function ordersToCSV(orders) {
  const headers = ['id', 'createdAt', 'name', 'phone', 'address', 'product', 'quantity', 'note', 'status'];
  const rows = orders.map((o) =>
    headers.map((h) => `"${String(o[h] || '').replace(/"/g, '""')}"`).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

// ============== Init ==============
document.addEventListener('DOMContentLoaded', () => {
  createBubbles();
  setupReveal();
  setupCounters();
  setupSavedMeter();
  setupHeroBomb();
  setupCursorGlow();
  setupCardSpotlight();
  setupForm();
  setupCartButtons();
  setupAdminShortcut();
  console.log('%c💣 BombBath', 'font-size: 24px; font-weight: 900; background: linear-gradient(90deg, #06b6d4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
  console.log('%cกด Ctrl+Shift+O เพื่อ export ออเดอร์เป็น CSV (ใช้กับ Excel ได้)', 'color: #06b6d4; font-size: 12px;');
});
