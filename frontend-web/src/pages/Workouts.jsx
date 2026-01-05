import React, { useState, useEffect, useContext } from 'react';
import { getAllWorkouts, deleteWorkout, getWorkoutStats } from '../services/workoutService';
import { Plus, Trash2, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const Workouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState(null);

    const { showToast } = useToast();
    const { t } = useLanguage();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkouts();
        fetchStats();
    }, []);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const data = await getAllWorkouts({ limit: 50 });
            setWorkouts(data.workouts || []);
        } catch (error) {
            showToast(t('errorFetching'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await getWorkoutStats(user.id);
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const confirmDelete = (workout) => {
        setWorkoutToDelete(workout);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await deleteWorkout(workoutToDelete.id);
            showToast(t('workoutDeleted'), 'success');
            setShowDeleteModal(false);
            setWorkoutToDelete(null);
            fetchWorkouts();
            fetchStats();
        } catch (error) {
            showToast(t('errorAction'), 'error');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {t('workoutsTitle')}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>{t('workoutsSubtitle')}</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <Calendar size={20} style={{ color: '#6366f1' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('totalWorkouts')}</span>
                        </div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{stats.total_workouts || 0}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <Clock size={20} style={{ color: '#10b981' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('avgDuration')}</span>
                        </div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                            {stats.average_duration ? Math.round(stats.average_duration) : 0} min
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <TrendingUp size={20} style={{ color: '#f59e0b' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('totalVolume')}</span>
                        </div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                            {stats.total_volume ? Math.round(stats.total_volume) : 0} kg
                        </div>
                    </div>
                </div>
            )}

            {/* New Workout Button */}
            <div style={{ marginBottom: '1.5rem' }}>
                <button
                    onClick={() => navigate('/workouts/new')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} />
                    {t('newWorkout')}
                </button>
            </div>

            {/* Workouts List */}
            <div className="glass-card" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t('loading')}...
                    </div>
                ) : workouts.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <Calendar size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
                        <p style={{ color: 'var(--text-muted)' }}>No workouts yet. Start your first workout!</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        Date
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        Routine
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        Duration
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        Notes
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        {t('actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {workouts.map((workout) => (
                                    <tr key={workout.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontWeight: '500' }}>{formatDate(workout.date)}</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {workout.routine_name || '-'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {workout.duration_minutes ? `${workout.duration_minutes} min` : '-'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {workout.notes || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => confirmDelete(workout)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '6px',
                                                        color: '#ef4444',
                                                        cursor: 'pointer'
                                                    }}
                                                    title={t('delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <ConfirmModal
                    title={t('deleteWorkoutTitle')}
                    message={t('deleteWorkoutMessage')}
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setWorkoutToDelete(null);
                    }}
                />
            )}
        </div>
    );
};

export default Workouts;
