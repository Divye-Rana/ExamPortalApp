import { useEffect } from "react";
import { useNavigate, useLocation} from "react-router-dom";

function RefreshHandler({setIsAuthenticated}) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(()=>{
        if(localStorage.getItem('token')) {
            setIsAuthenticated(true);
            if(location.pathname === '/' ||
                location.pathname === '/login' ||
                location.pathname === 'signUp'
            ) {
                const userRole = localStorage.getItem('userRole');
                if(userRole === 'admin') {
                    navigate('/adminDashboard', {replace:false});
                } else {
                    navigate('/studentDashBoard', {replace:false});
                }
            }
        }
    }, [location, navigate, setIsAuthenticated])
    return (
        null 
    )
}

export default RefreshHandler;