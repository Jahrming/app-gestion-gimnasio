import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoutineById, getRoutineExercises, addExerciseToRoutine, updateRoutineExercise, removeExerciseFromRoutine } from '../services/routineService';
import { getAllExercises } from '../services/exerciseService';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const RoutineBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [routine, setRoutine] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showAddExercise, setShowAddExercise] = useState(false);
    const { showToast } = useToast();
    const { t } = useLanguage();

    const days = [
        { value: 1, label: t('monday') },
        { value: 2, label: t('tuesday') },
        { value: 3, label: t('wednesday') },
        { value: 4, label: t('thursday') },
        { value: 5, label: t('friday') },
        { value: 6, label: t('saturday') },
        { value: 7, label: t('sunday') }
    ];

    useEffect(() => {
        if (id) {
            fetchRoutine();
            fetchExercises();
        }
        fetchAvailableExercises();
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchExercises();
        }
    }, [selectedDay]);

    const fetchRoutine = async () => {
        try {
            const data = await getRoutineById(id);
            setRoutine(data);
        } catch (error) {
            showToast('Error loading routine', 'error');
            navigate('/routines');
        }
    };

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const data = await getRoutineExercises(id, { day_of_week: selectedDay });
            setExercises(data || []);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableExercises = async () => {
        try {
            const data = await getAllExercises({ limit: 100 });
            setAvailableExercises(data.exercises || []);
        } catch (error) {
            console.error('Error fetching available exercises:', error);
        }
    };

    const handleAddExercise = async (exerciseId) => {
        try {
            await addExerciseToRoutine(id, {
                exercise_id: exerciseId,
                day_of_week: selectedDay,
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                rest_seconds: 60
            });
            showToast(t('exerciseCreated'), 'success');
            fetchExercises();
            setShowAddExercise(false);
        } catch (error) {
            showToast(error.response?.data?.message || t('errorAction'), 'error');
        }
    };

    const handleRemoveExercise = async (exerciseId) => {
        try {
            await removeExerciseFromRoutine(id, exerciseId);
            showToast('Exercise removed', 'success');
            fetchExercises();
        } catch (error) {
            showToast(t('errorAction'), 'error');
        }
    };

    const handleUpdateExercise = async (exerciseId, field, value) => {
        try {
            await updateRoutineExercise(id, exerciseId, { [field]: value });
            fetchExercises();
        } catch (error) {
            console.error('Error updating exercise:', error);
        }
    };

    return (
        <div>
            <button
                onClick={() => navigate('/routines')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                }}
            >
                <ArrowLeft size={18} />
                Back to Routines
            </button>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {routine?.name || 'New Routine'}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>{routine?.description || 'Build your routine'}</p>
            </div>

            {/* Day Selector */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {days.map(day => (
                        <button
                            key={day.value}
                            onClick={() => setSelectedDay(day.value)}
                            style={{
                                padding: '0.625rem 1rem',
                                backgroundColor: selectedDay === day.value ? '#6366f1' : 'var(--bg-secondary)',
                                color: selectedDay === day.value ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exercises List */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        Exercises for {days.find(d => d.value === selectedDay)?.label}
                    </h3>
                    <button
                        onClick={() => setShowAddExercise(!showAddExercise)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 1rem',
                            backgroundColor: '#6366f1',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={18} />
                        {t('addExerciseToRoutine')}
                    </button>
                </div>

                {showAddExercise && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>Select Exercise:</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {availableExercises.map(ex => (
                                <button
                                    key={ex.id}
                                    onClick={() => handleAddExercise(ex.id)}
                                    style={{
                                        padding: '0.75rem',
                                        backgroundColor: 'var(--bg-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    {ex.name}
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {t(ex.muscle_group)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {t('loading')}...
                    </div>
                ) : exercises.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {t('noExercisesInRoutine')}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {exercises.map((ex, index) => (
                            <div key={ex.id} style={{
                                padding: '1rem',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                                gap: '1rem',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{index + 1}. {ex.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t(ex.muscle_group)}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('sets')}</label>
                                    <input
                                        type="number"
                                        value={ex.sets || ''}
                                        onChange={(e) => handleUpdateExercise(ex.id, 'sets', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-color)',
                                            backgroundColor: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('repsMin')}</label>
                                    <input
                                        type="number"
                                        value={ex.reps_min || ''}
                                        onChange={(e) => handleUpdateExercise(ex.id, 'reps_min', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-color)',
                                            backgroundColor: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('repsMax')}</label>
                                    <input
                                        type="number"
                                        value={ex.reps_max || ''}
                                        onChange={(e) => handleUpdateExercise(ex.id, 'reps_max', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-color)',
                                            backgroundColor: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rest (s)</label>
                                    <input
                                        type="number"
                                        value={ex.rest_seconds || ''}
                                        onChange={(e) => handleUpdateExercise(ex.id, 'rest_seconds', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-color)',
                                            backgroundColor: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveExercise(ex.id)}
                                    style={{
                                        padding: '0.5rem',
                                        backgroundColor: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: '#ef4444',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoutineBuilder;
