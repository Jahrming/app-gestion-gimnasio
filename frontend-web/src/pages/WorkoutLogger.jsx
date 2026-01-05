import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutinesByUser, getRoutineExercises } from '../services/routineService';
import { createWorkout, updateWorkout, createWorkoutSet } from '../services/workoutService';
import { ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const WorkoutLogger = () => {
    const [routines, setRoutines] = useState([]);
    const [selectedRoutine, setSelectedRoutine] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [currentWorkoutId, setCurrentWorkoutId] = useState(null);
    const [completedSets, setCompletedSets] = useState({});
    const [workoutNotes, setWorkoutNotes] = useState('');
    const [startTime] = useState(new Date());
    const { showToast } = useToast();
    const { t } = useLanguage();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserRoutines();
    }, []);

    const fetchUserRoutines = async () => {
        try {
            const data = await getRoutinesByUser(user.id);
            const activeRoutines = (data || []).filter(r => r.is_active);
            setRoutines(activeRoutines);
        } catch (error) {
            showToast('Error loading routines', 'error');
        }
    };

    const handleSelectRoutine = async (routineId) => {
        try {
            setSelectedRoutine(routineId);
            const today = new Date().getDay();
            const dayOfWeek = today === 0 ? 7 : today;

            const data = await getRoutineExercises(routineId, { day_of_week: dayOfWeek });
            setExercises(data || []);

            // Create workout log
            const workout = await createWorkout({ routine_id: routineId });
            setCurrentWorkoutId(workout.workoutId);
        } catch (error) {
            showToast('Error loading exercises', 'error');
        }
    };

    const handleLogSet = async (exerciseId, setNumber) => {
        const key = `${exerciseId}-${setNumber}`;
        const setData = completedSets[key];

        if (!setData?.reps || !setData?.weight) {
            showToast('Please enter reps and weight', 'error');
            return;
        }

        try {
            await createWorkoutSet(currentWorkoutId, {
                exercise_id: exerciseId,
                set_number: setNumber,
                reps_completed: parseInt(setData.reps),
                weight_used: parseFloat(setData.weight),
                rpe: setData.rpe ? parseInt(setData.rpe) : null
            });

            setCompletedSets(prev => ({
                ...prev,
                [key]: { ...prev[key], logged: true }
            }));

            showToast(t('setLogged'), 'success');
        } catch (error) {
            showToast(error.response?.data?.message || t('errorAction'), 'error');
        }
    };

    const handleSetDataChange = (exerciseId, setNumber, field, value) => {
        const key = `${exerciseId}-${setNumber}`;
        setCompletedSets(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleCompleteWorkout = async () => {
        try {
            const endTime = new Date();
            const duration = Math.round((endTime - startTime) / 60000);

            await updateWorkout(currentWorkoutId, {
                duration_minutes: duration,
                notes: workoutNotes
            });

            showToast(t('workoutCreated'), 'success');
            navigate('/workouts');
        } catch (error) {
            showToast(t('errorAction'), 'error');
        }
    };

    const getProgress = () => {
        const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
        const loggedSets = Object.values(completedSets).filter(s => s.logged).length;
        return totalSets > 0 ? Math.round((loggedSets / totalSets) * 100) : 0;
    };

    return (
        <div>
            <button
                onClick={() => navigate('/workouts')}
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
                Back
            </button>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {t('workoutLog')}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Log your workout sets</p>
            </div>

            {/* Select Routine */}
            {!selectedRoutine && (
                <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        {t('selectRoutine')}
                    </h3>
                    {routines.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No active routines found</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {routines.map(routine => (
                                <button
                                    key={routine.id}
                                    onClick={() => handleSelectRoutine(routine.id)}
                                    style={{
                                        padding: '1.5rem',
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{routine.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {routine.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Workout Logger */}
            {selectedRoutine && exercises.length > 0 && (
                <>
                    {/* Progress */}
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Progress</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{getProgress()}%</span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${getProgress()}%`,
                                height: '100%',
                                backgroundColor: '#6366f1',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                    </div>

                    {/* Exercises */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {exercises.map(exercise => (
                            <div key={exercise.id} className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {exercise.name}
                                </h3>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    {exercise.sets} sets × {exercise.reps_min}-{exercise.reps_max} reps
                                    {exercise.target_weight && ` @ ${exercise.target_weight}kg`}
                                </div>

                                {/* Sets */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {Array.from({ length: exercise.sets }, (_, i) => i + 1).map(setNum => {
                                        const key = `${exercise.id}-${setNum}`;
                                        const setData = completedSets[key] || {};
                                        const isLogged = setData.logged;

                                        return (
                                            <div key={setNum} style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'auto 1fr 1fr 1fr auto',
                                                gap: '0.75rem',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                backgroundColor: isLogged ? '#10b98110' : 'var(--bg-secondary)',
                                                borderRadius: '8px',
                                                border: isLogged ? '1px solid #10b981' : '1px solid var(--border-color)'
                                            }}>
                                                <span style={{ fontWeight: '500', minWidth: '60px' }}>Set {setNum}</span>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                                                        Weight (kg)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        value={setData.weight || ''}
                                                        onChange={(e) => handleSetDataChange(exercise.id, setNum, 'weight', e.target.value)}
                                                        disabled={isLogged}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid var(--border-color)',
                                                            backgroundColor: isLogged ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                                                            color: 'var(--text-primary)',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                                                        Reps
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={setData.reps || ''}
                                                        onChange={(e) => handleSetDataChange(exercise.id, setNum, 'reps', e.target.value)}
                                                        disabled={isLogged}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid var(--border-color)',
                                                            backgroundColor: isLogged ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                                                            color: 'var(--text-primary)',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                                                        RPE (1-10)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={setData.rpe || ''}
                                                        onChange={(e) => handleSetDataChange(exercise.id, setNum, 'rpe', e.target.value)}
                                                        disabled={isLogged}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid var(--border-color)',
                                                            backgroundColor: isLogged ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                                                            color: 'var(--text-primary)',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    />
                                                </div>
                                                {isLogged ? (
                                                    <CheckCircle size={20} style={{ color: '#10b981' }} />
                                                ) : (
                                                    <button
                                                        onClick={() => handleLogSet(exercise.id, setNum)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            backgroundColor: '#6366f1',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            color: 'white',
                                                            fontSize: '0.875rem',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Log
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Notes and Complete */}
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                            Workout Notes
                        </label>
                        <textarea
                            value={workoutNotes}
                            onChange={(e) => setWorkoutNotes(e.target.value)}
                            rows={3}
                            placeholder="How did you feel? Any observations?"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                marginBottom: '1rem'
                            }}
                        />
                        <button
                            onClick={handleCompleteWorkout}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#10b981',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <CheckCircle size={20} />
                            {t('completeWorkout')}
                        </button>
                    </div>
                </>
            )}

            {selectedRoutine && exercises.length === 0 && (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        No exercises scheduled for today in this routine.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WorkoutLogger;
