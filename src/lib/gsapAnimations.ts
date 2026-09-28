import gsap from 'gsap';

export const gsapAnimations = {
  // Page / Container Entrance Animation
  pageEntrance: (containerSelector: string | HTMLElement | null) => {
    if (typeof window === 'undefined' || !containerSelector) return;
    try {
      gsap.fromTo(
        containerSelector,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    } catch {
      // safe fallback
    }
  },

  // Stagger items (Product Grid, KPI Cards, Table rows)
  staggerEntrance: (elementsSelector: string | HTMLElement[] | NodeListOf<Element> | null, stagger: number = 0.05) => {
    if (typeof window === 'undefined' || !elementsSelector) return;
    try {
      if (typeof elementsSelector !== 'string' && 'length' in elementsSelector && elementsSelector.length === 0) {
        return;
      }
      gsap.fromTo(
        elementsSelector,
        { opacity: 0, y: 20, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: stagger,
          ease: 'power3.out'
        }
      );
    } catch {
      // safe fallback
    }
  },

  // Animated Number Counter for KPIs and Revenue
  counter: (
    target: { value: number },
    endValue: number,
    onUpdate: (current: number) => void,
    duration: number = 1
  ) => {
    if (typeof window === 'undefined') {
      onUpdate(endValue);
      return;
    }
    try {
      gsap.to(target, {
        value: endValue,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => onUpdate(target.value)
      });
    } catch {
      onUpdate(endValue);
    }
  },

  // Cart Badge Bounce when item is added
  badgeBounce: (element: HTMLElement | null) => {
    if (!element || typeof window === 'undefined') return;
    try {
      gsap.fromTo(
        element,
        { scale: 0.7, opacity: 0.5 },
        { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: 'back.out(2)' }
      );
    } catch {
      // safe fallback
    }
  },

  // Modal Dialog Open Animation
  modalOpen: (backdrop: HTMLElement | null, content: HTMLElement | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (backdrop) {
        gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' });
      }
      if (content) {
        gsap.fromTo(
          content,
          { opacity: 0, scale: 0.94, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.4)' }
        );
      }
    } catch {
      // safe fallback
    }
  },

  // Drawer / Bottom Sheet Slide In
  drawerSlideIn: (drawer: HTMLElement | null, fromBottom: boolean = false) => {
    if (!drawer || typeof window === 'undefined') return;
    try {
      if (fromBottom) {
        gsap.fromTo(
          drawer,
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' }
        );
      } else {
        gsap.fromTo(
          drawer,
          { x: '100%', opacity: 0 },
          { x: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' }
        );
      }
    } catch {
      // safe fallback
    }
  },

  // Quick Action Button Pulse
  pulseSuccess: (element: HTMLElement | null) => {
    if (!element || typeof window === 'undefined') return;
    try {
      gsap.fromTo(
        element,
        { scale: 1 },
        { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' }
      );
    } catch {
      // safe fallback
    }
  }
};
