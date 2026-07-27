"use client";

import { createContext, useContext, useEffect, useState } from "react";

type HeaderMode = {
  /** true quando há um hero de imagem no topo (menu deve ficar transparente). */
  transparent: boolean;
  setTransparent: (value: boolean) => void;
};

const HeaderModeContext = createContext<HeaderMode>({
  transparent: false,
  setTransparent: () => {},
});

export function useHeaderMode() {
  return useContext(HeaderModeContext);
}

export function HeaderModeProvider({ children }: { children: React.ReactNode }) {
  const [transparent, setTransparent] = useState(false);
  return (
    <HeaderModeContext.Provider value={{ transparent, setTransparent }}>
      {children}
    </HeaderModeContext.Provider>
  );
}

/**
 * Renderizado por uma página que tem um hero de imagem no topo: ativa o
 * modo transparente do header enquanto estiver montado.
 */
export function TransparentHeaderTrigger() {
  const { setTransparent } = useHeaderMode();
  useEffect(() => {
    setTransparent(true);
    return () => setTransparent(false);
  }, [setTransparent]);
  return null;
}
