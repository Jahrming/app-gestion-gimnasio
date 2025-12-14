import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Building2, Dumbbell, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
        }}>
            {icon}
        </div>
        <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Dashboard</h2>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.first_name}!</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard title="Total Users" value="1,234" icon={<Users size={24} />} color="#6366f1" />
                <StatCard title="Active Gyms" value="12" icon={<Building2 size={24} />} color="#ec4899" />
                <StatCard title="Exercises" value="345" icon={<Dumbbell size={24} />} color="#10b981" />
                <StatCard title="Monthly Revenue" value="$12,345" icon={<TrendingUp size={24} />} color="#f59e0b" />
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Activity</h3>
                <p style={{ color: 'var(--text-muted)' }}>No recent activity to show.</p>
            </div>
        </div>
    );
};

export default Dashboard;
