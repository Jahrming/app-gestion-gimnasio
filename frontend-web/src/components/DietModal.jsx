import React, { useState, useEffect, useContext } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createDiet, updateDiet } from '../services/dietService';
import { getUsers } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import MacroCalculator from './MacroCalculator';

const DietModal = ({ isOpen, onClose, dietToEdit, onDietSaved }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        assigned_user_id: '',
        start_date: '',
        end_date: '',
        daily_calories_target: ''
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);

    const { showToast } = useToast();
    const { t } = useLanguage();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];

            if (dietToEdit) {
                setFormData({
                    name: dietToEdit.name || '',
                    description: dietToEdit.description || '',
                    assigned_user_id: dietToEdit.assigned_user_id || '',
                    start_date: dietToEdit.start_date ? dietToEdit.start_date.split('T')[0] : '',
                    end_date: dietToEdit.end_date ? dietToEdit.end_date.split('T')[0] : '',
                    daily_calories_target: dietToEdit.daily_calories_target || ''
                });
            } else {
                // Initialize with default values for new diet
                setFormData({
                    name: '',
                    description: '',
                    assigned_user_id: user.role_id === 4 ? user.id : '', // Auto-assign if client
                    start_date: today,
                    end_date: '',
                    daily_calories_target: ''
                });
            }

            // Fetch users only if not editing or just to be safe
            fetchUsers();
        }
    }, [dietToEdit, isOpen, user]);

    const fetchUsers = async () => {
        try {
            // Fetch potential clients (role 4)
            const response = await getUsers({ role_id: 4, limit: 100 });
            // Fix: Handle both array response and object response formats
            const userList = Array.isArray(response) ? response : (response.users || []);
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculatorApply = (results) => {
        setFormData(prev => ({
            ...prev,
            daily_calories_target: results.targetCalories,
            description: (prev.description ? prev.description + '\n' : '') +
                `Calculated Targets: ${results.targetCalories}kcal (P: ${results.protein}g, C: ${results.carbs}g, F: ${results.fats}g`
        }));
        setShowCalculator(false);
        showToast(t('macrosApplied'), 'success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.name) {
                showToast(t('requiredFields'), 'error');
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                // Ensure assigned_user_id is valid or null (critical for backend)
                assigned_user_id: formData.assigned_user_id || (user.role_id === 4 ? user.id : null),
                daily_calories_target: formData.daily_calories_target || null
            };

            let response;
            if (dietToEdit) {
                await updateDiet(dietToEdit.id, payload);
                showToast(t('dietUpdated'), 'success');
            } else {
                response = await createDiet(payload);
                showToast(t('dietCreated'), 'success');
            }

            onDietSaved();
            onClose();

            // If created new diet, navigate to builder to add meals
            if (!dietToEdit && response && response.id) {
                navigate(`/diets/builder/${response.id}`);
            }

        } catch (error) {
            console.error('Error saving diet:', error);
            showToast(t('errorAction'), 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

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
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '550px',
                borderRadius: '20px',
                padding: '2rem',
                position: 'relative',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {showCalculator && (
                            <button onClick={() => setShowCalculator(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                                &larr;
                            </button>
                        )}
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>
                            {showCalculator ? t('calculator') : (dietToEdit ? t('editDiet') : t('createDiet'))}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                    {showCalculator ? (
                        <MacroCalculator onApply={handleCalculatorApply} />
                    ) : (
                        <form id="diet-form" onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                        {t('name')} <span style={{ color: '#ec4899' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                                        placeholder="e.g., Weight Loss Plan"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                        {t('description')}
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', minHeight: '100px', resize: 'vertical' }}
                                    />
                                </div>

                                {/* Only show assign dropdown if not a client (or show user but disabled if needed) */}
                                {user.role_id !== 4 && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                            {t('assignToUser')}
                                        </label>
                                        <select
                                            name="assigned_user_id"
                                            value={formData.assigned_user_id}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                                        >
                                            <option value="">{t('selectUser')}</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                                {t('caloriesTarget')}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowCalculator(true)}
                                                style={{ fontSize: '0.75rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                                            >
                                                <Calculator size={14} /> {t('calculateNeeds')}
                                            </button>
                                        </div>
                                        <input
                                            type="number"
                                            name="daily_calories_target"
                                            value={formData.daily_calories_target}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                                            placeholder="2000"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                            {t('startDate')}
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {!showCalculator && (
                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            form="diet-form"
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            <Save size={18} />
                            {loading ? t('saving') : t('save')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DietModal;
