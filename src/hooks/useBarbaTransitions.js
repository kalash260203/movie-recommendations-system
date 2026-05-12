import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initBarba, updateBarbaNamespace } from '../utils/barba-transitions';

/**
 * Custom hook to handle Barba.js transitions in React
 * This hook initializes Barba.js and updates the namespace when the location changes
 */
const useBarbaTransitions = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Initialize Barba.js on first render
    initBarba();
    
    // Update the namespace when the location changes
    updateBarbaNamespace(location.pathname);
    
    // Clean up function
    return () => {
      // Any cleanup needed for Barba.js
      // Currently, Barba doesn't have a built-in destroy method
    };
  }, [location.pathname]);
};

export default useBarbaTransitions;
