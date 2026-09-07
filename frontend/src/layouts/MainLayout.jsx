import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserTour from '../components/UserTour';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {children}
      </main>
      <Footer />
      <UserTour />
    </div>
  );
};

export default MainLayout;
