import React, { createContext, useContext, useState } from 'react';

interface OrderContextType {
  tempOrderData: any | null;
  setTempOrderData: (data: any) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tempOrderData, setTempOrderData] = useState<any | null>(null);

  return (
    <OrderContext.Provider value={{ tempOrderData, setTempOrderData }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
}; 