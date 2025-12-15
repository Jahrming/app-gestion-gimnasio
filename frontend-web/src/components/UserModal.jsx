import React, { useState, useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const UserModal = ({ isOpen, onClose, user, onSave }) => {
    const { t } = useLanguage();
    const { user: currentUser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role_id: 4,
        is_active: true
    });

    // Determinar rol por defecto según el usuario actual
    const getDefaultRole = () => {
        if (!currentUser) return 4;
        if (currentUser.role_id === 1) return 4; // Super Admin default: Athlete
        if (currentUser.role_id === 2) return 4; // Gym Owner default: Athlete
        if (currentUser.role_id === 3) return 4; // Trainer default: Athlete
        return 4;
    };

    // Determinar roles disponibles según el rol del usuario actual
    const getAvailableRoles = () => {
        if (!currentUser) return [{ value: 4, label: 'Athlete' }];

        if (currentUser.role_id === 1) {
            // Super Admin puede crear cualquier rol
            return [
                { value: 1, label: 'Super Admin' },
                { value: 2, label: 'Gym Owner' },
                { value: 3, label: 'Trainer' },
                { value: 4, label: 'Athlete' }
            ];
        } else if (currentUser.role_id === 2) {
            // Gym Owner solo puede crear Trainers y Athletes
            return [
                { value: 3, label: 'Trainer' },
                { value: 4, label: 'Athlete' }
            ];
        } else if (currentUser.role_id === 3) {
            // Trainer solo puede crear Athletes
            return [
                { value: 4, label: 'Athlete' }
            ];
        }
        return [{ value: 4, label: 'Athlete' }];
    };

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                password: '', // Don't populate password on edit
                role_id: user.role_id || 4,
                is_active: user.is_active !== undefined ? user.is_active : true
            });
        } else {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                role_id: getDefaultRole(),
                is_active: true
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const availableRoles = getAvailableRoles();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
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
            backdropFilter: 'blur(4px)'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text)' }}>
                    {user ? t('editUser') : t('createNewUser')}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('firstName')}</label>
                            <input
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('lastName')}</label>
                            <input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                        />
                    </div>

                    {!user && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('password')}</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('role')}</label>
                        <select
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            disabled={user && currentUser.role_id !== 1} // Solo Super Admin puede cambiar roles
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px'
                            }}
                        >
                            {availableRoles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Selector - Only in edit mode and for authorized users */}
                    {user && (currentUser.role_id === 1 || user.created_by === currentUser.id) && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('status')}</label>
                            <select
                                name="is_active"
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    is_active: e.target.value === 'true'
                                }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px'
                                }}
                            >
                                <option value="true">{t('active')}</option>
                                <option value="false">{t('inactive')}</option>
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            {user ? t('update') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
