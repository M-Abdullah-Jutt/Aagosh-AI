import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appName] = useState('Aaghosh');
  const [tagline] = useState('AI-Powered Personalized Parenting Companion');

  return (
    <AppContext.Provider value={{ appName, tagline }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
