import { Route, Routes } from "react-router-dom";
import { appRoutes } from "./routeConfig";

export default function AppRoutes() {
  return (
    <Routes>
      {appRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}
