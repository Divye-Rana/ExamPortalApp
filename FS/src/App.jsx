import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import SignUp from "./components/SignUp";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import TakeExam from "./components/TakeExam";
import { useState } from "react";
import RefreshHandler from "./RefreshHandler";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const PrivateRoute = ({element}) => {
    return isAuthenticated ? element : <Navigate to="/login" />
  }

  return (
    <>
      //--- App part
      <RefreshHandler setIsAuthenticated={setIsAuthenticated}/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studentDashBoard" element={<PrivateRoute element={<StudentDashboard/>} />} />
        <Route path="/adminDashboard" element={<PrivateRoute element={<AdminDashboard/>} />} />
        <Route path="/exam/:examId" element={<PrivateRoute element={<TakeExam/>} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp/>}></Route>
      </Routes>
    </>
  );
}

export default App;
