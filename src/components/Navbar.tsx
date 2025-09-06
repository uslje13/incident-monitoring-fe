import React from "react";
import type { ReactNode, ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/seo.ico';

type NavbarProps = {
    brand?: string;
    children?: React.ReactNode;
    isLoggedIn: boolean;
    onLogout: () => void;
}

export const Navbar = ({ brand = "My App", children, isLoggedIn, onLogout }: NavbarProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        onLogout();
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <Link to="/home" style={styles.brand}>
                <img src={logo} alt="Site Logo" style={styles.logo} />
                <h1 style={styles.brandText}>{brand}</h1>
            </Link>
            <div style={styles.links}>
                {React.Children.map(children, (child): ReactNode => {
                    if (React.isValidElement(child)) {
                        const element = child as ReactElement<{ children?: ReactNode }>;
                        if (element.props.children !== 'Logout') {
                            return element;
                        }
                    }
                    return null;
                })}
                {isLoggedIn && (
                    <span onClick={handleLogout} style={styles.logout}>
                        Logout
                    </span>
                )}
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#007BFF',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        boxSizing: 'border-box',
    },
    brand: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    logo: {
        width: '28px',
        height: '28px',
    },
    brandText: {
        margin: 0,
        fontSize: '1.5rem',
        fontFamily: 'var(--heading-font-family)',
        color: 'white'
    },
    links: {
        display: 'flex',
        gap: '1rem',
    },
    logout: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
    },
} as const;
