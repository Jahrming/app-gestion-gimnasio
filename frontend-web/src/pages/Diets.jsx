import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, ChevronRight, User, Calendar, Utensils } from 'lucide-react';
import { getDiets, deleteDiet } from '../services/dietService';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import DietModal from '../components/DietModal';
import ConfirmModal from '../components/ConfirmModal';

const Diets = () => {
    const [diets, setDiets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedDiet, setSelectedDiet] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [dietToDelete, setDietToDelete] = useState(null);

    const { showToast } = useToast();
    const { t } = useLanguage();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDiets();
    }, [page, search]);

    const fetchDiets = async () => {
        try {
            setLoading(true);
            const data = await getDiets({ page, limit: 9, search });
            setDiets(data.diets);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            showToast(t('errorLoadingDiets'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleDelete = async () => {
        try {
            await deleteDiet(dietToDelete.id);
            showToast(t('dietDeleted'), 'success');
            setShowDeleteModal(false);
            fetchDiets();
        } catch (error) {
            showToast(t('errorAction'), 'error');
        }
    };

    const canEdit = (diet) => {
        if (user.role_id === 1) return true; // Super Admin
        if (user.role_id === 2 && diet.gym_id === user.gym_id) return true; // Gym Owner
        if (user.role_id === 3 && diet.creator_id === user.id) return true; // Trainer owns their created diets
        return false;
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {t('diets')}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>{t('manageDietsDescription')}</p>
                </div>
                {(user.role_id <= 3) && (
                    <button
                        onClick={() => {
                            setSelectedDiet(null);
                            setShowModal(true);
                        }}
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
                        {t('createDiet')}
                    </button>
                )}
            </div>

            {/* Search Filter */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder={t('searchDiets')}
                    value={search}
                    onChange={handleSearch}
                    style={{
                        paddingLeft: '2.5rem',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                        width: '100%',
                        borderRadius: '12px',
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)'
                    }}
                />
            </div>

            {/* Content Area */}
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('loading')}...
                </div>
            ) : diets.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
                    <Utensils size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)' }}>{t('noDietsFound')}</p>
                    {user.role_id <= 3 && (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                marginTop: '1rem',
                                color: '#6366f1', // Primary color
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            {t('createFirstDiet')}
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {diets.map((diet) => (
                        <div key={diet.id} className="glass-card" style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}>
                            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{diet.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                                        {diet.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {canEdit(diet) && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedDiet(diet);
                                                    setShowModal(true);
                                                }}
                                                style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                title={t('editDiet')}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDietToDelete(diet);
                                                    setShowDeleteModal(true);
                                                }}
                                                style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                                title={t('deleteDiet')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                        <User size={14} />
                                        <span>{diet.assigned_user_name || 'Unassigned'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                        <Calendar size={14} />
                                        <span>{diet.total_days || 0} days</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/diets/${diet.id}`)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: 'var(--surface-hover)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: 'var(--text)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover:bg-opacity-80"
                                >
                                    {t('viewPlan')}
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DietModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                dietToEdit={selectedDiet}
                onDietSaved={() => {
                    fetchDiets();
                    setSelectedDiet(null);
                }}
            />

            {showDeleteModal && (
                <ConfirmModal
                    title={t('deleteDiet')}
                    message={t('deleteDietConfirmation')}
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDietToDelete(null);
                    }}
                />
            )}
        </div>
    );
};

export default Diets;
