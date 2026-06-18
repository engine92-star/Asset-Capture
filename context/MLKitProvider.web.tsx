import React, { createContext, useContext } from 'react';

interface MLKitContextValue {
  detector?: undefined;
  isReady: boolean;
}

const MLKitContext = createContext<MLKitContextValue>({
  isReady: false,
});

export function MLKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <MLKitContext.Provider value={{ isReady: false }}>{children}</MLKitContext.Provider>
  );
}

export function useMLKit() {
  return useContext(MLKitContext);
}