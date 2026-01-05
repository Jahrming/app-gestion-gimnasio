import React, { useState } from 'react';
import { Calculator, ChevronRight, Activity, Percent } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const MacroCalculator = ({ onApply }) => {
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        gender: 'male',
        weight: '',
        height: '',
        age: '',
        activityLevel: 'moderate',
        goal: 'lose_fat'
    });

    const [results, setResults] = useState(null);

    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
    };

    const goalModifiers = {
        lose_fat: -500, // Deficit
        maintain: 0,
        gain_muscle: 300, // Surplus
        recomp: -200 // Slight deficit
    };

    const calculateMacros = (e) => {
        e.preventDefault();

        const weight = parseFloat(formData.weight);
        const height = parseFloat(formData.height);
        const age = parseFloat(formData.age);

        if (!weight || !height || !age) return;

        // Mifflin-St Jeor Equation
        let bmr;
        if (formData.gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        const tdee = bmr * activityMultipliers[formData.activityLevel];
        const targetCalories = Math.round(tdee + goalModifiers[formData.goal]);

        // Macro Split Logic
        // Protein: 2g per kg of bodyweight
        let protein = Math.round(weight * 2.0); // High protein base

        // Fats: 0.8g per kg minimum
        let fats = Math.round(weight * 0.8);

        // Calculate calories taken by P and F
        const proteinCals = protein * 4;
        const fatCals = fats * 9;

        // Remaining calories for Carbs
        let remainingCals = targetCalories - (proteinCals + fatCals);

        // Adjust if negative (unlikely unless extreme deficit)
        if (remainingCals < 0) {
            remainingCals = 0;
            // Adjust protein/fats down slightly if needed, but usually this formula holds for fitness goals
        }

        let carbs = Math.round(remainingCals / 4);

        setResults({
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
            protein,
            carbs,
            fats
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!results ? (
                <form onSubmit={calculateMacros} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                {t('gender')}
                            </label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                            >
                                <option value="male">{t('male')}</option>
                                <option value="female">{t('female')}</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                {t('age')}
                            </label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                {t('weightKg')}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                                {t('heightCm')}
                            </label>
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                            {t('activityLevel')}
                        </label>
                        <select
                            value={formData.activityLevel}
                            onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                        >
                            <option value="sedentary">{t('sedentary')}</option>
                            <option value="light">{t('light')}</option>
                            <option value="moderate">{t('moderate')}</option>
                            <option value="active">{t('active')}</option>
                            <option value="veryActive">{t('veryActive')}</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)' }}>
                            {t('goal')}
                        </label>
                        <select
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px' }}
                        >
                            <option value="lose_fat">{t('loseFat')}</option>
                            <option value="maintain">{t('maintain')}</option>
                            <option value="gain_muscle">{t('gainMuscle')}</option>
                            <option value="recomp">{t('recomp')}</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '12px',
                            marginTop: '1rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <Calculator size={20} />
                        {t('calculateNeeds')}
                    </button>
                </form>
            ) : (
                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{t('bmr')}</h4>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)' }}>{results.bmr} <span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>kcal</span></p>
                        </div>
                        <div style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{t('tdee')}</h4>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)' }}>{results.tdee} <span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>kcal</span></p>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                        padding: '2rem',
                        borderRadius: '20px',
                        textAlign: 'center',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        marginBottom: '1.5rem'
                    }}>
                        <h4 style={{ fontSize: '0.875rem', color: '#6366f1', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('caloriesTarget')}</h4>
                        <p style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text)', lineHeight: '1', marginBottom: '0.5rem' }}>{results.targetCalories}</p>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t(formData.goal)}</span>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text)' }}>
                            <Percent size={18} className="text-secondary" /> {t('calculatedMacros')}
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            <div style={{ padding: '1rem 0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#ef4444', fontWeight: '700', marginBottom: '0.25rem' }}>PROTEIN</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)' }}>{results.protein}g</span>
                            </div>
                            <div style={{ padding: '1rem 0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#f59e0b', fontWeight: '700', marginBottom: '0.25rem' }}>CARBS</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)' }}>{results.carbs}g</span>
                            </div>
                            <div style={{ padding: '1rem 0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#3b82f6', fontWeight: '700', marginBottom: '0.25rem' }}>FATS</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)' }}>{results.fats}g</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setResults(null)}
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                color: 'var(--text-muted)',
                                background: 'var(--surface-hover)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {t('back')}
                        </button>
                        <button
                            type="button"
                            onClick={() => onApply(results)}
                            className="btn-primary"
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {t('useTheseMacros')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MacroCalculator;
