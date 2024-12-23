import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CategoryStep } from '../components/ItemSelection';
import ItemListPage from '../components/ItemSelection/ItemListPage';
import ItemDetailPage from '../components/ItemSelection/ItemDetailPage';
import { ItemSelectionProvider } from '../contexts/ItemSelectionContext';

const OrderRoutes: React.FC = () => {
  return (
    <ItemSelectionProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/categories" replace />} />
        <Route path="/categories" element={<CategoryStep />} />
        <Route path="/categories/:categoryId/items" element={<ItemListPage />} />
        <Route path="/categories/:categoryId/items/:itemId" element={<ItemDetailPage />} />
      </Routes>
    </ItemSelectionProvider>
  );
};

export default OrderRoutes;
