import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppToastContainer from "./components/AppToastContainer";
import AppRoutes from "./routes/AppRoutes";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <BrowserRouter basename="/">
      <AppRoutes />
      <AppToastContainer />
    </BrowserRouter>
  );
}
