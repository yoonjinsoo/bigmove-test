import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CategoryStep, ItemDetailStep } from '../components/ItemSelection';
import ItemListPage from '../pages/ItemListPage';
import { ItemSelectionProvider } from '../contexts/ItemSelectionContext';

const OrderRoutes: React.FC = () => {
  return (
    <ItemSelectionProvider>
      <Routes>
        <Route path="/" element={<Navigate to="category" replace />} />
        <Route path="category" element={<CategoryStep />} />
        <Route path="category/:categoryId" element={<ItemListPage />} />
        <Route path="details/:categoryId/:itemId" element={<ItemDetailStep />} />
      </Routes>
    </ItemSelectionProvider>
  );
};

export default OrderRoutes;
