import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AuthProvider>
          <BrowserRouter>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </BrowserRouter>
        </AuthProvider>
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
