import { createBrowserRouter } from 'react-router-dom';
import WebsiteLayout from '@/layouts/WebsiteLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Website
import HomePage from '@/pages/website/HomePage';
import PrivacyPage from '@/pages/website/PrivacyPage';
import NotFoundPage from '@/pages/website/NotFoundPage';

// Auth
import LoginPage from '@/pages/auth/LoginPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';
import TournamentsPage from '@/pages/dashboard/TournamentsPage';
import GroupsPage from '@/pages/dashboard/GroupsPage';
import SportTypesPage from '@/pages/dashboard/SportTypesPage';
import RegionsPage from '@/pages/dashboard/RegionsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';

export const router = createBrowserRouter([
  // Marketing home — standalone chrome, no WebsiteLayout.
  { path: '/', element: <HomePage /> },
  // Standalone chrome, no WebsiteLayout — matches HomePage.
  { path: 'login', element: <LoginPage /> },

  // Public website screens — share the WebsiteLayout header.
  {
    element: <WebsiteLayout />,
    children: [
      { path: 'privacy', element: <PrivacyPage /> },
      // Another user's public profile — GET /users/:id/profile.
      // { path: 'u/:userId', element: <PublicProfilePage /> },
    ],
  },

  // Dashboard screens — sidebar + topbar, gated on an access token.
  {
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'tournaments', element: <TournamentsPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'sport-types', element: <SportTypesPage /> },
      { path: 'regions', element: <RegionsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
