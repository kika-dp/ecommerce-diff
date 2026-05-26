import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  PUBLIC_AUTH_ROUTES,
  USER_PUBLIC_ROUTES,
  USER_PRIVATE_ROUTES,
  ADMIN_ROUTES,
} from './routes.config';
import { ROUTES } from './routesConstants';
import PageLoader from '@components/loader/PageLoader';
import RedirectToHome from '@components/RedirectToHome';
import RedirectToLogin from '@components/RedirectToLogin';
import { AdminLayout, UserLayout } from '@layout/index';
import ErrorBoundary from '@layout/ErrorBoundary';

const AppRoutes = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {PUBLIC_AUTH_ROUTES.map(({ path, element: Element, guestOnly }) => (
            <Route
              key={path}
              path={path}
              element={
                guestOnly ? (
                  <RedirectToHome>
                    <Element />
                  </RedirectToHome>
                ) : (
                  <Element />
                )
              }
            />
          ))}

          <Route element={<UserLayout />}>
            {USER_PUBLIC_ROUTES.map(({ path, element: Element }) => (
              <Route key={path} path={path} element={<Element />} />
            ))}
            {USER_PRIVATE_ROUTES.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <RedirectToLogin>
                    <Element />
                  </RedirectToLogin>
                }
              />
            ))}
          </Route>

          <Route
            path="/admin"
            element={
              <RedirectToLogin requireAdmin>
                <AdminLayout />
              </RedirectToLogin>
            }
          >
            {ADMIN_ROUTES.map(({ path, element: Element, index }) => (
              <Route
                key={path}
                index={index}
                path={index ? undefined : path.replace('/admin/', '').replace('/admin', '')}
                element={<Element />}
              />
            ))}
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.USER.HOME} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </BrowserRouter>
);

export default AppRoutes;
