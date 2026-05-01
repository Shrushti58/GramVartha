import { Navigate } from "react-router-dom";
import GramVarthaLandingPage from "../pages/GramVarthaLandingPage";
import AdminDash from "../pages/AdminDash";
import AdminRegister from "../components/AdminRegister";
import AdminLogin from "../components/AdminLogin";
import OfficialLogin from "../components/OfficialLogin";
import OfficialRegister from "../components/OfficialRegister";
import OfficialProfile from "../components/OfficialProfile";
import OfficialsDashboard from "../pages/OfficialsDash";
import NoticeDetails from "../components/NoticesDetails";
import SuperadminDash from "../pages/SuperadminDash";
import VillageAdminDash from "../pages/VillageAdminDash";
import VillageRegistration from "../pages/VillageRegistration";
import QRScanner from "../components/QRScanner";
import QRNotices from "../pages/QRNotices";
import VillageAdminNotices from "../pages/VillageAdminNotices";

export const appRoutes = [
  { path: "/", element: <GramVarthaLandingPage /> },
  { path: "/admin/dashboard", element: <AdminDash /> },
  { path: "/admin/superadmin", element: <SuperadminDash /> },
  { path: "/admin/village", element: <VillageAdminDash /> },
  { path: "/admin/village/notices", element: <VillageAdminNotices /> },
  { path: "/admin/register", element: <AdminRegister /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/village/register", element: <VillageRegistration /> },
  { path: "/officials/login", element: <OfficialLogin /> },
  { path: "/officials/register", element: <OfficialRegister /> },
  { path: "/officials/profile", element: <OfficialProfile /> },
  { path: "/officials/dashboard", element: <OfficialsDashboard /> },
  { path: "/notice-details/:id", element: <NoticeDetails /> },
  { path: "/notice/:id", element: <NoticeDetails /> },
  { path: "/qr-scanner", element: <QRScanner /> },
  { path: "/qr-notices/:villageId", element: <QRNotices /> },
  { path: "*", element: <Navigate to="/" replace /> },
];
