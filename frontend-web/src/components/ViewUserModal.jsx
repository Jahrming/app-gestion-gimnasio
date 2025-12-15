import React from 'react';
import { X, User, Mail, Shield, Building2, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ViewUserModal = ({ isOpen, onClose, user }) => {
    const { t } = useLanguage();

    if (!isOpen || !user) return null;

    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1: return 'Super Admin';
            case 2: return 'Gym Owner';
            case 3: return 'Trainer';
            case 4: return 'Athlete';
            default: return 'User';
        }
    };

    const getRoleColor = (roleId) => {
        switch (roleId) {
            case 1: return '#818cf8'; // Indigo
            case 2: return '#f59e0b'; // Amber
            case 3: return '#34d399'; // Emerald
            case 4: return '#60a5fa'; // Blue
            default: return '#9ca3af';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(8px)'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '650px',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Header with gradient */}
                <div style={{
                    background: 'var(--gradient-main)',
                    padding: '2rem',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid rgba(255,255,255,0.5)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'var(--primary)'
                        }}>
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>

                        {/* User Name and Role */}
                        <div style={{ flex: 1 }}>
                            <h2 style={{
                                fontSize: '1.875rem',
                                fontWeight: 'bold',
                                color: 'white',
                                marginBottom: '0.5rem',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {user.first_name} {user.last_name}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{
                                    display: 'inline-block',
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.875rem',
                                    color: 'white',
                                    fontWeight: '500'
                                }}>
                                    {getRoleName(user.role_id)}
                                </div>
                                {user.is_active && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        color: '#22c55e',
                                        fontWeight: '500'
                                    }}>
                                        <CheckCircle size={12} />
                                        {t('active')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {/* Email */}
                        <div style={{
                            background: 'var(--background)',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'var(--primary-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Mail size={16} color="var(--primary)" />
                                </div>
                                <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('email')}
                                </span>
                            </div>
                            <div style={{ paddingLeft: '2.5rem', color: 'var(--text)', fontSize: '1rem' }}>
                                {user.email}
                            </div>
                        </div>

                        {/* Role */}
                        <div style={{
                            background: 'var(--background)',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'var(--primary-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Shield size={16} color="var(--primary)" />
                                </div>
                                <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('role')}
                                </span>
                            </div>
                            <div style={{ paddingLeft: '2.5rem' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    backgroundColor: `${getRoleColor(user.role_id)}20`,
                                    color: getRoleColor(user.role_id),
                                    border: `2px solid ${getRoleColor(user.role_id)}40`
                                }}>
                                    {getRoleName(user.role_id)}
                                </span>
                            </div>
                        </div>

                        {/* Status */}
                        <div style={{
                            background: 'var(--background)',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'var(--primary-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {user.is_active ? (
                                        <CheckCircle size={16} color="#22c55e" />
                                    ) : (
                                        <XCircle size={16} color="#ef4444" />
                                    )}
                                </div>
                                <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('status')}
                                </span>
                            </div>
                            <div style={{ paddingLeft: '2.5rem' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    backgroundColor: user.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: user.is_active ? '#22c55e' : '#ef4444',
                                    border: user.is_active ? '2px solid rgba(34, 197, 94, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)'
                                }}>
                                    {user.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                    {user.is_active ? t('active') : t('inactive')}
                                </span>
                            </div>
                        </div>

                        {/* Bio (if exists) */}
                        {user.bio && (
                            <div style={{
                                background: 'var(--background)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: 'var(--primary-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <User size={16} color="var(--primary)" />
                                    </div>
                                    <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Bio
                                    </span>
                                </div>
                                <div style={{ paddingLeft: '2.5rem', color: 'var(--text)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    {user.bio}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button
                            onClick={onClose}
                            className="btn-primary"
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewUserModal;
