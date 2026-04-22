import { Routes, Route } from 'react-router-dom';
import { Page } from '@strapi/strapi/admin';
import { HomePage } from './HomePage';
import VerifyPage from './VerifyPage';

export const App = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="verify" element={<VerifyPage />} />
      <Route path="*" element={<Page.Error />} />
    </Routes>
  );
};
