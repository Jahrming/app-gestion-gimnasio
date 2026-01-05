import React, { useState, useEffect } from 'react';
import { getAllExercises, deleteExercise, getMuscleGroups } from '../services/exerciseService';
import { Plus, Edit, Trash2, Search, Dumbbell, Filter } from 'lucide-react';
import ExerciseModal from '../components/ExerciseModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    const [showModal, setShowModal] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);

    const { showToast } = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        fetchExercises();
        fetchMuscleGroups();
    }, [searchTerm, selectedMuscleGroup, pagination.page]);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (searchTerm) params.search = searchTerm;
            if (selectedMuscleGroup) params.muscle_group = selectedMuscleGroup;

            const data = await getAllExercises(params);
            setExercises(data.exercises || []);
            setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
        } catch (error) {
            showToast(t('errorFetching'), 'error');
            console.error('Error fetching exercises:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMuscleGroups = async () => {
        try {
            const groups = await getMuscleGroups();
            setMuscleGroups(groups || []);
        } catch (error) {
            console.error('Error fetching muscle groups:', error);
        }
    };

    const handleCreate = () => {
        setEditingExercise(null);
        setShowModal(true);
    };

    const handleEdit = (exercise) => {
        setEditingExercise(exercise);
        setShowModal(true);
    };

    const confirmDelete = (exercise) => {
        setExerciseToDelete(exercise);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await deleteExercise(exerciseToDelete.id);
            showToast(t('exerciseDeleted'), 'success');
            setShowDeleteModal(false);
            setExerciseToDelete(null);
            fetchExercises();
        } catch (error) {
            if (error.response?.data?.message) {
                showToast(error.response.data.message, 'error');
            } else {
                showToast(t('errorAction'), 'error');
            }
        }
    };

    const handleSave = () => {
        setShowModal(false);
        setEditingExercise(null);
        fetchExercises();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleMuscleGroupChange = (e) => {
        setSelectedMuscleGroup(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getMuscleGroupBadgeColor = (muscleGroup) => {
        const colors = {
            'chest': '#ef4444',
            'back': '#3b82f6',
            'legs': '#8b5cf6',
            'shoulders': '#f59e0b',
            'arms': '#10b981',
            'core': '#ec4899',
            'cardio': '#06b6d4',
            'fullBody': '#6366f1',
        };
        return colors[muscleGroup] || '#6b7280';
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {t('exercisesTitle')}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>{t('exercisesSubtitle')}</p>
            </div>

            {/* Filters and Actions */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        placeholder={t('searchExercises')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                        }}
                    />
                </div>

                {/* Muscle Group Filter */}
                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                            pointerEvents: 'none'
                        }}
                    />
                    <select
                        value={selectedMuscleGroup}
                        onChange={handleMuscleGroupChange}
                        style={{
                            width: '100%',
                            padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="">{t('allMuscles')}</option>
                        {muscleGroups.map(group => (
                            <option key={group} value={group}>
                                {t(group) || group}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Add Button */}
                <button
                    onClick={handleCreate}
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
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
                >
                    <Plus size={18} />
                    {t('addExercise')}
                </button>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t('loading')}...
                    </div>
                ) : exercises.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <Dumbbell size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {searchTerm || selectedMuscleGroup ? t('noResults') : t('noExercisesInRoutine')}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        {t('exerciseName')}
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        {t('muscleGroup')}
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        {t('equipment')}
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        {t('description')}
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        {t('actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {exercises.map((exercise) => (
                                    <tr key={exercise.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                                {exercise.name}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {exercise.muscle_group && (
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    backgroundColor: `${getMuscleGroupBadgeColor(exercise.muscle_group)}20`,
                                                    color: getMuscleGroupBadgeColor(exercise.muscle_group)
                                                }}>
                                                    {t(exercise.muscle_group) || exercise.muscle_group}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {exercise.equipment_needed || '-'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            <div style={{
                                                maxWidth: '300px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {exercise.description || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleEdit(exercise)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '6px',
                                                        color: 'var(--text-primary)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    title={t('edit')}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(exercise)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '6px',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ef444410'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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

                {/* Pagination */}
                {!loading && exercises.length > 0 && pagination.total > pagination.limit && (
                    <div style={{
                        padding: '1rem',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                                    opacity: pagination.page === 1 ? 0.5 : 1,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page * pagination.limit >= pagination.total}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    cursor: pagination.page * pagination.limit >= pagination.total ? 'not-allowed' : 'pointer',
                                    opacity: pagination.page * pagination.limit >= pagination.total ? 0.5 : 1,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <ExerciseModal
                    exercise={editingExercise}
                    onClose={() => {
                        setShowModal(false);
                        setEditingExercise(null);
                    }}
                    onSave={handleSave}
                />
            )}

            {showDeleteModal && (
                <ConfirmModal
                    title={t('deleteExerciseTitle')}
                    message={t('deleteExerciseMessage').replace('{name}', exerciseToDelete?.name)}
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setExerciseToDelete(null);
                    }}
                />
            )}
        </div>
    );
};

export default Exercises;
