import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createRoutine, updateRoutine } from '../services/routineService';
import { getUsers } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const RoutineModal = ({ routine, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        assigned_user_id: '',
        start_date: '',
        end_date: '',
        is_active: true
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        if (routine) {
            setFormData({
                name: routine.name || '',
                description: routine.description || '',
                assigned_user_id: routine.assigned_user_id || '',
                start_date: routine.start_date || '',
                end_date: routine.end_date || '',
                is_active: routine.is_active !== undefined ? routine.is_active : true
            });
        }
        fetchUsers();
    }, [routine]);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            // Filter only clients (role_id 4)
            setUsers((data.users || data || []).filter(u => u.role_id === 4));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            showToast('Routine name is required', 'error');
            return;
        }

        setLoading(true);
        try {
            if (routine) {
                await updateRoutine(routine.id, formData);
                showToast(t('routineUpdated'), 'success');
            } else {
                await createRoutine(formData);
                showToast(t('routineCreated'), 'success');
            }
            onSave();
        } catch (error) {
            if (error.response?.data?.message) {
                showToast(error.response.data.message, 'error');
            } else {
                showToast(t('errorAction'), 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
                borderRadius: '16px',
                padding: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        {routine ? t('editRoutine') : t('createNewRoutine')}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            borderRadius: '6px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                {t('routineName')} <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                {t('description')}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                {t('assignedTo')}
                            </label>
                            <select
                                name="assigned_user_id"
                                value={formData.assigned_user_id}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">{t('selectUser')}</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    {t('startDate')}
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    {t('endDate')}
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                id="is_active"
                                style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor="is_active" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                                {t('active')}
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: '#6366f1',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Saving...' : (routine ? t('update') : t('create'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoutineModal;
