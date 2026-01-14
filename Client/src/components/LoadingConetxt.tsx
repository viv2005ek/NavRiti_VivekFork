/* eslint-disable react-refresh/only-export-components */
import  { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";

interface LoadingContextType {
  setProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);


export function LoadingProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const location = useLocation();


  useEffect(() => {
    const startTimer = setTimeout(() => setProgress(40), 0);
    const endTimer = setTimeout(() => setProgress(100), 500);
    
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [location.pathname]);

  return (
    <LoadingContext.Provider value={{ setProgress }}>
      <LoadingBar
        color="#6366f1"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
        height={3}
        shadow={true}
      />
      {children}
    </LoadingContext.Provider>
  );
}


export function useTopBar(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useTopBar must be used within a LoadingProvider");
  }
  return context;
}