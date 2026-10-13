import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserTour from '../components/UserTour';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return <div className="h-screen w-full">{children}</div>;
  }
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDE7]">
      {/* Navbar gets safe-area-inset-top via padding-top on the header itself */}
      <Navbar />
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 safe-bottom">
        {children}
      </main>
      <Footer />
      <UserTour />
    </div>
  );
};

export default MainLayout;
