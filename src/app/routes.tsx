import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Splash } from "./components/Splash";
import { Onboarding } from "./components/Onboarding";
import { Login } from "./components/Login";
import { ResetPassword } from "./components/ResetPassword";
import { Home } from "./components/Home";
import { FirstAidTools } from "./components/FirstAidTools";
import { ToolDetail } from "./components/ToolDetail";
import { TreatmentGuides } from "./components/TreatmentGuides";
import { TreatmentDetail } from "./components/TreatmentDetail";
import { Emergency } from "./components/Emergency";
import { NearbyHospitals } from "./components/NearbyHospitals";
import { AdminModeration } from "./components/AdminModeration";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./auth/AdminRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Splash />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/emergency",
    element: <Emergency />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "first-aid-tools",
            element: <FirstAidTools />,
          },
          {
            path: "first-aid-tools/:toolId",
            element: <ToolDetail />,
          },
          {
            path: "treatment-guides",
            element: <TreatmentGuides />,
          },
          {
            path: "treatment-guides/:guideId",
            element: <TreatmentDetail />,
          },
          {
            path: "emergency",
            element: <Emergency />,
          },
          {
            path: "nearby-hospitals",
            element: <NearbyHospitals />,
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: "admin",
                element: <AdminModeration />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
