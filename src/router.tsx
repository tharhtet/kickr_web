import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import NotFoundPage from '@/pages/NotFoundPage';
import PrivacyPage from '@/pages/PrivacyPage';
import { HomePage } from '@/features/home';
import { ProfilePage } from '@/features/profile';

export const router = createBrowserRouter([
  // Marketing home — standalone chrome, no AppLayout.
  { path: '/', element: <HomePage /> },

  // In-app screens — share the AppLayout header.
  {
    element: <AppLayout />,
    children: [
      { path: 'profile', element: <ProfilePage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      // Another user's public profile — GET /users/:id/profile.
      // { path: 'u/:userId', element: <PublicProfilePage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
