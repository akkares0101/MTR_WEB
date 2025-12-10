import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage'; // หน้า Login ใหม่
import UserFlow from './pages/UserFlow';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าแรกคือ Login/Register */}
        <Route path="/" element={<AuthPage />} />

        {/* เส้นทางสำหรับ User ทั่วไป (ต้องล็อกอิน) */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <UserFlow />
            </ProtectedRoute>
          } 
        />

        {/* เส้นทางสำหรับ Admin (ต้องล็อกอิน + ต้องเป็น Admin) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}