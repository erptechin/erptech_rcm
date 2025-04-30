// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            },
            {
              path: "charge-entry",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/charge-entry"))
                  .default,
              }),
            },
            {
              path: "charge-entry/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/charge-entry/form"))
                  .default,
              }),
            },
            {
              path: "charge-entry/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/charge-entry/form"))
                  .default,
              }),
            },
          ],
        },
        {
          path: "sales",
          children: [
            {
              index: true,
              element: <Navigate to="/sales/sales-order" />,
            },
            {
              path: "sales-order",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-order"))
                  .default,
              }),
            },
            {
              path: "sales-order/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-order/form"))
                  .default,
              }),
            },
            {
              path: "sales-order/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-order/form"))
                  .default,
              }),
            },

          ]
        },
        {
          path: "case-master",
          children: [
            {
              index: true,
              element: <Navigate to="/case-master/agency" />,
            },
            {
              path: "agency",
              lazy: async () => ({
                Component: (await import("app/pages/case-master/agency"))
                  .default,
              }),
            },
            {
              path: "agency/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/case-master/agency/form"))
                  .default,
              }),
            },
            {
              path: "agency/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/case-master/agency/form"))
                  .default,
              }),
            },
          ]
        },
      ]
    },
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
            {
              path: "sessions",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Sessions")
                ).default,
              }),
            }
          ],
        },
      ],
    },
  ]
};

export { protectedRoutes };
