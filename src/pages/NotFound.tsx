import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </a>
      </div>
      
      {/* FOOTER */}
      <div className="absolute bottom-0 left-0 right-0 py-6">
        <p className="text-center text-gray-500 text-sm font-outfit">
          Todos os direitos reservados por <span className="font-semibold">Blue Ocean®️</span>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
