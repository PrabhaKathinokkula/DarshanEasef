import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Temples from "./pages/Temples";
import TempleDetails from "./pages/TempleDetails";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import Ticket from "./pages/Ticket";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import MyTemple from "./pages/organizer/MyTemple";
import UpdateTemple from "./pages/organizer/UpdateTemple";
import MyDarshans from "./pages/organizer/MyDarshans";
import CreateDarshan from "./pages/organizer/CreateDarshan";
import UpdateDarshan from "./pages/organizer/UpdateDarshan";
import OrganizerBookings from "./pages/organizer/OrganizerBookings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrganizers from "./pages/admin/AdminOrganizers";
import AdminTemples from "./pages/admin/AdminTemples";
import AdminDarshans from "./pages/admin/AdminDarshans";
import AdminBookings from "./pages/admin/AdminBookings";

function App() {
  return (
    <MainLayout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/temples" element={<Temples />} />
        <Route path="/temples/:id" element={<TempleDetails />} />

        {/* User */}
        <Route
          path="/booking/:slotId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-confirmation/:bookingId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/:bookingId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Ticket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback/:templeId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Feedback />
            </ProtectedRoute>
          }
        />

        {/* Organizer */}
        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/temple"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <MyTemple />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/temple/update"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <UpdateTemple />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/darshans"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <MyDarshans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/darshan/create"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <CreateDarshan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/darshan/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <UpdateDarshan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/bookings"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerBookings />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/organizers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrganizers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/temples"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTemples />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/darshans"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDarshans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
