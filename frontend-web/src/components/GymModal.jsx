import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAvailableOwners } from '../services/gymService';

const GymModal = ({ isOpen, onClose, gym, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        logo_url: '',
        owner_id: ''
    });
    const [owners, setOwners] = useState([]);

    useEffect(() => {
        const loadOwners = async () => {
            try {
                const data = await getAvailableOwners();
                setOwners(data);
            } catch (error) {
                console.error('Error loading owners:', error);
            }
        };

        if (isOpen) {
            loadOwners();
        }

        if (gym) {
            setFormData({
                name: gym.name || '',
                address: gym.address || '',
                phone: gym.phone || '',
                logo_url: gym.logo_url || '',
                owner_id: gym.owner_id || ''
            });
        } else {
            setFormData({
                name: '',
                address: '',
                phone: '',
                logo_url: '',
                owner_id: ''
            });
        }
    }, [gym, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

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
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text)' }}>
                    {gym ? t('editGym') : t('createNewGym')}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('gymName')}</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('address')}</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('phone')}</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>{t('logoUrl')}</label>
                        <input
                            name="logo_url"
                            value={formData.logo_url}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text)' }}>
                            {t('gymOwner')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            name="owner_id"
                            value={formData.owner_id}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                        >
                            <option value="">{t('selectOwner')}</option>
                            {owners.map(owner => (
                                <option key={owner.id} value={owner.id}>
                                    {owner.first_name} {owner.last_name} ({owner.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            {gym ? t('update') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GymModal;
