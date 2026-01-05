import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Clock, Trash2, Edit } from 'lucide-react';
import { getDietById, getDietMeals, addMeal, updateMeal, deleteMeal } from '../services/dietService';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const DietBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [diet, setDiet] = useState(null);
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMealForm, setShowMealForm] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);

    // Meal Form State
    const [mealFormData, setMealFormData] = useState({
        name: '',
        time_of_day: '08:00',
        description: '',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fats_g: ''
    });

    const { showToast } = useToast();
    const { t } = useLanguage();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dietData, mealsData] = await Promise.all([
                getDietById(id),
                getDietMeals(id)
            ]);
            setDiet(dietData);
            setMeals(mealsData);
        } catch (error) {
            showToast('Error loading diet plan', 'error');
            navigate('/diets');
        } finally {
            setLoading(false);
        }
    };

    const handleMealSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMeal) {
                await updateMeal(id, editingMeal.id, mealFormData);
                showToast('Meal updated', 'success');
            } else {
                await addMeal(id, mealFormData);
                showToast('Meal added', 'success');
            }
            setShowMealForm(false);
            setEditingMeal(null);
            resetForm();
            fetchData(); // Refresh list
        } catch (error) {
            showToast('Error saving meal', 'error');
        }
    };

    const handleDeleteMeal = async (mealId) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try {
            await deleteMeal(id, mealId);
            showToast('Meal deleted', 'success');
            fetchData();
        } catch (error) {
            showToast('Error deleting meal', 'error');
        }
    };

    const openEdit = (meal) => {
        setEditingMeal(meal);
        setMealFormData({
            name: meal.name,
            time_of_day: meal.time_of_day,
            description: meal.description || '',
            calories: meal.calories || '',
            protein_g: meal.protein_g || '',
            carbs_g: meal.carbs_g || '',
            fats_g: meal.fats_g || ''
        });
        setShowMealForm(true);
    };

    const resetForm = () => {
        setMealFormData({
            name: '',
            time_of_day: '08:00',
            description: '',
            calories: '',
            protein_g: '',
            carbs_g: '',
            fats_g: ''
        });
    };

    const calculateTotals = () => {
        return meals.reduce((acc, meal) => ({
            calories: acc.calories + (parseInt(meal.calories) || 0),
            protein: acc.protein + (parseFloat(meal.protein_g) || 0),
            carbs: acc.carbs + (parseFloat(meal.carbs_g) || 0),
            fats: acc.fats + (parseFloat(meal.fats_g) || 0),
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    };

    const totals = calculateTotals();

    if (loading) return <div className="p-6 text-center">{t('loading')}</div>;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/diets')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    <ArrowLeft size={20} />
                    {t('back')}
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{diet?.name}</h1>
                    <p className="text-sm text-gray-500">{diet?.description}</p>
                </div>
            </div>

            {/* Macros Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Calories</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">{totals.calories}</p>
                    <p className="text-xs text-blue-500">Target: {diet?.daily_calories_target || 'N/A'}</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-300 font-medium">Protein</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-100">{totals.protein.toFixed(1)}g</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                    <p className="text-sm text-green-600 dark:text-green-300 font-medium">Carbs</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-100">{totals.carbs.toFixed(1)}g</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <p className="text-sm text-yellow-600 dark:text-yellow-300 font-medium">Fats</p>
                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-100">{totals.fats.toFixed(1)}g</p>
                </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dailyMeals')}</h2>
                    {(user.role_id <= 3) && (
                        <button
                            onClick={() => {
                                resetForm();
                                setEditingMeal(null);
                                setShowMealForm(true);
                            }}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={18} />
                            {t('addMeal')}
                        </button>
                    )}
                </div>

                {meals.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">No meals added to this plan yet.</p>
                    </div>
                ) : (
                    meals.map((meal) => (
                        <div key={meal.id} className="glass-card p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <Clock size={24} className="text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-sm font-mono bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">
                                        {meal.time_of_day.slice(0, 5)}
                                    </span>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{meal.name}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{meal.description}</p>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <span>🔥 <span className="font-medium text-gray-900 dark:text-white">{meal.calories} kcal</span></span>
                                    <span>🥩 <span className="font-medium text-gray-900 dark:text-white">{meal.protein_g}g P</span></span>
                                    <span>🍞 <span className="font-medium text-gray-900 dark:text-white">{meal.carbs_g}g C</span></span>
                                    <span>🥑 <span className="font-medium text-gray-900 dark:text-white">{meal.fats_g}g F</span></span>
                                </div>
                            </div>
                            {(user.role_id <= 3) && (
                                <div className="flex gap-2 ml-auto">
                                    <button
                                        onClick={() => openEdit(meal)}
                                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMeal(meal.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Meal Modal (Inline for simplicity) */}
            {showMealForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingMeal ? t('editMeal') : t('addMeal')}
                            </h2>
                            <button onClick={() => setShowMealForm(false)} className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft size={24} className="rotate-180" /> {/* Should be X ideally but reusing icon */}
                            </button>
                        </div>
                        <form onSubmit={handleMealSubmit} className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('name')}</label>
                                    <input
                                        required
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={mealFormData.name}
                                        onChange={e => setMealFormData({ ...mealFormData, name: e.target.value })}
                                        placeholder="e.g. Breakfast"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('time')}</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={mealFormData.time_of_day}
                                        onChange={e => setMealFormData({ ...mealFormData, time_of_day: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Calories</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={mealFormData.calories}
                                        onChange={e => setMealFormData({ ...mealFormData, calories: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('description')}</label>
                                    <textarea
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={mealFormData.description}
                                        onChange={e => setMealFormData({ ...mealFormData, description: e.target.value })}
                                        placeholder="Detailed meal description..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Protein (g)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={mealFormData.protein_g}
                                        onChange={e => setMealFormData({ ...mealFormData, protein_g: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Carbs (g)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={mealFormData.carbs_g}
                                        onChange={e => setMealFormData({ ...mealFormData, carbs_g: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fats (g)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={mealFormData.fats_g}
                                        onChange={e => setMealFormData({ ...mealFormData, fats_g: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full btn-primary py-2 rounded">
                                {t('save')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DietBuilder;
