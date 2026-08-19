import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import FocusLayout from "../../layouts/FocusLayout";
import DashboardLayout from "../../layouts/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import { ROLES } from "../../shared/constants/roles";

import HomePage from "../../features/institutional/pages/HomePage";

const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../../features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../../features/auth/pages/ForgotPasswordPage"));
const PrivacyPolicyPage = lazy(() => import("../../features/legal/pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("../../features/legal/pages/TermsOfServicePage"));
const BookingPage = lazy(() => import("../../features/booking/pages/BookingPage"));

const DashboardPage = lazy(() => import("../../features/dashboard/pages/DashboardPage"));
const AppointmentsPage = lazy(() => import("../../features/appointments/pages/AppointmentsPage"));
const AppointmentDetailPage = lazy(() => import("../../features/appointments/pages/AppointmentDetailPage"));
const NewAppointmentPage = lazy(() => import("../../features/appointments/pages/NewAppointmentPage"));
const RescheduleAppointmentPage = lazy(() => import("../../features/appointments/pages/RescheduleAppointmentPage"));
const ServiceHistoryPage = lazy(() => import("../../features/serviceHistory/pages/ServiceHistoryPage"));
const NotificationsPage = lazy(() => import("../../features/notifications/pages/NotificationsPage"));
const ProfilePage = lazy(() => import("../../features/profile/pages/ProfilePage"));
const PersonalInfoPage = lazy(() => import("../../features/profile/pages/PersonalInfoPage"));
const PreferencesPage = lazy(() => import("../../features/profile/pages/PreferencesPage"));
const ChangePasswordPage = lazy(() => import("../../features/profile/pages/ChangePasswordPage"));
const PhonePage = lazy(() => import("../../features/profile/pages/PhonePage"));
const DeleteAccountPage = lazy(() => import("../../features/profile/pages/DeleteAccountPage"));
const SettingsPage = lazy(() => import("../../features/settings/pages/SettingsPage"));

const ClientsPage = lazy(() => import("../../features/clients/pages/ClientsPage"));
const EmployeesPage = lazy(() => import("../../features/employees/pages/EmployeesPage"));

const AdminDashboardPage = lazy(() => import("../../features/admin/pages/AdminDashboardPage"));
const AdminAppointmentsPage = lazy(() => import("../../features/admin/pages/AdminAppointmentsPage"));
const AdminServicesPage = lazy(() => import("../../features/admin/pages/AdminServicesPage"));
const AdminSettingsPage = lazy(() => import("../../features/admin/pages/AdminSettingsPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/agendar" element={<BookingPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        </Route>

        <Route element={<FocusLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={[ROLES.CLIENT, ROLES.OWNER, ROLES.ADMIN]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
            <Route path="/service-history" element={<ServiceHistoryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/personal-info" element={<PersonalInfoPage />} />
            <Route path="/profile/preferences" element={<PreferencesPage />} />
            <Route path="/profile/change-password" element={<ChangePasswordPage />} />
            <Route path="/profile/phone" element={<PhonePage />} />
            <Route path="/profile/delete-account" element={<DeleteAccountPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<FocusLayout />}>
            <Route path="/appointments/new" element={<NewAppointmentPage />} />
            <Route path="/appointments/:id/reschedule" element={<RescheduleAppointmentPage />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={[ROLES.OWNER, ROLES.ADMIN]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route path="/admin/employees" element={<EmployeesPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/clients" element={<ClientsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
