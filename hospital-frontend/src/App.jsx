import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/departments"
          element={<Departments />}
        />

        <Route
          path="/doctors"
          element={<Doctors />}
        />

        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/appointments"
          element={<Appointments />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;