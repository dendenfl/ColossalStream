/**
 * 3D Globe / Cylindrical Curved Carousel Engine
 * Features:
 * - Responsive sizing (Mobile portrait: 125x188px, TV: 180x270px)
 * - Spherical curve rotation (Left-to-Right and Right-to-Left)
 * - Smooth Front-Center ZOOM & POP-OUT effect with ambient glow
 * - TV Remote D-Pad spatial navigation (ArrowLeft / ArrowRight / Enter)
 * - Mobile Touch Swipe gestures & drag physics
 */

import { getItemTitle, t } from '../services/i18n.js';

export class GlobeCarousel {
  constructor(container, options = {}) {
    this.container = container;
    this.items = options.items || [];
    this.onSelect = options.onSelect || (() => {});
    this.onPlay = options.onPlay || (() => {});
    this.onOpenDetails = options.onOpenDetails || (() => {});
    
    this.currentIndex = 0;
    this.calculateDimensions();

    this.initDOM();
    this.bindEvents();
    this.render();
  }

  calculateDimensions() {
    const isMobile = window.innerWidth < 768;
    this.globeRadius = isMobile ? 210 : 380;
    this.centerZoomScale = isMobile ? 1.22 : 1.28;
    this.centerPopZ = isMobile ? 40 : 70;
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="globe-viewport w-full" id="globe-viewport">
        <div class="globe-grid-bg"></div>
        <div class="floor-reflection"></div>
        <div class="globe-ring" id="globe-ring"></div>
      </div>
    `;

    this.viewport = this.container.querySelector('#globe-viewport');
    this.ring = this.container.querySelector('#globe-ring');
  }

  setItems(items) {
    this.items = items;
    this.currentIndex = 0;
    this.render();
  }

  render() {
    this.ring.innerHTML = '';
    const total = this.items.length;
    if (total === 0) return;

    const angleStep = 360 / total;

    this.items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'globe-card';
      card.dataset.index = index;

      card.innerHTML = `
        <div class="relative w-full h-full bg-neutral-950">
          <img 
            src="${item.poster}" 
            alt="${item.title}" 
            class="w-full h-full object-cover" 
            onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
          <div class="absolute bottom-2 left-2 right-2">
            <span class="text-[8px] md:text-[9px] font-mono uppercase bg-red-600 text-white px-1.5 py-0.5 rounded font-bold tracking-wider">
              ${item.type === 'series' ? t('seriesTab').toUpperCase() : t('moviesTab').toUpperCase()}
            </span>
            <h3 class="font-black text-xs md:text-sm text-white mt-0.5 drop-shadow-lg truncate">${getItemTitle(item)}</h3>
            <div class="flex items-center justify-between text-[10px] text-neutral-300 mt-0.5">
              <span>${item.year || '2024'}</span>
              <span class="text-amber-400 font-bold">${item.rating || '★ 8.0'}</span>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (index === this.currentIndex) {
          this.onOpenDetails(this.items[this.currentIndex]);
        } else {
          this.selectIndex(index);
        }
      });

      this.ring.appendChild(card);
    });

    this.updatePositions();
    this.notifySelect();
  }

  updatePositions() {
    const total = this.items.length;
    if (total === 0) return;

    const angleStep = 360 / total;
    const cards = this.ring.querySelectorAll('.globe-card');

    // Rotate ring so current index faces center (0 degrees)
    const ringRotation = -this.currentIndex * angleStep;
    this.ring.style.transform = `rotateY(${ringRotation}deg)`;

    cards.forEach((card, i) => {
      const angle = i * angleStep;
      const isCenter = (i === this.currentIndex);

      if (isCenter) {
        card.classList.add('front-center');
        card.classList.remove('side-card');
        // Front-Center: Curved angle + aggressive POP forward + ZOOM scale
        card.style.transform = `rotateY(${angle}deg) translateZ(${this.globeRadius + this.centerPopZ}px) scale(${this.centerZoomScale})`;
      } else {
        card.classList.remove('front-center');
        card.classList.add('side-card');
        // Receding along the spherical globe curvature
        card.style.transform = `rotateY(${angle}deg) translateZ(${this.globeRadius}px) scale(0.92)`;
      }
    });
  }

  notifySelect() {
    if (this.items[this.currentIndex]) {
      this.onSelect(this.items[this.currentIndex]);
    }
  }

  selectIndex(index) {
    const total = this.items.length;
    if (total === 0) return;
    this.currentIndex = (index + total) % total;
    this.updatePositions();
    this.notifySelect();
  }

  rotate(direction) {
    this.selectIndex(this.currentIndex + direction);
  }

  getCurrentItem() {
    return this.items[this.currentIndex] || null;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.calculateDimensions();
      this.updatePositions();
    });

    // Mobile Touch Gestures (Swipe Left / Right along the globe)
    let touchStartX = 0;
    let touchStartY = 0;

    this.viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.viewport.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Ensure horizontal swipe intent
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
        if (deltaX > 0) {
          this.rotate(-1); // Swiped right -> scroll globe left-to-right
        } else {
          this.rotate(1);  // Swiped left -> scroll globe right-to-left
        }
      }
    }, { passive: true });

    // Desktop Mouse Drag Support
    let mouseStartX = 0;
    let isMouseDown = false;

    this.viewport.addEventListener('mousedown', (e) => {
      mouseStartX = e.clientX;
      isMouseDown = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const delta = e.clientX - mouseStartX;
      if (delta > 35) this.rotate(-1);
      else if (delta < -35) this.rotate(1);
    });

    // TV Remote D-Pad Navigation
    window.addEventListener('keydown', (e) => {
      if (document.body.classList.contains('modal-open')) return;

      if (e.key === 'ArrowLeft') {
        this.rotate(-1);
      } else if (e.key === 'ArrowRight') {
        this.rotate(1);
      } else if (e.key === 'Enter') {
        const item = this.getCurrentItem();
        if (item) this.onPlay(item);
      }
    });
  }
}
