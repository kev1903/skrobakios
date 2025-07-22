import React, { useRef, useEffect } from 'react';

export const SimpleScrollTest = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const body = bodyRef.current;

    console.log('🧪 Simple scroll test setup');

    if (!header || !body) {
      console.warn('❌ Refs not found');
      return;
    }

    const syncScroll = (source: HTMLElement, target: HTMLElement, name: string) => {
      console.log(`📜 ${name} scrolled to:`, source.scrollLeft);
      target.scrollLeft = source.scrollLeft;
    };

    const handleHeaderScroll = () => syncScroll(header, body, 'Header');
    const handleBodyScroll = () => syncScroll(body, header, 'Body');

    header.addEventListener('scroll', handleHeaderScroll);
    body.addEventListener('scroll', handleBodyScroll);

    console.log('✅ Simple scroll listeners attached');

    return () => {
      header.removeEventListener('scroll', handleHeaderScroll);
      body.removeEventListener('scroll', handleBodyScroll);
    };
  }, []);

  const testWidth = 3000; // 3000px width to force scrolling

  return (
    <div className="border border-red-500 m-4 p-4">
      <h3 className="text-lg font-bold mb-4">🧪 Simple Scroll Sync Test</h3>
      
      {/* Header */}
      <div 
        ref={headerRef}
        className="border border-blue-500 h-16 overflow-x-auto mb-2"
        style={{ width: '100%' }}
      >
        <div 
          className="h-full flex items-center"
          style={{ 
            width: testWidth, 
            background: 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          <span className="ml-4">HEADER - Try scrolling horizontally →→→</span>
        </div>
      </div>

      {/* Body */}
      <div 
        ref={bodyRef}
        className="border border-green-500 h-32 overflow-x-auto"
        style={{ width: '100%' }}
      >
        <div 
          className="h-full flex items-center"
          style={{ 
            width: testWidth,
            background: 'linear-gradient(90deg, purple, blue, green, yellow, orange, red)',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          <span className="ml-4">BODY - Should scroll with header ↑↑↑</span>
        </div>
      </div>
    </div>
  );
};