import './login.css';
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Login() {

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    })

    const handleLogin = (e) => {
        const { name, value } = e.target;
        setLoginData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }
    // const func = () => {
    //     alert('Invalid email or Password!');
    // }
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = loginData;
        if (!email || !password) {
            return handleError('All fields are required');
        }
        try {
            const response = await axios.post(`${API_URL}/auth/login`, loginData);
            const { success, message, jwtToken, name, expiryTime, email, role, error } = response.data;
            if (success === true) {
                handleSuccess('SignIn Successfully');
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', email);
                localStorage.setItem('expireTime', expiryTime);
                localStorage.setItem('userRole', role);
                setTimeout(() => {
                    if (role === 'admin') {
                        navigate('/adminDashboard');
                    } else {
                        navigate('/studentDashBoard');
                    }
                }, 1500)
            }
            else {
                console.log(message);
            }
        }
        catch (error) {
            const details = error.response?.data?.error?.details?.[0]?.message;
            const message = error.response?.data?.message;
            const errorMessage = details || message || error.message || "Something went wrong";
            return handleError(errorMessage);
        }
    }

    return (
        <>
            <nav>
                <div className="logo"><i className="ri-shapes-fill"></i>Exam Portal</div>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li>About</li>
                    <li>Contact</li>
                    <li>
                        <div className="submit-button1">
                            <Link to="/SignUp">
                                <button>SignUp</button>
                            </Link>
                        </div>
                    </li>
                </ul>
            </nav>

            <div className="container">
                <div className="container-head">
                    <h1>Welcome Back</h1>
                </div>

                <form className="Details" onSubmit={handleSubmit}>
                    <span style={{ display: "block" }}>Email</span>
                    <input
                        placeholder="Enter email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLogin}
                    />

                    <span style={{ display: "block" }}>Password</span>
                    <input
                        type="password"
                        placeholder="Enter password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLogin}
                    />

                    <div className="submit-button">
                        <button type='submit'>Login</button>
                    </div>

                    <div className="already-account">
                        New user? <Link to="/signUp">SignUp</Link>
                    </div>
                </form>
            </div>

            <ToastContainer/>
        </>
    )
}

export default Login;
