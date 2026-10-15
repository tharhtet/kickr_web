import { createBrowserRouter } from 'react-router-dom';
import WebsiteLayout from '@/layouts/WebsiteLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Website
import HomePage from '@/pages/website/HomePage';
import PrivacyPage from '@/pages/website/PrivacyPage';
import NotFoundPage from '@/pages/website/NotFoundPage';
import EventDetailPage from '@/pages/website/EventDetailPage';
import GroupDetailPage from '@/pages/website/GroupDetailPage';

// Auth
import LoginPage from '@/pages/auth/LoginPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';
import TournamentsPage from '@/pages/dashboard/TournamentsPage';
import GroupsPage from '@/pages/dashboard/GroupsPage';
import SportTypesPage from '@/pages/dashboard/SportTypesPage';
import CountriesPage from '@/pages/dashboard/CountriesPage';
import AppConfigPage from '@/pages/dashboard/AppConfigPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';

export const router = createBrowserRouter([
  // Marketing home — standalone chrome, no WebsiteLayout.
  { path: '/', element: <HomePage /> },
  // Shared event links (kickrsport.com/event/:eventId) — public event detail.
  { path: 'event/:eventId', element: <EventDetailPage /> },
  // Shared group links (kickrsport.com/group/:groupId) — public group detail.
  { path: 'group/:groupId', element: <GroupDetailPage /> },
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
      { path: 'countries', element: <CountriesPage /> },
      { path: 'app-config', element: <AppConfigPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
