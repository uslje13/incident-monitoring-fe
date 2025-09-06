import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import LoginPage from "./components/LoginPage.tsx";
import {Navbar} from "./components/Navbar.tsx";
import {useState} from "react";
import {AuthGuard} from "./guards/AuthGuard.tsx";
import HomePage from "./components/HomePage.tsx";
import DocumentDetails from "./components/DocumentDetails.tsx";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('authToken');
    };

    return (
        <Router>
            <Navbar brand="Incident Monitoring App" isLoggedIn={isLoggedIn} onLogout={handleLogout}/>

            <div style={containerStyle}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <AuthGuard isLoginPage>
                                <LoginPage onLoginSuccess={handleLoginSuccess}/>
                            </AuthGuard>
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            <AuthGuard>
                                <HomePage/>
                            </AuthGuard>
                        }
                    />
                    <Route
                        path="/document-details"
                        element={
                            <AuthGuard>
                                <DocumentDetails/>
                            </AuthGuard>
                        }
                    />
                    <Route path="*" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace/>}/>
                </Routes>
            </div>
        </Router>
    );
}

const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#ffffff'
};

export default App;
