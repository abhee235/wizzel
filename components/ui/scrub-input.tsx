import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect, forwardRef } from 'react';

const ScrubCursor = forwardRef(({ x, y }, ref) => {
  return (
    <svg
      ref={ref}
      width="35px"
      height="35px"
      viewBox="0 0 35 35"
      version="1.1"
      style={{
        position: 'fixed',
        left: x - 17.5,
        top: y - 17.5,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {/* SVG content */}
      <g stroke="none" strokeWidth="1">
        <path
          d="M9,17.9907 L9,17.9957 L14.997,23.9917 L14.998,19.9927 L16.997,19.9927 L19.017,19.9927 L19.017,23.9927 L24.997,17.9917 L19.017,11.9927 L19.018,16.0117 L16.997,16.0137 L14.997,16.0137 L14.998,11.9917 L9,17.9907 Z M10.411,17.9937 L13.998,14.4057 L13.997,16.9927 L17.497,16.9927 L20.018,16.9927 L20.018,14.4077 L23.583,17.9937 L20.019,21.5787 L20.018,18.9937 L17.497,18.9937 L13.998,18.9927 L13.997,21.5787 L10.411,17.9937 Z"
          fill="#FFFFFF"
          strokeWidth="1"
        />
        <path
          d="M17.4971,18.9932 L20.0181,18.9932 L20.0181,21.5792 L23.5831,17.9932 L20.0181,14.4082 L20.0181,17.0132 L17.4971,17.0132 L13.9971,17.0132 L13.9971,14.4062 L10.4111,17.9932 L13.9971,21.5792 L13.9971,18.9922 L17.4971,18.9932 Z"
          fill="#000000"
        />
      </g>
    </svg>
  );
});

const ScrubInput = ({
  id,
  value = 0,
  min = 0,
  max = Infinity,
  step = 1,
  sensitivity = 0.5,
  onChange,
  onBlur,
  icon = '?',
  suffix = '',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const inputRef = useRef(null);
  const scrubRef = useRef(null);
  const startValueRef = useRef(value);
  const cursorPositionRef = useRef({ x: 0, y: 0 });
  const deltaXRef = useRef(0);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === scrubRef.current;
      setPointerLocked(locked);
      if (!locked) {
        setIsScrubbing(false);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener(
        'pointerlockchange',
        handlePointerLockChange
      );
    };
  }, []);

  useEffect(() => {
    if (!pointerLocked) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const deltaX = e.movementX;
      const deltaY = e.movementY;

      // Accumulate total deltaX
      deltaXRef.current += deltaX;

      // Calculate new value based on total accumulated deltaX
      let newValue = Math.round(
        startValueRef.current + deltaXRef.current * sensitivity
      );
      newValue = Math.max(Math.min(newValue, max), min);

      if (newValue !== inputValue) {
        setInputValue(newValue);
        onChange(newValue);
      }

      setCursorPosition((prev) => {
        let x = prev.x + deltaX;
        let y = prev.y + deltaY;

        // Wrap around horizontally
        if (x < 0) x += window.innerWidth;
        if (x > window.innerWidth) x -= window.innerWidth;

        // Wrap around vertically
        if (y < 0) y += window.innerHeight;
        if (y > window.innerHeight) y -= window.innerHeight;

        cursorPositionRef.current = { x, y }; // Update ref
        return { x, y };
      });
    };

    const handleMouseUp = () => {
      if (document.pointerLockElement === scrubRef.current) {
        document.exitPointerLock();
      }
      setIsScrubbing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pointerLocked, sensitivity, min, max, step, onChange, inputValue])

  const handlePointerDown = (e) => {
    e.preventDefault();
    deltaXRef.current = 0;
    startValueRef.current = inputValue;
    cursorPositionRef.current = { x: e.clientX, y: e.clientY };
    setCursorPosition({ x: e.clientX, y: e.clientY });
    scrubRef?.current?.requestPointerLock();
    setIsScrubbing(true);
  };

  const handlePointerUp = () => {
    if (document.pointerLockElement === scrubRef.current) {
      document.exitPointerLock();
    }
    setIsScrubbing(false);
  };

  const handleInputChange = (e) => {
    const newValue = parseFloat(e.target.value) || 0;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <>
      <div className="relative">
        <span
          ref={scrubRef}
          className="absolute p-[3px] text-[13px] top-1/2 transform w-6 h-6 flex items-center justify-center -translate-y-1/2 text-gray-500 cursor-ew-resize select-none"
          onPointerDown={handlePointerDown}
          tabIndex={0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={inputValue}
          aria-orientation="horizontal"
          aria-label="Adjust value"
        >
          {icon}
        </span>
        <input
          ref={inputRef}
          id={id}
          value={inputValue + suffix}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          onBlur={onBlur}
          className={cn(
            className
              ? className
              : 'w-24 h-6 bg-gray-100 rounded-md text-gray-800 focus:outline-none',
            'pl-6 text-xs pr-2 py-1'
          )}
        />
      </div>
      {isScrubbing && pointerLocked && (
        <>
          {/* Overlay to capture pointer events */}
          <div className="fixed inset-0 z-50" style={{ cursor: 'none' }}></div>
          {/* Custom Cursor */}
          <ScrubCursor x={cursorPosition.x} y={cursorPosition.y} />
        </>
      )}
    </>
  );
};

export default ScrubInput;