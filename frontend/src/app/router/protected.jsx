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
          path: "transactions",
          children: [
            {
              index: true,
              element: <Navigate to="/transactions/charge-entry" />,
            },
            {
              path: "charge-entry",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/charge-entry"))
                  .default,
              }),
            },
            {
              path: "charge-entry/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/charge-entry/form"))
                  .default,
              }),
            },
            {
              path: "charge-entry/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/charge-entry/form"))
                  .default,
              }),
            },
            {
              path: "case",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/case"))
                  .default,
              }),
            },
            {
              path: "case/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/case/form"))
                  .default,
              }),
            },
            {
              path: "case/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/case/form"))
                  .default,
              }),
            },
            {
              path: "payment-details",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/payment-details"))
                  .default,
              }),
            },
            {
              path: "payment-details/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/payment-details/form"))
                  .default,
              }),
            },
            {
              path: "payment-details/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/transactions/payment-details/form"))
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
