import React, { Suspense } from "react";
import "./index.css";
import GramVarthaLandingPage from "./pages/GramVarthaLandingPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDash from "./pages/AdminDash";
import AdminRegister from "./components/AdminRegister";
import AdminLogin from "./components/AdminLogin";

export default function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<GramVarthaLandingPage />}></Route>
          <Route path="/admin" element={<AdminDash />}></Route>
          <Route path="/admin/register" element={<AdminRegister/>} ></Route>
          <Route path="/admin/login" element={<AdminLogin/>} ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
