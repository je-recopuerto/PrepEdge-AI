import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp"
import SetupForm from "./pages/CreateInterview";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/interview/setup", element: <ProtectedRoute><SetupForm /></ProtectedRoute> },
]);

export default router;