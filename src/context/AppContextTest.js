import React from 'react';
import { useAppContext } from './AppContext';

// A simple component to test if the AppContext is working
const AppContextTest = () => {
  const context = useAppContext();
  
  console.log('AppContext test component:', context);
  
  return (
    <div>
      <h2>AppContext Test</h2>
      <p>Is context available: {context ? 'Yes' : 'No'}</p>
      <p>Is authenticated: {context?.isAuthenticated ? 'Yes' : 'No'}</p>
      <p>Trailer modal open: {context?.trailerModalOpen ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default AppContextTest;
