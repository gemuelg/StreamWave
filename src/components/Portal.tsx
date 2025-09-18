// src/components/Portal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.getElementById('portal-root');
    if (root) {
      setElement(root);
      setMounted(true);
    }
    return () => setMounted(false);
  }, []);

  if (!mounted || !element) {
    return null;
  }

  return createPortal(children, element);
};

export default Portal;