import React, { Suspense } from "react";
import "./index.css";
import GramVarthaLandingPage from "./pages/GramVarthaLandingPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDash from "./pages/AdminDash";
import AdminRegister from "./components/AdminRegister";
import AdminLogin from "./components/AdminLogin";
import OfficialLogin from "./components/OfficialLogin";
import OfficialRegister from "./components/OfficialRegister";
import OfficialsDashboard from "./pages/OfficialsDash";
import Notices from "./components/Notices";
import NoticeDetails from "./components/NoticesDetails";
import CitizenLogin from './components/CitizenLogin';
import CitizenRegister from './components/CitizenRegister'
import CitizenDashboard from "./components/CitizenDashboard";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <>
      
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<GramVarthaLandingPage />}></Route>
          <Route path='/citizen/login' element={<CitizenLogin/>}></Route> 
          <Route path="/citizen/register" element={<CitizenRegister/>} />
          <Route path="/admin/dashboard" element={<AdminDash />}></Route>
          <Route path="/admin/register" element={<AdminRegister/>} ></Route>
          <Route path="/admin/login" element={<AdminLogin/>} ></Route>
          <Route path="/officials/login" element={<OfficialLogin/>} ></Route>
          <Route path="/officials/register" element={<OfficialRegister/>} ></Route>
          <Route path="/officials/dashboard" element={<OfficialsDashboard/>} ></Route>
          <Route path='/notices' element={<Notices/>} ></Route>
          <Route path="/notice-details/:id" element={<NoticeDetails/>} ></Route>
          <Route path="/profile" element={<CitizenDashboard/>} />
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
        />
      </BrowserRouter>
    </>
  );
}
