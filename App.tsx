import React, { useState, useEffect, useRef } from 'react';
import { MeshSidebar } from './components/MeshSidebar';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { Dashboard } from './components/Dashboard';
import { ViewState } from './types';

// Default backup gray
const DEFAULT_BG = 'bg-slate-100 dark:bg-slate-900';

const LANGUAGES = [
  { code: 'EN', label: 'EN', name: 'English', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'ES', label: 'ES', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
  { code: 'FR', label: 'FR', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'DE', label: 'DE', name: 'Deutsch', flag: 'https://flagcdn.com/w40/de.png' },
];

// Curated list of high-quality corporate/clean images
const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1920&q=80", // Office
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80", // Architecture
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80", // Meeting
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80", // Workspace
  "https://images.unsplash.com/photo-1504384308090-c54be3855091?auto=format&fit=crop&w=1920&q=80", // Building
  "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=1920&q=80"  // Modern
];

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState<ViewState>('signin');
  
  // Background State
  const [bgMode, setBgMode] = useState<'solid' | 'image'>('solid');
  const [bgImage, setBgImage] = useState<string>('');
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);
  const bgMenuRef = useRef<HTMLDivElement>(null);

  // Language State
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Handle Theme Toggle
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (bgMenuRef.current && !bgMenuRef.current.contains(event.target as Node)) {
        setIsBgMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const setRandomImage = () => {
    // Pick a random image different from the current one if possible
    let newImg = bgImage;
    const availableImages = BACKGROUND_IMAGES.filter(img => img !== bgImage);
    // If filter leaves us with images, pick from them, otherwise pick from all (shouldn't happen with >1 image)
    const pool = availableImages.length > 0 ? availableImages : BACKGROUND_IMAGES;
    
    newImg = pool[Math.floor(Math.random() * pool.length)];
    
    // Preload
    const img = new Image();
    img.src = newImg;
    img.onload = () => {
        setBgImage(newImg);
        setBgMode('image');
    };
    // Close menu
    setIsBgMenuOpen(false);
  };

  const setSolidBackground = () => {
      setBgMode('solid');
      setIsBgMenuOpen(false);
  };

  const handleLogin = () => {
      setView('dashboard');
  };

  const handleLogout = () => {
      setView('signin');
  };

  // Render Dashboard Fullscreen
  if (view === 'dashboard') {
      return (
          <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
               {/* Pass toggleTheme to dashboard if we wanted a theme toggler there too, but for now just render it. 
                   We could wrap it in a layout that includes the theme toggler, but the dashboard design implies it's self contained.
                   We'll add a floating theme toggle or assume system preference, but for consistency let's keep the global theme state active.
               */}
               <Dashboard onLogout={handleLogout} />
               
               {/* Floating Theme Toggle for Dashboard */}
               <div className="fixed bottom-6 right-6 z-50">
                    <button 
                        onClick={toggleTheme}
                        className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                        title="Toggle Theme"
                    >
                        <span className="material-symbols-outlined">
                            {isDark ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
               </div>
          </div>
      );
  }

  // Render Auth Screens
  return (
    <div 
        className={`min-h-screen flex items-center justify-center p-4 md:p-6 transition-all duration-700 bg-cover bg-center ${bgMode === 'solid' ? DEFAULT_BG : ''}`}
        style={bgMode === 'image' && bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      {/* Overlay to ensure text readability on background if needed */}
      <div className={`absolute inset-0 transition-colors duration-700 pointer-events-none z-0 ${bgMode === 'image' ? 'bg-slate-200/50 dark:bg-black/60 backdrop-blur-[2px]' : 'bg-transparent'}`}></div>

      {/* Main Card - Stretched to fill view with margins */}
      <div className="z-10 w-full max-w-[1600px] h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] min-h-[700px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        
        {/* Left Side (Mesh Gradient) */}
        <MeshSidebar />

        {/* Right Side (Form) */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative bg-white dark:bg-slate-950 transition-colors duration-300 h-full overflow-y-auto">
          
          {/* Top Right Actions */}
          <div className="absolute top-6 right-6 lg:top-8 lg:right-8 flex items-center gap-4 z-20">
            
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
                <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/20 dark:shadow-[0_0_15px_-3px_rgba(255,255,255,0.05)]"
                >
                    <img 
                        src={selectedLang.flag}
                        alt={selectedLang.name} 
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-100 dark:ring-slate-700" 
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedLang.label}</span>
                    <span className={`material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                    </span>
                </button>

                {/* Language Dropdown Menu */}
                {isLangOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down origin-top-right">
                        <div className="py-1">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setSelectedLang(lang);
                                        setIsLangOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                        selectedLang.code === lang.code 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' 
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <img src={lang.flag} alt={lang.name} className="w-5 h-5 rounded-full object-cover shadow-sm" />
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Background Selector */}
            <div className="relative" ref={bgMenuRef}>
                 <button 
                    onClick={() => setIsBgMenuOpen(!isBgMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/20 dark:shadow-[0_0_15px_-3px_rgba(255,255,255,0.05)]"
                    title="Change Background"
                >
                    <span className="material-symbols-outlined text-[20px] text-slate-500 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                        wallpaper
                    </span>
                    <span className={`material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-300 ${isBgMenuOpen ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                    </span>
                </button>

                {/* Background Dropdown Menu */}
                {isBgMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down origin-top-right">
                        <div className="py-1">
                            <button
                                onClick={setSolidBackground}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                    bgMode === 'solid'
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className="w-5 h-5 rounded-md border border-slate-300 bg-slate-100 dark:bg-slate-800 dark:border-slate-600"></div>
                                Solid Gray
                            </button>
                            <button
                                onClick={setRandomImage}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                    bgMode === 'image'
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">shuffle</span>
                                Random Image
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:block">Theme</span>
              <button 
                onClick={toggleTheme}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 dark:bg-purple-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <span className="sr-only">Toggle Dark Mode</span>
                <span className={`${isDark ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center`}>
                  {isDark ? (
                    <span className="material-symbols-outlined text-[16px] text-purple-600 font-bold">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-slate-300">close</span>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Form Content - Centered */}
          <div className="w-full max-w-md mx-auto py-12 md:py-0">
             {view === 'signin' ? (
                <SignIn onSwitchView={setView} onLogin={handleLogin} />
              ) : (
                <SignUp onSwitchView={setView} onLogin={handleLogin} />
              )}
          </div>

        </div>
      </div>
    </div>
  );
}