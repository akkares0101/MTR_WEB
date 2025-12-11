import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// pages & components
import AgeSelection from './components/AgeSelection'; // ตอนนี้ยังไม่ใช้ ลบออกก็ได้ถ้าไม่จำเป็น
import UserFlow from './pages/UserFlow';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import TeacherModePage from './pages/TeacherModePage';   // 👈 เพิ่มตรงนี้
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [selectedAge, setSelectedAge] = useState('3-5');
  const navigate = useNavigate();

  const handleAgeSelect = (age) => {
    setSelectedAge(age);
    navigate('/');
  };

  return (
    <Routes>
      {/* หน้า User */}
      <Route
        path="/"
        element={<UserFlow ageRange={selectedAge} onBack={() => navigate('/')} />}
      />

      {/* 👩‍🏫 หน้าโหมดคุณครูสอนเด็กอนุบาล */}
      <Route
        path="/teacher"
        element={<TeacherModePage />}
      />

      {/* หน้า Login แอดมิน */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* หน้า Dashboard แอดมิน (ล็อกด้วย ProtectedRoute) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
