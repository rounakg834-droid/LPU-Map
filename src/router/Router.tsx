import React, { useState, useEffect, createContext, useContext } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {}
});

export const useRouter = () => useContext(RouterContext);

interface RouterProps {
  children: (route: { path: string; navigate: (path: string) => void }) => React.ReactNode;
}

const normalizePath = (pathname: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  if (base !== '/' && pathname.startsWith(base)) {
    const stripped = pathname.slice(base.length - 1);
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }
  return pathname;
};

export const Router: React.FC<RouterProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return normalizePath(window.location.pathname || '/');
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname || '/'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      const base = import.meta.env.BASE_URL || '/';
      const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
      const targetUrl = path === '/' ? `${cleanBase}/` : `${cleanBase}${path.startsWith('/') ? path : `/${path}`}`;
      window.history.pushState(null, '', targetUrl);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children({ path: currentPath, navigate })}
    </RouterContext.Provider>
  );
};
