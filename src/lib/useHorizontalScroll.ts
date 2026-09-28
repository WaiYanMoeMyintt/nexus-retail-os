import { useRef, useState, useEffect, useCallback } from 'react';

interface UseHorizontalScrollOptions {
  wheelSpeed?: number;
  scrollStep?: number;
}

export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseHorizontalScrollOptions = {}
) {
  const { wheelSpeed = 1.2, scrollStep = 280 } = options;
  const containerRef = useRef<T>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({ startX: 0, scrollLeft: 0, hasDragged: false });

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial check
    checkScroll();

    // Mouse Wheel vertical to horizontal translation
    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        // If wheel is moving vertically (or diagonally), map it to horizontal scroll
        if (Math.abs(e.deltaY) > 0) {
          e.preventDefault();
          el.scrollLeft += (e.deltaY || e.deltaX) * wheelSpeed;
          checkScroll();
        }
      }
    };

    const handleScroll = () => {
      checkScroll();
    };

    // Attach non-passive wheel listener for smooth scrolling
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', handleScroll, { passive: true });
    
    // Resize observer to update scroll buttons on dynamic resizing
    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [wheelSpeed, checkScroll]);

  // Drag-to-scroll support for mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    setIsDragging(true);
    dragInfo.current = {
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasDragged: false
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = containerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragInfo.current.startX) * 1.2;
    if (Math.abs(walk) > 4) {
      dragInfo.current.hasDragged = true;
    }
    el.scrollLeft = dragInfo.current.scrollLeft - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const scrollLeftBy = (step = scrollStep) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -step, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const scrollRightBy = (step = scrollStep) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: step, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return {
    containerRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    scrollLeftBy,
    scrollRightBy,
    checkScroll,
    dragProps: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUpOrLeave,
      onMouseLeave: handleMouseUpOrLeave,
    }
  };
}
