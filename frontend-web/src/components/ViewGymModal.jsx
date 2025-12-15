import React from 'react';
import { X, Building2, MapPin, Phone, User, Mail, Image } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ViewGymModal = ({ isOpen, onClose, gym }) => {
    const { t } = useLanguage();

    if (!isOpen || !gym) return null;

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
                maxWidth: '700px',
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
                        {/* Logo */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            background: 'rgba(255,255,255,0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid rgba(255,255,255,0.5)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                        }}>
                            {gym.logo_url ? (
                                <img src={gym.logo_url} alt={gym.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Building2 size={40} color="var(--primary)" />
                            )}
                        </div>

                        {/* Gym Name */}
                        <div style={{ flex: 1 }}>
                            <h2 style={{
                                fontSize: '1.875rem',
                                fontWeight: 'bold',
                                color: 'white',
                                marginBottom: '0.5rem',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {gym.name}
                            </h2>
                            <div style={{
                                display: 'inline-block',
                                background: 'rgba(255,255,255,0.2)',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                color: 'white',
                                fontWeight: '500'
                            }}>
                                {t('gymDetails')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {/* Address */}
                        {gym.address && (
                            <div style={{
                                background: 'var(--background)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                transition: 'all 0.2s'
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
                                        <MapPin size={16} color="var(--primary)" />
                                    </div>
                                    <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {t('address')}
                                    </span>
                                </div>
                                <div style={{ paddingLeft: '2.5rem', color: 'var(--text)', fontSize: '1rem' }}>
                                    {gym.address}
                                </div>
                            </div>
                        )}

                        {/* Phone */}
                        {gym.phone && (
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
                                        <Phone size={16} color="var(--primary)" />
                                    </div>
                                    <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {t('phone')}
                                    </span>
                                </div>
                                <div style={{ paddingLeft: '2.5rem', color: 'var(--text)', fontSize: '1rem' }}>
                                    {gym.phone}
                                </div>
                            </div>
                        )}

                        {/* Owner */}
                        {gym.owner_first_name && (
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
                                        {t('gymOwner')}
                                    </span>
                                </div>
                                <div style={{ paddingLeft: '2.5rem' }}>
                                    <div style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: '500' }}>
                                        {gym.owner_first_name} {gym.owner_last_name}
                                    </div>
                                    {gym.owner_email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
                                            <Mail size={14} />
                                            <span>{gym.owner_email}</span>
                                        </div>
                                    )}
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

export default ViewGymModal;
