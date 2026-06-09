import React, { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Disable on mobile/tablets by checking screen width instead of pointer (more reliable)
    if (window.innerWidth < 768 || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e) => {
      if (cursorRef.current) {
        // Direct DOM manipulation for butter-smooth 60fps tracking (no React re-renders)
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      if (isHidden) setIsHidden(false);
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    const handleMouseOver = (e) => {
      // Check if hovering over any interactive element
      const isClickable = e.target.closest('a, button, input, textarea, select, [role="button"], .cursor-pointer, .wa-float-btn');
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isHidden]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Hide the default system cursor to make the illusion perfect */}
      <style>
        {`
          body, a, button, input, textarea, select, [role="button"], .cursor-pointer, .wa-float-btn {
            cursor: none !important;
          }
        `}
      </style>
      
      {/* The Cursor Container */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] flex items-center justify-center"
        style={{
          opacity: isHidden ? 0 : 1,
          transition: 'opacity 0.3s ease',
          willChange: 'transform'
        }}
      >
        {/* The dynamic ring */}
        <div 
          className={`absolute rounded-full border flex items-center justify-center transition-all duration-300 ease-out ${
            isHovering 
              ? 'w-16 h-16 bg-[#2563eb]/10 scale-110 border-[#2563eb]/50 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
              : 'w-8 h-8 bg-transparent border-[#2563eb] shadow-[0_0_10px_rgba(37,99,235,0.2)]'
          }`}
          style={{ transitionProperty: 'width, height, background-color, transform, border-color' }}
        >
          {/* The inner dot */}
          <div 
            className={`rounded-full bg-[#2563eb] transition-all duration-300 ease-out shadow-[0_0_8px_#2563eb] ${
              isHovering ? 'w-0 h-0 opacity-0' : 'w-2 h-2 opacity-100'
            }`}
          />
        </div>
      </div>
    </>
  );
};

export default CustomCursor;
