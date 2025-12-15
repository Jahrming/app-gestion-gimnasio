import React, { useState, useEffect, useContext } from 'react';
import { getAllGyms, deleteGym, createGym, updateGym, getGymById } from '../services/gymService';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit, Trash2, Search, MapPin, Phone, Building2, User, Eye } from 'lucide-react';
import GymModal from '../components/GymModal';
import ViewGymModal from '../components/ViewGymModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const Gyms = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGym, setCurrentGym] = useState(null);
    const { user } = useContext(AuthContext);

    // Confirm Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [gymToDelete, setGymToDelete] = useState(null);

    // View Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [gymToView, setGymToView] = useState(null);

    const { addToast } = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        fetchGyms();
    }, []);

    const fetchGyms = async () => {
        try {
            const data = await getAllGyms();
            setGyms(data);
        } catch (error) {
            console.error('Error fetching gyms:', error);
            addToast(t('errorFetching'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (gym) => {
        setGymToDelete(gym);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!gymToDelete) return;
        try {
            await deleteGym(gymToDelete.id);
            setGyms(gyms.filter(gym => gym.id !== gymToDelete.id));
            addToast(t('gymDeleted'), 'success');
        } catch (error) {
            console.error('Error deleting gym:', error);
            addToast(t('errorAction') + ': ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setConfirmOpen(false);
            setGymToDelete(null);
        }
    };

    const handleCreate = () => {
        setCurrentGym(null);
        setIsModalOpen(true);
    };

    const handleEdit = async (gym) => {
        try {
            // Fetch complete gym data including owner_id
            const completeGym = await getGymById(gym.id);
            setCurrentGym(completeGym);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error loading gym:', error);
            addToast(t('errorFetching'), 'error');
        }
    };

    const handleView = async (gym) => {
        try {
            // Fetch complete gym data including owner info
            const completeGym = await getGymById(gym.id);
            setGymToView(completeGym);
            setViewModalOpen(true);
        } catch (error) {
            console.error('Error loading gym:', error);
            addToast(t('errorFetching'), 'error');
        }
    };

    const handleSave = async (gymData) => {
        try {
            if (currentGym) {
                await updateGym(currentGym.id, gymData);
                addToast(t('gymUpdated'), 'success');
            } else {
                await createGym(gymData);
                addToast(t('gymCreated'), 'success');
            }
            fetchGyms();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving gym:', error);
            addToast(t('errorAction') + ': ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const filteredGyms = gyms.filter(gym =>
        gym.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Only Super Admin (1) can manage gyms
    const canManage = user?.role_id === 1;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('gymsTitle')}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>{t('gymsSubtitle')}</p>
                </div>
                {canManage && (
                    <button
                        onClick={handleCreate}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        <Plus size={20} />
                        <span>{t('addGym')}</span>
                    </button>
                )}
            </div>

            <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative', maxWidth: '300px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder={t('searchGyms')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '8px' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Loading...</p>
                    ) : filteredGyms.length === 0 ? (
                        <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No gyms found</p>
                    ) : (
                        filteredGyms.map(gym => (
                            <div key={gym.id} style={{ background: 'var(--surface)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                        {gym.logo_url ? (
                                            <img src={gym.logo_url} alt={gym.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Building2 size={30} color="var(--text-muted)" />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleView(gym)}
                                            style={{ padding: '0.5rem', background: 'var(--surface-hover)', border: 'none', borderRadius: '6px', color: 'var(--primary)', cursor: 'pointer' }}
                                            title={t('view')}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        {canManage && (
                                            <>
                                                <button onClick={() => handleEdit(gym)} style={{ padding: '0.5rem', background: 'var(--surface-hover)', border: 'none', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer' }}>
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => confirmDelete(gym)} style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{gym.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                    <MapPin size={16} />
                                    <span>{gym.address || 'No address'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <Phone size={16} />
                                    <span>{gym.phone || 'No phone'}</span>
                                </div>
                                {gym.owner_first_name && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        <User size={16} />
                                        <span>Owner: {gym.owner_first_name} {gym.owner_last_name}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <GymModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                gym={currentGym}
                onSave={handleSave}
            />

            <ViewGymModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                gym={gymToView}
            />

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title={t('deleteGymTitle')}
                message={t('deleteGymMessage', { name: gymToDelete?.name })}
                type="danger"
            />
        </div>
    );
};

export default Gyms;
