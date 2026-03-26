import { useEffect, useState } from "react";

interface PageLoaderProps {
  loading: boolean;
  children?: React.ReactNode;
}

export default function PageLoader({ loading, children }: PageLoaderProps) {
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(loading);

  useEffect(() => {
    if (!loading && visible) {
      setExiting(true);
      const t = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(t);
    }
    if (loading) {
      setVisible(true);
      setExiting(false);
    }
  }, [loading, visible]);

  if (!visible && !loading) {
    return <>{children}</>;
  }

  const overlay = (
    <div
      className={`page-loader-overlay page-loader-overlay--centered ${exiting ? "page-loader-exit" : ""}`}
      aria-hidden={!loading}
    >
      <div className="page-loader-spinner">
        <div className="page-loader-ring page-loader-ring-outer" />
        <div className="page-loader-ring page-loader-ring-inner" />
      </div>
      <p className="page-loader-text">Carregando...</p>
    </div>
  );

  return (
    <div className="page-loader-root">
      {overlay}
      {children}
    </div>
  );
}
