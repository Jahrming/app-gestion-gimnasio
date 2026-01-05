import React, { useState, useEffect, useContext } from 'react';
import { getAllRoutines, deleteRoutine } from '../services/routineService';
import { Plus, Edit, Trash2, Search, Calendar, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoutineModal from '../components/RoutineModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const Routines = () => {
    const [routines, setRoutines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all'); // all, active, inactive
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    const [showModal, setShowModal] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [routineToDelete, setRoutineToDelete] = useState(null);

    const { showToast } = useToast();
    const { t } = useLanguage();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoutines();
    }, [searchTerm, filterActive, pagination.page]);

    const fetchRoutines = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (filterActive !== 'all') {
                params.is_active = filterActive === 'active' ? 'true' : 'false';
            }

            const data = await getAllRoutines(params);
            setRoutines(data.routines || []);
            setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
        } catch (error) {
            showToast(t('errorFetching'), 'error');
            console.error('Error fetching routines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRoutine(null);
        setShowModal(true);
    };

    const handleBuildNew = () => {
        navigate('/routines/new');
    };

    const handleEdit = (routine) => {
        navigate(`/routines/${routine.id}/edit`);
    };

    const handleView = (routine) => {
        navigate(`/routines/${routine.id}`);
    };

    const confirmDelete = (routine) => {
        setRoutineToDelete(routine);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await deleteRoutine(routineToDelete.id);
            showToast(t('routineDeleted'), 'success');
            setShowDeleteModal(false);
            setRoutineToDelete(null);
            fetchRoutines();
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
        setEditingRoutine(null);
        fetchRoutines();
    };

    const filteredRoutines = routines.filter(routine => {
        const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (routine.description && routine.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {t('routinesTitle')}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>{t('routinesSubtitle')}</p>
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
                        placeholder={t('searchRoutines')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

                {/* Status Filter */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'active', 'inactive'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterActive(status)}
                            style={{
                                padding: '0.625rem 1rem',
                                backgroundColor: filterActive === status ? '#6366f1' : 'var(--bg-secondary)',
                                color: filterActive === status ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {status === 'all' ? 'All' : status === 'active' ? t('active') : t('inactive')}
                        </button>
                    ))}
                </div>

                {/* Add Buttons */}
                {(user?.role_id === 1 || user?.role_id === 2 || user?.role_id === 3) && (
                    <>
                        <button
                            onClick={handleCreate}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.25rem',
                                backgroundColor: 'transparent',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <Plus size={18} />
                            {t('addRoutine')}
                        </button>
                        <button
                            onClick={handleBuildNew}
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
                            <Calendar size={18} />
                            {t('buildRoutine')}
                        </button>
                    </>
                )}
            </div>

            {/* Routines Grid */}
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('loading')}...
                </div>
            ) : filteredRoutines.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
                    <Calendar size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {searchTerm ? t('noResults') : 'No routines found. Create your first routine!'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredRoutines.map((routine) => (
                        <div key={routine.id} className="glass-card" style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                        }}
                            onClick={() => handleView(routine)}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        {routine.name}
                                    </h3>
                                    {routine.description && (
                                        <p style={{
                                            color: 'var(--text-muted)',
                                            fontSize: '0.875rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {routine.description}
                                        </p>
                                    )}
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    backgroundColor: routine.is_active ? '#10b98120' : '#6b728020',
                                    color: routine.is_active ? '#10b981' : '#6b7280'
                                }}>
                                    {routine.is_active ? t('active') : t('inactive')}
                                </span>
                            </div>

                            {/* Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {routine.assigned_first_name && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <User size={16} />
                                        <span>{t('assignedTo')}: {routine.assigned_first_name} {routine.assigned_last_name}</span>
                                    </div>
                                )}
                                {routine.start_date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <Calendar size={16} />
                                        <span>{formatDate(routine.start_date)} - {formatDate(routine.end_date)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <User size={16} />
                                    <span>Created by: {routine.creator_first_name} {routine.creator_last_name}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {(user?.role_id === 1 || user?.role_id === 2 || user?.role_id === 3) && (
                                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}
                                    onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleView(routine)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Eye size={16} />
                                        {t('view')}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(routine)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Edit size={16} />
                                        {t('edit')}
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(routine)}
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
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showModal && (
                <RoutineModal
                    routine={editingRoutine}
                    onClose={() => {
                        setShowModal(false);
                        setEditingRoutine(null);
                    }}
                    onSave={handleSave}
                />
            )}

            {showDeleteModal && (
                <ConfirmModal
                    title={t('deleteRoutineTitle')}
                    message={t('deleteRoutineMessage').replace('{name}', routineToDelete?.name)}
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setRoutineToDelete(null);
                    }}
                />
            )}
        </div>
    );
};

export default Routines;
