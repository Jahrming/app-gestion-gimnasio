import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    Calendar,
    Activity,
    Utensils,
    MessageSquare,
    Settings,
    LogOut,
    Building2,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
    const { user, logout } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: t('dashboard'), roles: [1, 2, 3, 4] },
        { path: '/users', icon: <Users size={20} />, label: t('users'), roles: [1, 2, 3] },  // Super Admin, Gym Owner, Trainer
        { path: '/gyms', icon: <Building2 size={20} />, label: t('gyms'), roles: [1, 2] }, // Super Admin and Gym Owner
        { path: '/exercises', icon: <Dumbbell size={20} />, label: t('exercises'), roles: [1, 2, 3] },
        { path: '/routines', icon: <Calendar size={20} />, label: t('routines'), roles: [1, 2, 3, 4] },
        { path: '/workouts', icon: <Activity size={20} />, label: t('myWorkouts'), roles: [1, 2, 3, 4] },
        { path: '/measurements', icon: <Activity size={20} />, label: t('measurements'), roles: [3, 4] },
        { path: '/diets', icon: <Utensils size={20} />, label: t('diets'), roles: [1, 2, 3, 4] },
        { path: '/community', icon: <MessageSquare size={20} />, label: t('community'), roles: [1, 2, 3, 4] },
        { path: '/settings', icon: <Settings size={20} />, label: t('settings'), roles: [1, 2, 3, 4] },
    ];

    // Filter items based on user role
    const filteredItems = navItems.filter(item => item.roles.includes(user?.role_id));

    const sidebarStyle = {
        width: '250px',
        height: '100vh',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: isMobile ? (isOpen ? '0' : '-100%') : '0',
        zIndex: 40,
        transition: 'left 0.3s ease',
        boxShadow: isMobile && isOpen ? '4px 0 12px rgba(0,0,0,0.1)' : 'none'
    };

    return (
        <>
            {isMobile && isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 35,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            <div style={sidebarStyle}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Gym App
                    </h1>
                    {isMobile && (
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => isMobile && onClose()}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: isActive ? 'white' : 'var(--text-muted)',
                                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                        transition: 'all 0.2s',
                                        fontWeight: isActive ? '600' : 'normal'
                                    })}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            transition: 'background 0.2s'
                        }}
                    >
                        <LogOut size={20} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
