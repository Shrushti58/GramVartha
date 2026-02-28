import React from "react";
import "./index.css";
import { HashRouter } from "react-router-dom";
import GramVarthaLandingPage from "./pages/GramVarthaLandingPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDash from "./pages/AdminDash";
import AdminRegister from "./components/AdminRegister";
import AdminLogin from "./components/AdminLogin";
import OfficialLogin from "./components/OfficialLogin";
import OfficialRegister from "./components/OfficialRegister";
import OfficialProfile from "./components/OfficialProfile";
import OfficialsDashboard from "./pages/OfficialsDash";
import NoticeDetails from "./components/NoticesDetails";
import SuperadminDash from "./pages/SuperadminDash";
import VillageAdminDash from "./pages/VillageAdminDash";
import VillageRegistration from "./pages/VillageRegistration";
import QRScanner from "./components/QRScanner";
import QRNotices from "./pages/QRNotices";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<GramVarthaLandingPage />} />
          <Route path="/admin/dashboard" element={<AdminDash />} />
          <Route path="/admin/superadmin" element={<SuperadminDash />} />
          <Route path="/admin/village" element={<VillageAdminDash />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/village/register" element={<VillageRegistration />} />
          <Route path="/officials/login" element={<OfficialLogin />} />
          <Route path="/officials/register" element={<OfficialRegister />} />
          <Route path="/officials/profile" element={<OfficialProfile />} />
          <Route path="/officials/dashboard" element={<OfficialsDashboard />} />
          <Route path="/notice-details/:id" element={<NoticeDetails />} />
          <Route path="/notice/:id" element={<NoticeDetails />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/qr-notices/:villageId" element={<QRNotices />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="font-sans"
          progressClassName="toastProgress"
        />
      </BrowserRouter>
    </>
  );
}