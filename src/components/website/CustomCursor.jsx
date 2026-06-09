import React, { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Disable completely on mobile/touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
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
        className="fixed top-0 left-0 pointer-events-none z-[99999] flex items-center justify-center mix-blend-difference"
        style={{
          opacity: isHidden ? 0 : 1,
          transition: 'opacity 0.3s ease',
          willChange: 'transform'
        }}
      >
        {/* The dynamic ring */}
        <div 
          className={`absolute rounded-full border border-white flex items-center justify-center transition-all duration-300 ease-out shadow-[0_0_15px_rgba(255,255,255,0.3)] ${
            isHovering 
              ? 'w-16 h-16 bg-white/10 backdrop-blur-sm scale-110 border-transparent' 
              : 'w-8 h-8 bg-transparent'
          }`}
          style={{ transitionProperty: 'width, height, background-color, transform, border-color' }}
        >
          {/* The inner dot */}
          <div 
            className={`rounded-full bg-white transition-all duration-300 ease-out ${
              isHovering ? 'w-0 h-0 opacity-0' : 'w-1.5 h-1.5 opacity-100 shadow-[0_0_10px_#fff]'
            }`}
          />
        </div>
      </div>
    </>
  );
};

export default CustomCursor;
