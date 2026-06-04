import React, { createContext, useContext, useState } from 'react';

const SubscribeContext = createContext();

export const useSubscribe = () => {
  const context = useContext(SubscribeContext);
  if (!context) {
    throw new Error('useSubscribe must be used within a SubscribeProvider');
  }
  return context;
};

export const SubscribeProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openSubscribeModal = () => setIsModalOpen(true);
  const closeSubscribeModal = () => setIsModalOpen(false);

  return (
    <SubscribeContext.Provider value={{ isModalOpen, openSubscribeModal, closeSubscribeModal }}>
      {children}
    </SubscribeContext.Provider>
  );
};
