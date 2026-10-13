import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import NotificationBell from './NotificationBell';
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  Camera,
  Award,
  BarChart3,
  HardDriveDownload,
  Users,
  LogOut,
  LogIn,
  Globe,
  Wifi,
  WifiOff,
  Menu,
  X,
  CalendarCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isOnline, syncStatus, triggerOfflineSync } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const hasDragged = useRef(false);

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollNav = (direction) => {
    if (navRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      navRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 280);
    }
  };

  const handleWheel = (e) => {
    if (navRef.current && e.deltaY !== 0) {
      navRef.current.scrollLeft += e.deltaY * 0.9;
      checkScroll();
    }
  };

  // Mouse Drag-To-Scroll handlers
  const handleMouseDown = (e) => {
    if (!navRef.current) return;
    setIsDragging(true);
    hasDragged.current = false;
    setStartX(e.pageX - navRef.current.offsetLeft);
    setScrollLeftPos(navRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !navRef.current) return;
    e.preventDefault();
    hasDragged.current = true;
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    navRef.current.scrollLeft = scrollLeftPos - walk;
    checkScroll();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = (e, link) => {
    if (hasDragged.current) {
      e.preventDefault();
      return;
    }
    setMobileMenuOpen(false);

    if (link.path.startsWith('/#')) {
      e.preventDefault();
      const targetId = link.path.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', `/#${targetId}`);
        }
      } else {
        navigate(`/#${targetId}`);
      }
    } else if (link.path === '/') {
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
      } else {
        navigate('/');
      }
    }
  };

  const navLinks = user
    ? [
        { name: t('nav.dashboard'), path: '/dashboard', icon: BookOpen },
        { name: t('nav.aiTutor'), path: '/tutor', icon: BrainCircuit, badge: 'Agent' },
        { name: t('nav.scanner'), path: '/scanner', icon: Camera, badge: 'Vision', badgeColor: 'teal' },
        { name: t('nav.subjects'), path: '/subjects', icon: BookOpen },
        { name: t('nav.quizzes'), path: '/quizzes', icon: Award },
        { name: t('nav.progress'), path: '/progress', icon: BarChart3 },
        { name: t('nav.studyPlanner'), path: '/study-planner', icon: CalendarCheck },
        { name: t('nav.offlineLessons'), path: '/offline-vault', icon: HardDriveDownload, count: syncStatus.pendingCount },
        { name: t('nav.parentSummary'), path: '/parent-report', icon: Users },
      ]
    : [
        { name: t('nav.home'), path: '/', icon: BookOpen },
        { name: t('nav.features'), path: '/#features' },
        { name: t('nav.howItWorks'), path: '/#how-it-works' },
        { name: t('nav.offlineLessons'), path: '/offline-vault', icon: HardDriveDownload },
        { name: t('nav.about'), path: '/#about' },
      ];

  const isActive = (path) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.replace('/', '');
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 shadow-sm transition-all duration-300">
      <div className="w-full max-w-[1750px] mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-20 sm:h-22 gap-2 sm:gap-3">
          
          {/* Logo Section - Fully responsive on mobile (360px+) and desktop */}
          <div className="shrink-0 flex items-center pr-2 sm:pr-4 border-r border-slate-200/80">
            <Link
              to={user ? "/dashboard" : "/"}
              className="flex items-center gap-2 sm:gap-3 group py-1 cursor-pointer"
              title="Vidyora AI — Learn in Your Language"
            >
              {/* Responsive Logo Container */}
              <div className="relative rounded-2xl bg-brand-navy p-1 shadow-md shadow-brand-teal/20 border-2 border-brand-teal/40 group-hover:scale-105 group-hover:border-brand-teal transition-all duration-300 flex items-center justify-center overflow-hidden shrink-0 h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16">
                <img
                  src="/logo.png"
                  alt="VIDYORA-AI"
                  className="h-full w-full object-contain rounded-xl drop-shadow-sm"
                />
              </div>

              {/* Bold Title & Badge */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1">
                  <span className="font-black text-base sm:text-xl md:text-2xl tracking-tight text-brand-navy group-hover:text-brand-teal transition-colors leading-none">
                    Vidyora<span className="text-brand-teal">.ai</span>
                  </span>
                  <span className="hidden xs:inline-block sm:inline-block text-[8px] sm:text-[9px] uppercase font-black tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                    NEXTECH 2.0
                  </span>
                </div>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-500 mt-0.5 sm:mt-1 leading-none">
                  {lang === 'or' ? 'ଓଡ଼ିଆ ଏଆଇ ଶିକ୍ଷଣ' : 'Agentic AI Platform'}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Channel - Scrollable & Isolated with Chevrons and Visible Scroller */}
          <div className="hidden lg:flex items-center flex-1 min-w-0 relative px-1 sm:px-2">
            
            {/* Left scroll chevron button */}
            {canScrollLeft && (
              <button
                onClick={() => scrollNav('left')}
                aria-label="Scroll navigation left"
                className="absolute left-0 z-20 p-2 rounded-full bg-white/95 text-brand-navy shadow-lg border border-slate-200 hover:bg-brand-teal hover:text-white transition-all cursor-pointer -translate-x-1"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Scrollable Nav Items with Visible Custom Horizontal Scroller and Drag-to-Scroll */}
            <nav
              ref={navRef}
              onScroll={checkScroll}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex items-center justify-start gap-1 xl:gap-1.5 nav-horizontal-scroller scroll-smooth w-full py-1.5 px-2 select-none cursor-grab active:cursor-grabbing pb-2.5"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link)}
                    title={link.name}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                      isActive(link.path)
                        ? 'bg-brand-navy text-white shadow-md ring-1 ring-brand-teal/40'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-brand-navy'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 text-brand-teal shrink-0" />}
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className={`text-[8px] xl:text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-tight ${
                        link.badgeColor === 'amber'
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          : 'bg-brand-teal/20 text-brand-teal'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                    {link.count > 0 && (
                      <span className="text-[9px] xl:text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                        {link.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right scroll chevron button */}
            {canScrollRight && (
              <button
                onClick={() => scrollNav('right')}
                aria-label="Scroll navigation right"
                className="absolute right-0 z-20 p-2 rounded-full bg-white/95 text-brand-navy shadow-lg border border-slate-200 hover:bg-brand-teal hover:text-white transition-all cursor-pointer translate-x-1"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Actions & Utilities - Isolated with pl-3 border-l so it NEVER overlaps with nav */}
          <div className="shrink-0 flex items-center pl-3 border-l border-slate-200/80 gap-1.5 sm:gap-2">
            
            {/* Notification Bell Dropdown - ONLY shown when signed in */}
            {user && <NotificationBell />}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-brand-navy shadow-2xs flex items-center gap-1.5 transition-all hover:border-brand-teal/50 cursor-pointer"
              title="Switch language between English & Odia"
            >
              <Globe className="w-3.5 h-3.5 text-brand-teal shrink-0" />
              <span>{lang === 'en' ? 'ଓଡ଼ିଆ' : 'English'}</span>
            </button>

            {/* Online / Offline Status Badge */}
            <div
              className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80 animate-pulse'
              }`}
              title={isOnline ? 'Online - Cloud AI Connected' : 'Offline - Running via IndexedDB Vault'}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
              <span className="hidden xl:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-brand-navy text-xs font-bold transition-colors"
                  title={`Profile: ${user.name}`}
                >
                  <div className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    {user.name?.charAt(0) || 'S'}
                  </div>
                  <span className="hidden xl:inline max-w-[85px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                  title="Sign Out of Vidyora AI"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{lang === 'or' ? 'ଲଗ୍-ଆଉଟ୍' : 'Log Out'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-brand-navy hover:bg-slate-100 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-brand-navy text-white hover:bg-brand-navyLight shadow-sm btn-3d transition-transform"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-brand-navy hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
                  isActive(link.path)
                    ? 'bg-brand-navy text-white'
                    : 'text-brand-body hover:bg-slate-100'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-brand-teal" />}
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-teal/20 text-brand-teal ml-auto">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          {user && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-sm font-bold border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'or' ? 'ଲଗ୍-ଆଉଟ୍ (Log Out)' : 'Log Out'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
