import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './NavBar.module.css';
import nebula_logo from "../../images/icons/gravyn.svg"

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Platform', path: null },
        { name: 'Features', path: '/features' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Career', path: '/career' },
        { name: 'Contact Us', path: '/contact' }
    ];

    const handleNavigation = (path) => {
        if (path) navigate(path);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className={styles['nav-bar-wrapper']}>

            <div className={styles['nav-bar-slider']} />

            <div className={`${styles['nav-bar-flex']} ${styles['nav-bar-flex-start']}`}>
                <img src={nebula_logo} alt="Nebula Logo" />
                <p>Gravyn</p>
            </div>

            <div className={`${styles['nav-bar-flex']} ${styles['nav-bar-flex-middle']}`}>
                <div className={styles['menu-wrapper']}>
                    {tabs.map((tab, index) => (
                        <p
                            key={index}
                            onClick={() => handleNavigation(tab.path)}
                            className={`${styles['menu-item']} ${
                                isActive(tab.path) ? styles['active'] : ''
                            }`}
                        >
                            {tab.name}
                        </p>
                    ))}
                </div>
            </div>

            <div className={`${styles['nav-bar-flex']} ${styles['nav-bar-flex-end']}`}>
                <p
                    onClick={() => handleNavigation('/login')}
                    className={styles['auth-btn']}
                >
                    Login
                </p>
            </div>
        </div>
    );
};

export default NavBar;


