import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';


const Header = () => {

    const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();

 useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNavOpen && !event.target.closest('nav')) {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNavOpen]);

  const toggleNav = (e) => {
    e.stopPropagation();
    setIsNavOpen(!isNavOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const baseClass = "transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium";
    const activeClass = "text-blue-600 bg-blue-50";
    const inactiveClass = "text-gray-700 hover:text-blue-600 hover:bg-gray-50";
    
    return `${baseClass} ${isActiveRoute(path) ? activeClass : inactiveClass}`;
  };

  const mobileNavLinkClass = (path) => {
    const baseClass = "transition-colors duration-200 block px-3 py-2 rounded-md text-base font-medium";
    const activeClass = "text-blue-600 bg-blue-50";
    const inactiveClass = "text-gray-700 hover:text-blue-600 hover:bg-gray-50";
    
    return `${baseClass} ${isActiveRoute(path) ? activeClass : inactiveClass}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <span className="hidden sm:block">SignalRTest</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              <Link to="/" className={navLinkClass('/')}>
                Home
              </Link>
              <Link to="/test-panel" className={navLinkClass('/test-panel')}>
                Test Panel
              </Link>
              <Link to="/login" className={navLinkClass('/login')}>
                Login
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            onClick={toggleNav}
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation menu"
          >
            <svg 
              className={`h-6 w-6 transition-transform duration-200 ${isNavOpen ? 'rotate-90' : ''}`} 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              {isNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isNavOpen 
            ? 'max-h-64 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <Link to="/" className={mobileNavLinkClass('/')}>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </div>
            </Link>
            <Link to="/test-panel" className={mobileNavLinkClass('/test-panel')}>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Test Panel
              </div>
            </Link>
            <Link to="/login" className={mobileNavLinkClass('/login')}>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;