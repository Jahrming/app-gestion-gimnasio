import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createExercise, updateExercise, getMuscleGroups } from '../services/exerciseService';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const ExerciseModal = ({ exercise, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        muscle_group: '',
        equipment_needed: '',
        video_url: '',
        thumbnail_url: ''
    });
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const { t } = useLanguage();

    const predefinedMuscleGroups = [
        'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'fullBody'
    ];

    useEffect(() => {
        if (exercise) {
            setFormData({
                name: exercise.name || '',
                description: exercise.description || '',
                muscle_group: exercise.muscle_group || '',
                equipment_needed: exercise.equipment_needed || '',
                video_url: exercise.video_url || '',
                thumbnail_url: exercise.thumbnail_url || ''
            });
        }
        fetchMuscleGroups();
    }, [exercise]);

    const fetchMuscleGroups = async () => {
        try {
            const groups = await getMuscleGroups();
            setMuscleGroups(groups || []);
        } catch (error) {
            console.error('Error fetching muscle groups:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.muscle_group) {
            showToast('Name and muscle group are required', 'error');
            return;
        }

        setLoading(true);
        try {
            if (exercise) {
                await updateExercise(exercise.id, formData);
                showToast(t('exerciseUpdated'), 'success');
            } else {
                await createExercise(formData);
                showToast(t('exerciseCreated'), 'success');
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

    // Combine predefined groups with existing groups from database
    const allMuscleGroups = [...new Set([...predefinedMuscleGroups, ...muscleGroups])];

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
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto',
                borderRadius: '16px',
                padding: '2rem'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        {exercise ? t('editExercise') : t('createNewExercise')}
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
                            alignItems: 'center',
                            borderRadius: '6px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Exercise Name */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)'
                            }}>
                                {t('exerciseName')} <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Bench Press"
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

                        {/* Muscle Group */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)'
                            }}>
                                {t('muscleGroup')} <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                name="muscle_group"
                                value={formData.muscle_group}
                                onChange={handleChange}
                                required
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
                                <option value="">Select muscle group...</option>
                                {allMuscleGroups.map(group => (
                                    <option key={group} value={group}>
                                        {t(group) || group}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Equipment */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)'
                            }}>
                                {t('equipment')}
                            </label>
                            <input
                                type="text"
                                name="equipment_needed"
                                value={formData.equipment_needed}
                                onChange={handleChange}
                                placeholder="e.g., Barbell, Bench"
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

                        {/* Description */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)'
                            }}>
                                {t('description')}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Enter exercise instructions and tips..."
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

                        {/* Video URL */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)'
                            }}>
                                {t('videoUrl')}
                            </label>
                            <input
                                type="url"
                                name="video_url"
                                value={formData.video_url}
                                onChange={handleChange}
                                placeholder="https://www.youtube.com/watch?v=..."
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

                        {/* Thumbnail URL */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)'
                            }}>
                                {t('thumbnailUrl')}
                            </label>
                            <input
                                type="url"
                                name="thumbnail_url"
                                value={formData.thumbnail_url}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
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

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '2rem',
                        justifyContent: 'flex-end'
                    }}>
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
                                opacity: loading ? 0.5 : 1,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = 'var(--bg-secondary)')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'transparent')}
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
                                opacity: loading ? 0.7 : 1,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#4f46e5')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#6366f1')}
                        >
                            {loading ? 'Saving...' : (exercise ? t('update') : t('create'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExerciseModal;
