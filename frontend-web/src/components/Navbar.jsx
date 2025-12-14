import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { UserCircle, Menu, Sun, Moon, Languages } from 'lucide-react';

const Navbar = ({ onMenuClick, isMobile }) => {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { language, toggleLanguage, t } = useLanguage();

    const getRoleName = (roleId) => {
        // We can translate roles too if needed, or keep them static
        switch (roleId) {
            case 1: return 'Super Admin';
            case 2: return 'Gym Owner';
            case 3: return 'Trainer';
            case 4: return 'Athlete';
            default: return 'User';
        }
    };

    return (
        <div style={{
            height: '70px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            transition: 'background-color 0.3s, border-color 0.3s'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {isMobile && (
                    <button
                        onClick={onMenuClick}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            marginRight: '1rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Menu size={24} />
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={toggleLanguage}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                    }}
                    title="Toggle Language"
                >
                    <Languages size={20} />
                    <span>{language.toUpperCase()}</span>
                </button>

                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s'
                    }}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user?.first_name} {user?.last_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getRoleName(user?.role_id)}</p>
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)'
                }}>
                    <UserCircle size={24} color="var(--primary)" />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
