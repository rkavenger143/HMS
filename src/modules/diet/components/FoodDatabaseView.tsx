import React, { useState } from 'react';
import { Apple, Plus, Search, Filter, Edit, CheckCircle2, Ban, Trash2 } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import type { FoodItem } from '../../../types';

export default function FoodDatabaseView() {
  const { foodItems, addFoodItem, updateFoodItem, toggleFoodItemStatus } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodItem['category']>('cereals');
  const [servingUnit, setServingUnit] = useState<FoodItem['servingUnit']>('Bowl');
  const [standardPortion, setStandardPortion] = useState('200g');
  const [calories, setCalories] = useState(150);
  const [protein, setProtein] = useState(5.0);
  const [carbs, setCarbs] = useState(30.0);
  const [fat, setFat] = useState(2.0);
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [allergens, setAllergens] = useState('');

  const filteredItems = foodItems.filter(f => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.allergens.some(a => a.toLowerCase().includes(q));

    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('cereals');
    setServingUnit('Bowl');
    setStandardPortion('200g');
    setCalories(150);
    setProtein(5.0);
    setCarbs(30.0);
    setFat(2.0);
    setIsVegetarian(true);
    setAllergens('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setServingUnit(item.servingUnit);
    setStandardPortion(item.standardPortion);
    setCalories(item.calories);
    setProtein(item.protein);
    setCarbs(item.carbs);
    setFat(item.fat);
    setIsVegetarian(item.isVegetarian);
    setAllergens(item.allergens.join(', '));
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const allergenList = allergens.split(',').map(a => a.trim()).filter(Boolean);

    if (editingItem) {
      updateFoodItem(editingItem.id, {
        name,
        category,
        servingUnit,
        standardPortion,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        isVegetarian,
        allergens: allergenList,
      });
    } else {
      addFoodItem({
        name,
        category,
        servingUnit,
        standardPortion,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        isVegetarian,
        allergens: allergenList,
        isActive: true,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-muted)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Apple size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Food Database & Nutritional Metrics</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Standard hospital food catalogue, serving portions, caloric & macronutrient metrics, and allergen tags
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={13} /> Add Food Item
        </button>
      </div>

      {/* Filter & Search */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search Food Name, Allergen..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories ({foodItems.length})</option>
            <option value="cereals">Cereals & Grains</option>
            <option value="protein">Proteins, Eggs & Meat</option>
            <option value="dairy">Dairy Products</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="beverages">Beverages & Broths</option>
            <option value="supplements">Enteral Supplements</option>
            <option value="snacks">Snacks & Nuts</option>
          </select>
        </div>
      </div>

      {/* Food Items Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Item Name</th>
                  <th>Category</th>
                  <th>Serving Size</th>
                  <th>Calories (kcal)</th>
                  <th>Protein</th>
                  <th>Carbohydrates</th>
                  <th>Fat</th>
                  <th>Allergens</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} style={{ opacity: item.isActive ? 1 : 0.6 }}>
                    {/* Name */}
                    <td>
                      <strong style={{ fontSize: 13 }}>{item.name}</strong>
                      <div style={{ fontSize: 11, color: item.isVegetarian ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {item.isVegetarian ? '🌱 Vegetarian' : '🍗 Non-Vegetarian'}
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-primary">{item.category.toUpperCase()}</span>
                    </td>

                    {/* Portion */}
                    <td>
                      <div>{item.standardPortion}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.servingUnit}</div>
                    </td>

                    {/* Calories */}
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>{item.calories} kcal</strong>
                    </td>

                    {/* Protein */}
                    <td>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{item.protein}g</span>
                    </td>

                    {/* Carbs */}
                    <td>
                      <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{item.carbs}g</span>
                    </td>

                    {/* Fat */}
                    <td>
                      <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{item.fat}g</span>
                    </td>

                    {/* Allergens */}
                    <td>
                      {item.allergens.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {item.allergens.map((al, idx) => (
                            <span key={idx} className="badge badge-danger" style={{ fontSize: 10 }}>
                              ⚠️ {al}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>None</span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${item.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Food Item"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          onClick={() => toggleFoodItemStatus(item.id)}
                          title={item.isActive ? 'Deactivate Food Item' : 'Activate Food Item'}
                        >
                          <Ban
                            size={13}
                            style={{ color: item.isActive ? 'var(--color-warning)' : 'var(--color-success)' }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <Apple size={18} style={{ color: 'var(--color-primary)' }} />
              <div className="modal-title">{editingItem ? 'Edit Food Item' : 'Add Food Item to Master'}</div>
              <button
                className="btn btn-ghost btn-icon btn-icon-sm"
                onClick={() => setShowAddModal(false)}
                style={{ marginLeft: 'auto' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      Food Item Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                    >
                      <option value="cereals">Cereals & Grains</option>
                      <option value="protein">Proteins & Meats/Eggs</option>
                      <option value="dairy">Dairy Products</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="beverages">Beverages & Broths</option>
                      <option value="supplements">Enteral Supplements</option>
                      <option value="snacks">Snacks & Nuts</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serving Unit</label>
                    <select
                      className="form-select"
                      value={servingUnit}
                      onChange={e => setServingUnit(e.target.value as any)}
                    >
                      <option value="Bowl">Bowl</option>
                      <option value="Portion">Portion</option>
                      <option value="Glass">Glass</option>
                      <option value="Cup">Cup</option>
                      <option value="Plate">Plate</option>
                      <option value="ml">ml</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Standard Portion</label>
                    <input
                      type="text"
                      className="form-input"
                      value={standardPortion}
                      onChange={e => setStandardPortion(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Calories (kcal)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={calories}
                      onChange={e => setCalories(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Protein (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={protein}
                      onChange={e => setProtein(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Carbohydrates (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={carbs}
                      onChange={e => setCarbs(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fat (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={fat}
                      onChange={e => setFat(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dietary Type</label>
                    <select
                      className="form-select"
                      value={isVegetarian ? 'veg' : 'nonveg'}
                      onChange={e => setIsVegetarian(e.target.value === 'veg')}
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Allergens Present (Comma separated e.g. Gluten, Milk, Peanuts)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Gluten, Egg, Milk..."
                      value={allergens}
                      onChange={e => setAllergens(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> {editingItem ? 'Update Food Item' : 'Save Food Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
