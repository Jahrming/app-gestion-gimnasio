import React, { useState, useEffect, useContext } from 'react';
import { getUsers, deleteUser, createUser, updateUser } from '../services/userService';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import UserModal from '../components/UserModal';
import ViewUserModal from '../components/ViewUserModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [filterView, setFilterView] = useState('all'); // 'all', 'myUsers', 'trainers'

    // Confirm Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // View Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [userToView, setUserToView] = useState(null);

    const { addToast } = useToast();
    const { t } = useLanguage();
    const { user: authUser } = useContext(AuthContext);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            addToast(t('errorFetching'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete.id);
            setUsers(users.filter(user => user.id !== userToDelete.id));
            addToast(t('userDeleted'), 'success');
        } catch (error) {
            console.error('Error deleting user:', error);
            addToast(t('errorAction') + ': ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    const handleCreate = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleView = (user) => {
        setUserToView(user);
        setViewModalOpen(true);
    };

    const handleSave = async (userData) => {
        try {
            if (currentUser) {
                await updateUser(currentUser.id, userData);
                addToast(t('userUpdated'), 'success');
            } else {
                await createUser(userData);
                addToast(t('userCreated'), 'success');
            }
            fetchUsers();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving user:', error);
            addToast(t('errorAction') + ': ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const getRoleName = (roleId) => {
        // We could translate these too if needed
        switch (roleId) {
            case 1: return 'Super Admin';
            case 2: return 'Gym Owner';
            case 3: return 'Trainer';
            case 4: return 'Athlete';
            default: return 'User';
        }
    };

    const filteredUsers = users.filter(userItem => {
        const matchesSearch = userItem.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userItem.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userItem.email?.toLowerCase().includes(searchTerm.toLowerCase());

        // Apply role-based view filter for trainers
        if (authUser && authUser.role_id === 3) { // If current user is trainer
            if (filterView === 'myUsers') {
                // Show only users created by this trainer (role 4 = athletes)
                return matchesSearch && userItem.created_by === authUser.id && userItem.role_id === 4;
            } else if (filterView === 'trainers') {
                // Show only trainers from same gym (role 3)
                return matchesSearch && userItem.role_id === 3;
            }
        }

        return matchesSearch;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('usersTitle')}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>{t('usersSubtitle')}</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                    <Plus size={20} />
                    <span>{t('addUser')}</span>
                </button>
            </div>

            <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative', maxWidth: '300px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder={t('searchUsers')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '8px' }}
                        />
                    </div>

                    {/* Filter tabs for Trainers */}
                    {authUser && authUser.role_id === 3 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                            <button
                                onClick={() => setFilterView('all')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    background: filterView === 'all' ? 'var(--primary)' : 'var(--surface-hover)',
                                    color: filterView === 'all' ? 'white' : 'var(--text)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: filterView === 'all' ? '600' : 'normal',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterView('myUsers')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    background: filterView === 'myUsers' ? 'var(--primary)' : 'var(--surface-hover)',
                                    color: filterView === 'myUsers' ? 'white' : 'var(--text)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: filterView === 'myUsers' ? '600' : 'normal',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Mis Usuarios
                            </button>
                            <button
                                onClick={() => setFilterView('trainers')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    background: filterView === 'trainers' ? 'var(--primary)' : 'var(--surface-hover)',
                                    color: filterView === 'trainers' ? 'white' : 'var(--text)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: filterView === 'trainers' ? '600' : 'normal',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Trainers del Gym
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>User</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>{t('role')}</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>{t('status')}</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem', textAlign: 'right' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No users found</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '500' }}>{user.first_name} {user.last_name}</p>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                backgroundColor: user.role_id === 1 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                color: user.role_id === 1 ? '#818cf8' : '#34d399'
                                            }}>
                                                {getRoleName(user.role_id)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                color: user.is_active ? '#34d399' : '#f87171',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}>
                                                {user.is_active ? t('active') : t('inactive')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleView(user)}
                                                    style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', transition: 'color 0.2s' }}
                                                    title={t('view')}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                                                    title={t('edit')}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(user)}
                                                    style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', transition: 'color 0.2s' }}
                                                    title={t('delete')}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={currentUser}
                onSave={handleSave}
            />

            <ViewUserModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                user={userToView}
            />

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title={t('deleteUserTitle')}
                message={t('deleteUserMessage', { name: `${userToDelete?.first_name} ${userToDelete?.last_name}` })}
                type="danger"
            />
        </div>
    );
};

export default Users;
