import React from 'react';

const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNDAiPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgZm9udC1zaXplPSIzNSIgZmlsbD0iYmxhY2siIGxldHRlci1zcGFjaW5nPSItMnB4Ij5aQVA8L3RleHQ+Cjwvc3ZnPg==";

export const MeshSidebar: React.FC = () => {
  return (
    <div className="w-full md:w-1/2 p-4 lg:p-6 hidden md:block transition-all duration-300 h-full">
      <div className="mesh-gradient h-full w-full rounded-2xl relative p-12 flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Header Logo */}
        <div className="flex items-center">
            <img 
                src={LOGO_DATA_URI} 
                alt="ZAP Logo" 
                className="h-14 w-auto invert drop-shadow-md" 
            />
        </div>

        {/* Content */}
        <div className="z-10 relative">
          <div className="mb-6 inline-block">
            <span className="py-1.5 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider uppercase shadow-sm">
              Enterprise Solutions
            </span>
          </div>
          <p className="text-blue-50 text-base mb-3 font-semibold tracking-wide uppercase opacity-90">
            Empower your restaurant with ZAP
          </p>
          <h1 className="text-white text-5xl font-bold leading-tight drop-shadow-md">
            Maximize Revenue &amp; Minimize Costs for your F&amp;B Business
          </h1>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-30 mix-blend-screen animate-pulse"></div>
      </div>
    </div>
  );
};