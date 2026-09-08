import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type {
  Admission,
  Bed,
  Ward,
  Patient,
  Doctor,
  DietType,
  DietStatus,
  MealType,
  MealStatus,
  FoodItem,
  MealScheduleItem,
  ComprehensiveDietChart,
  NutritionAssessmentRecord,
  DoctorDietOrder,
  MealDeliveryRecord,
  NPOPatientRecord,
  DietAlert,
  DietDashboardKPIs,
} from '../../../types';
import {
  DEMO_ADMISSIONS,
  DEMO_BEDS,
  DEMO_WARDS,
  DEMO_PATIENTS,
  DEMO_DOCTORS,
} from '../../../data/seedData';

// -------------------------------------------------------------
// 1. SEED FOOD DATABASE ITEMS
// -------------------------------------------------------------
const INITIAL_FOOD_ITEMS: FoodItem[] = [
  { id: 'fi-001', name: 'Oatmeal Porridge', category: 'cereals', servingUnit: 'Bowl', standardPortion: '200g', calories: 150, protein: 5, carbs: 28, fat: 2.5, isVegetarian: true, allergens: ['Gluten'], preparationMethod: 'Boiled with skimmed milk or water', isActive: true },
  { id: 'fi-002', name: 'Boiled Egg Whites', category: 'protein', servingUnit: 'piece', standardPortion: '2 pcs (60g)', calories: 34, protein: 7.2, carbs: 0.5, fat: 0.2, isVegetarian: false, allergens: ['Egg'], preparationMethod: 'Hard boiled, unseasoned', isActive: true },
  { id: 'fi-003', name: 'Moong Dal Khichdi', category: 'cereals', servingUnit: 'Bowl', standardPortion: '250g', calories: 220, protein: 8.5, carbs: 40, fat: 3.0, isVegetarian: true, allergens: [], preparationMethod: 'Soft pressure cooked with mild cumin and turmeric', isActive: true },
  { id: 'fi-004', name: 'Steamed Fish Fillet', category: 'protein', servingUnit: 'Portion', standardPortion: '120g', calories: 140, protein: 22, carbs: 0, fat: 4.5, isVegetarian: false, allergens: ['Fish', 'Seafood'], preparationMethod: 'Steamed with lemon herb dressing', isActive: true },
  { id: 'fi-005', name: 'Low-Fat Curd / Yogurt', category: 'dairy', servingUnit: 'Cup', standardPortion: '150g', calories: 95, protein: 6.0, carbs: 8.0, fat: 2.0, isVegetarian: true, allergens: ['Milk', 'Lactose'], preparationMethod: 'Pasteurized probiotic plain curd', isActive: true },
  { id: 'fi-006', name: 'Steamed Seasonal Veggies', category: 'vegetables', servingUnit: 'Bowl', standardPortion: '180g', calories: 65, protein: 2.5, carbs: 12, fat: 0.5, isVegetarian: true, allergens: [], preparationMethod: 'Steamed broccoli, carrot, and french beans', isActive: true },
  { id: 'fi-007', name: 'Clear Vegetable Broth', category: 'beverages', servingUnit: 'Cup', standardPortion: '200ml', calories: 30, protein: 1.0, carbs: 5, fat: 0.1, isVegetarian: true, allergens: [], preparationMethod: 'Strained slow-simmered vegetable broth', isActive: true },
  { id: 'fi-008', name: 'Papaya Cubes', category: 'fruits', servingUnit: 'Bowl', standardPortion: '150g', calories: 60, protein: 0.8, carbs: 14, fat: 0.2, isVegetarian: true, allergens: [], preparationMethod: 'Freshly cut, chilled', isActive: true },
  { id: 'fi-009', name: 'Roasted Almonds & Walnuts', category: 'snacks', servingUnit: 'Portion', standardPortion: '30g', calories: 180, protein: 5.5, carbs: 6, fat: 16, isVegetarian: true, allergens: ['Tree Nut', 'Peanut'], preparationMethod: 'Dry roasted, unsalted', isActive: true },
  { id: 'fi-010', name: 'Enteral High-Protein Formula', category: 'supplements', servingUnit: 'ml', standardPortion: '250ml', calories: 300, protein: 18, carbs: 36, fat: 9.0, isVegetarian: true, allergens: ['Milk', 'Soy'], preparationMethod: 'Formulated RTD feed via Ryle tube', isActive: true },
  { id: 'fi-011', name: 'Whole Wheat Phulka Roti', category: 'cereals', servingUnit: 'piece', standardPortion: '2 pcs (60g)', calories: 160, protein: 5.0, carbs: 32, fat: 1.0, isVegetarian: true, allergens: ['Gluten', 'Wheat'], preparationMethod: 'Freshly puffed without oil/ghee', isActive: true },
  { id: 'fi-012', name: 'Tender Coconut Water', category: 'beverages', servingUnit: 'Glass', standardPortion: '200ml', calories: 40, protein: 0.5, carbs: 9.0, fat: 0.1, isVegetarian: true, allergens: [], preparationMethod: 'Fresh natural tender coconut water', isActive: true },
  { id: 'fi-013', name: 'Warm Turmeric Milk', category: 'dairy', servingUnit: 'Glass', standardPortion: '180ml', calories: 110, protein: 4.5, carbs: 12, fat: 3.2, isVegetarian: true, allergens: ['Milk'], preparationMethod: 'Low-fat milk infused with turmeric & green cardamom', isActive: true },
  { id: 'fi-014', name: 'Apple Puree / Stewed Apples', category: 'fruits', servingUnit: 'Cup', standardPortion: '150g', calories: 75, protein: 0.4, carbs: 19, fat: 0.1, isVegetarian: true, allergens: [], preparationMethod: 'Peeled, steamed and smooth pureed', isActive: true },
  { id: 'fi-015', name: 'Grilled Chicken Breast', category: 'protein', servingUnit: 'Portion', standardPortion: '120g', calories: 165, protein: 31, carbs: 0, fat: 3.6, isVegetarian: false, allergens: [], preparationMethod: 'Skinless, herb seasoned, grilled', isActive: true },
];

// -------------------------------------------------------------
// 2. SEED PATIENT DIET CHARTS (7-Meal Structure)
// -------------------------------------------------------------
const INITIAL_DIET_CHARTS: ComprehensiveDietChart[] = [
  {
    id: 'dc-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    doctorName: 'Dr. Rajesh Sharma',
    dietitianId: 'dt-001',
    dietitianName: 'Dietitian Shalini Gupta, RD',
    dietType: 'diabetic',
    dietConsistency: 'regular',
    feedingMethod: 'oral',
    mealFrequency: '7 Meals / Day (Fractionated)',
    estimatedCalories: 1600,
    proteinGrams: 65,
    carbsGrams: 180,
    fatGrams: 40,
    fluidRequirementMl: 2000,
    restrictions: ['Refined Sugar', 'High GI Fruits', 'Deep Fried Foods'],
    allergies: ['Peanuts'],
    specialInstructions: 'Strictly no added sugar or fruit juices. Check postprandial blood sugar 2h after lunch.',
    startDate: '2026-08-30',
    reviewDate: '2026-09-06',
    status: 'active',
    version: 1,
    approvedBy: 'Dietitian Shalini Gupta, RD',
    approvedAt: '2026-08-30 10:30',
    createdAt: '2026-08-30 09:00',
    updatedAt: '2026-08-30 10:30',
    mealSchedules: [
      {
        id: 'ms-1',
        mealType: 'early_morning',
        scheduledTime: '06:30',
        foodItems: [{ foodItemId: 'fi-012', foodName: 'Warm Methi Seed Infused Water', portion: '1 Glass (200ml)', calories: 15 }],
        specialInstructions: 'Serve on empty stomach',
      },
      {
        id: 'ms-2',
        mealType: 'breakfast',
        scheduledTime: '08:30',
        foodItems: [
          { foodItemId: 'fi-001', foodName: 'Oatmeal Porridge', portion: '1 Bowl (200g)', calories: 150 },
          { foodItemId: 'fi-002', foodName: 'Boiled Egg Whites', portion: '2 pcs (60g)', calories: 34 },
        ],
        specialInstructions: 'Sugar-free preparation with skimmed milk',
      },
      {
        id: 'ms-3',
        mealType: 'mid_morning',
        scheduledTime: '11:00',
        foodItems: [{ foodItemId: 'fi-008', foodName: 'Papaya Cubes', portion: '1 Bowl (150g)', calories: 60 }],
        specialInstructions: 'Freshly diced',
      },
      {
        id: 'ms-4',
        mealType: 'lunch',
        scheduledTime: '13:00',
        foodItems: [
          { foodItemId: 'fi-011', foodName: 'Whole Wheat Phulka Roti', portion: '2 pcs (60g)', calories: 160 },
          { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl (180g)', calories: 65 },
          { foodItemId: 'fi-005', foodName: 'Low-Fat Curd / Yogurt', portion: '1 Cup (150g)', calories: 95 },
        ],
        specialInstructions: 'No oil tempering',
      },
      {
        id: 'ms-5',
        mealType: 'evening_snack',
        scheduledTime: '16:30',
        foodItems: [{ foodItemId: 'fi-007', foodName: 'Clear Vegetable Broth', portion: '1 Cup (200ml)', calories: 30 }],
        specialInstructions: 'Hot & strained',
      },
      {
        id: 'ms-6',
        mealType: 'dinner',
        scheduledTime: '19:30',
        foodItems: [
          { foodItemId: 'fi-003', foodName: 'Moong Dal Khichdi', portion: '1 Bowl (250g)', calories: 220 },
          { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl (180g)', calories: 65 },
        ],
        specialInstructions: 'Light dinner before 20:00',
      },
      {
        id: 'ms-7',
        mealType: 'bedtime',
        scheduledTime: '21:30',
        foodItems: [{ foodItemId: 'fi-013', foodName: 'Warm Turmeric Milk', portion: '1 Glass (180ml)', calories: 110 }],
        specialInstructions: 'Unsweetened',
      },
    ],
  },
  {
    id: 'dc-002',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    bedNumber: 'PW-101',
    ward: 'Private Ward',
    doctorName: 'Dr. Rajesh Sharma',
    dietitianId: 'dt-001',
    dietitianName: 'Dietitian Shalini Gupta, RD',
    dietType: 'cardiac',
    dietConsistency: 'soft',
    feedingMethod: 'oral',
    mealFrequency: '6 Meals / Day',
    estimatedCalories: 1500,
    proteinGrams: 60,
    carbsGrams: 200,
    fatGrams: 30,
    fluidRequirementMl: 1500,
    restrictions: ['Low Sodium (<2g/day)', 'Low Saturated Fat', 'Caffeine Restricted'],
    allergies: ['Sulfa Drugs'],
    specialInstructions: 'Strict low-salt cardiac diet. Measure and log 24-hour fluid intake strictly.',
    startDate: '2026-08-29',
    reviewDate: '2026-09-05',
    status: 'active',
    version: 1,
    approvedBy: 'Dietitian Shalini Gupta, RD',
    approvedAt: '2026-08-29 14:00',
    createdAt: '2026-08-29 11:30',
    updatedAt: '2026-08-29 14:00',
    mealSchedules: [
      {
        id: 'ms-21',
        mealType: 'early_morning',
        scheduledTime: '06:30',
        foodItems: [{ foodItemId: 'fi-012', foodName: 'Tender Coconut Water', portion: '1 Glass (200ml)', calories: 40 }],
      },
      {
        id: 'ms-22',
        mealType: 'breakfast',
        scheduledTime: '08:30',
        foodItems: [
          { foodItemId: 'fi-001', foodName: 'Oatmeal Porridge', portion: '1 Bowl (200g)', calories: 150 },
          { foodItemId: 'fi-008', foodName: 'Papaya Cubes', portion: '1 Bowl (150g)', calories: 60 }],
      },
      {
        id: 'ms-23',
        mealType: 'mid_morning',
        scheduledTime: '11:00',
        foodItems: [{ foodItemId: 'fi-014', foodName: 'Stewed Apples', portion: '1 Cup (150g)', calories: 75 }],
      },
      {
        id: 'ms-24',
        mealType: 'lunch',
        scheduledTime: '13:00',
        foodItems: [
          { foodItemId: 'fi-003', foodName: 'Moong Dal Khichdi (Low Salt)', portion: '1 Bowl (250g)', calories: 220 },
          { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl (180g)', calories: 65 },
          { foodItemId: 'fi-005', foodName: 'Low-Fat Curd', portion: '1 Cup (150g)', calories: 95 },
        ],
      },
      {
        id: 'ms-25',
        mealType: 'evening_snack',
        scheduledTime: '16:30',
        foodItems: [{ foodItemId: 'fi-007', foodName: 'Clear Vegetable Broth', portion: '1 Cup (200ml)', calories: 30 }],
      },
      {
        id: 'ms-26',
        mealType: 'dinner',
        scheduledTime: '19:30',
        foodItems: [
          { foodItemId: 'fi-011', foodName: 'Whole Wheat Phulka Roti', portion: '2 pcs (60g)', calories: 160 },
          { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl (180g)', calories: 65 },
        ],
      },
      {
        id: 'ms-27',
        mealType: 'bedtime',
        scheduledTime: '21:30',
        foodItems: [{ foodItemId: 'fi-013', foodName: 'Warm Turmeric Milk', portion: '1 Glass (180ml)', calories: 110 }],
      },
    ],
  },
  {
    id: 'dc-003',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    doctorName: 'Dr. Amit Trivedi',
    dietitianId: 'dt-001',
    dietitianName: 'Dietitian Shalini Gupta, RD',
    dietType: 'high_protein',
    dietConsistency: 'regular',
    feedingMethod: 'oral',
    mealFrequency: '5 Meals / Day',
    estimatedCalories: 2200,
    proteinGrams: 95,
    carbsGrams: 260,
    fatGrams: 55,
    fluidRequirementMl: 2500,
    restrictions: ['Cow Milk / Lactose (Mild intolerant)'],
    allergies: ['Lactose'],
    specialInstructions: 'Post-op orthopedic fracture recovery: high protein, calcium and zinc rich meals.',
    startDate: '2026-09-02',
    reviewDate: '2026-09-09',
    status: 'active',
    version: 1,
    approvedBy: 'Dietitian Shalini Gupta, RD',
    approvedAt: '2026-09-02 11:00',
    createdAt: '2026-09-02 10:00',
    updatedAt: '2026-09-02 11:00',
    mealSchedules: [
      {
        id: 'ms-31',
        mealType: 'breakfast',
        scheduledTime: '08:30',
        foodItems: [
          { foodItemId: 'fi-002', foodName: 'Boiled Egg Whites', portion: '4 pcs (120g)', calories: 68 },
          { foodItemId: 'fi-001', foodName: 'Oatmeal Porridge (Water-based)', portion: '1 Bowl (200g)', calories: 150 },
        ],
      },
      {
        id: 'ms-32',
        mealType: 'mid_morning',
        scheduledTime: '11:00',
        foodItems: [{ foodItemId: 'fi-009', foodName: 'Roasted Almonds & Walnuts', portion: '1 Portion (30g)', calories: 180 }],
      },
      {
        id: 'ms-33',
        mealType: 'lunch',
        scheduledTime: '13:00',
        foodItems: [
          { foodItemId: 'fi-015', foodName: 'Grilled Chicken Breast', portion: '1 Portion (120g)', calories: 165 },
          { foodItemId: 'fi-011', foodName: 'Whole Wheat Phulka Roti', portion: '3 pcs (90g)', calories: 240 },
          { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl (180g)', calories: 65 },
        ],
      },
      {
        id: 'ms-34',
        mealType: 'evening_snack',
        scheduledTime: '16:30',
        foodItems: [{ foodItemId: 'fi-010', foodName: 'Enteral High-Protein Formula', portion: '250ml', calories: 300 }],
      },
      {
        id: 'ms-35',
        mealType: 'dinner',
        scheduledTime: '19:30',
        foodItems: [
          { foodItemId: 'fi-004', foodName: 'Steamed Fish Fillet', portion: '1 Portion (120g)', calories: 140 },
          { foodItemId: 'fi-011', foodName: 'Whole Wheat Phulka Roti', portion: '2 pcs (60g)', calories: 160 },
          { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl (180g)', calories: 65 },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------
// 3. SEED NUTRITION ASSESSMENTS
// -------------------------------------------------------------
const INITIAL_ASSESSMENTS: NutritionAssessmentRecord[] = [
  {
    id: 'na-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    date: '2026-08-30',
    dietitianName: 'Dietitian Shalini Gupta, RD',
    heightCm: 162,
    weightKg: 68,
    bmi: 25.9,
    recentWeightChange: 'Stable over 3 months',
    appetite: 'good',
    feedingAbility: 'independent',
    swallowingDifficulty: false,
    nutritionalRisk: 'low',
    dietaryHistory: 'Vegetarian, irregular meal timings, tea with sugar',
    notes: 'Patient motivated to adhere to structured diabetic meal schedule.',
    createdAt: '2026-08-30 09:30',
  },
  {
    id: 'na-002',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    bedNumber: 'PW-101',
    date: '2026-08-29',
    dietitianName: 'Dietitian Shalini Gupta, RD',
    heightCm: 155,
    weightKg: 52,
    bmi: 21.6,
    recentWeightChange: 'Unintentional loss of 2kg past month due to dyspnea',
    appetite: 'fair',
    feedingAbility: 'independent',
    swallowingDifficulty: false,
    nutritionalRisk: 'moderate',
    dietaryHistory: 'Cardiac history, salt sensitive, mild pedal edema',
    notes: 'Needs small frequent meals to prevent postprandial cardiac stress.',
    createdAt: '2026-08-29 11:00',
  },
  {
    id: 'na-003',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    bedNumber: 'GW-02',
    date: '2026-09-02',
    dietitianName: 'Dietitian Shalini Gupta, RD',
    heightCm: 178,
    weightKg: 74,
    bmi: 23.4,
    recentWeightChange: 'Stable',
    appetite: 'good',
    feedingAbility: 'independent',
    swallowingDifficulty: false,
    nutritionalRisk: 'low',
    dietaryHistory: 'Non-vegetarian, active lifestyle, mild lactose intolerance',
    notes: 'High protein requirement for post-op fracture osteogenesis.',
    createdAt: '2026-09-02 09:45',
  },
];

// -------------------------------------------------------------
// 4. SEED MEAL WORKFLOW & DELIVERIES (Today's Date: 2026-09-07)
// -------------------------------------------------------------
const TODAY = new Date().toISOString().slice(0, 10);

const INITIAL_MEAL_DELIVERIES: MealDeliveryRecord[] = [
  {
    id: 'md-101',
    dietChartId: 'dc-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    mealType: 'breakfast',
    date: TODAY,
    scheduledTime: '08:30',
    status: 'consumed',
    deliveredTime: '08:25',
    kitchenStaff: 'Chef Ramesh',
    deliveryStaff: 'Suresh Kumar',
    consumptionStatus: 'fully_consumed',
    patientFeedback: 'Good taste, satisfied with portion size.',
    remarks: 'Tray delivered on time. Patient consumed entire breakfast.',
  },
  {
    id: 'md-102',
    dietChartId: 'dc-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    mealType: 'lunch',
    date: TODAY,
    scheduledTime: '13:00',
    status: 'delivered',
    deliveredTime: '12:50',
    kitchenStaff: 'Chef Ramesh',
    deliveryStaff: 'Suresh Kumar',
    consumptionStatus: 'partially_consumed',
    patientFeedback: 'Felt full quickly, left half portion of khichdi.',
    remarks: 'Delivered to bedside. Patient ate half portion.',
  },
  {
    id: 'md-103',
    dietChartId: 'dc-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    mealType: 'evening_snack',
    date: TODAY,
    scheduledTime: '16:30',
    status: 'ready',
    kitchenStaff: 'Chef Ramesh',
    remarks: 'Vegetable broth packaged in thermos tray in kitchen.',
  },
  {
    id: 'md-104',
    dietChartId: 'dc-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    mealType: 'dinner',
    date: TODAY,
    scheduledTime: '19:30',
    status: 'scheduled',
    kitchenStaff: 'Chef Ramesh',
  },
  {
    id: 'md-105',
    dietChartId: 'dc-002',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    bedNumber: 'PW-101',
    ward: 'Private Ward',
    mealType: 'breakfast',
    date: TODAY,
    scheduledTime: '08:30',
    status: 'consumed',
    deliveredTime: '08:30',
    kitchenStaff: 'Chef Ramesh',
    deliveryStaff: 'Suresh Kumar',
    consumptionStatus: 'fully_consumed',
    patientFeedback: 'Low salt taste acceptable.',
  },
  {
    id: 'md-106',
    dietChartId: 'dc-002',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    bedNumber: 'PW-101',
    ward: 'Private Ward',
    mealType: 'lunch',
    date: TODAY,
    scheduledTime: '13:00',
    status: 'preparing',
    kitchenStaff: 'Chef Ramesh',
  },
  {
    id: 'md-107',
    dietChartId: 'dc-003',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    mealType: 'breakfast',
    date: TODAY,
    scheduledTime: '08:30',
    status: 'consumed',
    deliveredTime: '08:35',
    kitchenStaff: 'Chef Ramesh',
    deliveryStaff: 'Suresh Kumar',
    consumptionStatus: 'fully_consumed',
  },
  {
    id: 'md-108',
    dietChartId: 'dc-003',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    mealType: 'lunch',
    date: TODAY,
    scheduledTime: '13:00',
    status: 'ready',
    kitchenStaff: 'Chef Ramesh',
    deliveryStaff: 'Suresh Kumar',
  },
];

// -------------------------------------------------------------
// 5. SEED DOCTOR DIET ORDERS
// -------------------------------------------------------------
const INITIAL_DOCTOR_ORDERS: DoctorDietOrder[] = [
  {
    id: 'ddo-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Sharma',
    requestedDietType: 'diabetic',
    instructions: '1600 kcal ADA diabetic diet with high fiber and low glycemic index foods.',
    priority: 'routine',
    isNPO: false,
    orderDate: '2026-08-30 08:30',
    status: 'completed',
    acknowledgedBy: 'Dietitian Shalini Gupta, RD',
    acknowledgedAt: '2026-08-30 09:00',
  },
  {
    id: 'ddo-002',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    bedNumber: 'PW-101',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Sharma',
    requestedDietType: 'cardiac',
    instructions: 'Strict low salt (<2g sodium) cardiac diet with fluid restriction to 1.5L/24h.',
    priority: 'routine',
    isNPO: false,
    orderDate: '2026-08-29 10:00',
    status: 'completed',
    acknowledgedBy: 'Dietitian Shalini Gupta, RD',
    acknowledgedAt: '2026-08-29 11:00',
  },
  {
    id: 'ddo-003',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    bedNumber: 'GW-02',
    doctorId: 'doc-003',
    doctorName: 'Dr. Amit Trivedi',
    requestedDietType: 'high_protein',
    instructions: 'High protein (1.5g/kg) orthopedic recovery diet. Avoid whole milk.',
    priority: 'urgent',
    isNPO: false,
    orderDate: '2026-09-02 09:15',
    status: 'completed',
    acknowledgedBy: 'Dietitian Shalini Gupta, RD',
    acknowledgedAt: '2026-09-02 09:30',
  },
];

// -------------------------------------------------------------
// EXACT 9 CLEAN NAVIGATION TABS
// -------------------------------------------------------------
export type DietTab =
  | 'dashboard'
  | 'diet_plans'
  | 'daily_diet_chart'
  | 'meal_schedule'
  | 'diet_monitoring'
  | 'food_database'
  | 'special_diets'
  | 'diet_review_history'
  | 'reports';

interface DietContextType {
  // Navigation & Active Inpatient Selection
  activeTab: DietTab;
  setActiveTab: (tab: DietTab) => void;
  selectedAdmissionId: string;
  setSelectedAdmissionId: (id: string) => void;

  // Domain Master Records
  admissions: Admission[];
  beds: Bed[];
  wards: Ward[];
  patients: Patient[];
  doctors: Doctor[];

  // Diet Specific State
  foodItems: FoodItem[];
  dietCharts: ComprehensiveDietChart[];
  doctorOrders: DoctorDietOrder[];
  assessments: NutritionAssessmentRecord[];
  mealDeliveries: MealDeliveryRecord[];
  kpis: DietDashboardKPIs;

  // Actions
  createDietChart: (chart: Omit<ComprehensiveDietChart, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => { chartId: string; hasAllergyConflict: boolean; conflicts: string[] };
  updateDietChart: (id: string, updates: Partial<ComprehensiveDietChart>) => void;
  modifyDietChart: (id: string, newChartData: Partial<ComprehensiveDietChart>, reason: string, modifierName: string) => void;
  recordNutritionAssessment: (assessment: Omit<NutritionAssessmentRecord, 'id' | 'createdAt' | 'bmi' | 'nutritionalRisk'>) => void;
  updateMealStatus: (deliveryId: string, status: MealStatus, staffName?: string, remarks?: string) => void;
  recordMealConsumption: (
    deliveryId: string,
    consumptionStatus: 'fully_consumed' | 'partially_consumed' | 'not_consumed',
    patientFeedback?: string,
    foodProblem?: string,
    remarks?: string
  ) => void;
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  toggleFoodItemStatus: (id: string) => void;
  checkAllergyConflicts: (selectedFoodItemIds: string[], patientAllergies: string[]) => string[];
}

const DietContext = createContext<DietContextType | undefined>(undefined);

export function DietProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<DietTab>('dashboard');
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string>(DEMO_ADMISSIONS[0]?.id || '');

  // Master Data
  const [admissions] = useState<Admission[]>(DEMO_ADMISSIONS);
  const [beds] = useState<Bed[]>(DEMO_BEDS);
  const [wards] = useState<Ward[]>(DEMO_WARDS);
  const [patients] = useState<Patient[]>(DEMO_PATIENTS);
  const [doctors] = useState<Doctor[]>(DEMO_DOCTORS);

  // Diet Data with LocalStorage Persistence
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('hms_diet_food_items_v3');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_ITEMS;
  });

  const [dietCharts, setDietCharts] = useState<ComprehensiveDietChart[]>(() => {
    const saved = localStorage.getItem('hms_diet_charts_v3');
    return saved ? JSON.parse(saved) : INITIAL_DIET_CHARTS;
  });

  const [doctorOrders, setDoctorOrders] = useState<DoctorDietOrder[]>(() => {
    const saved = localStorage.getItem('hms_diet_doctor_orders_v3');
    return saved ? JSON.parse(saved) : INITIAL_DOCTOR_ORDERS;
  });

  const [assessments, setAssessments] = useState<NutritionAssessmentRecord[]>(() => {
    const saved = localStorage.getItem('hms_diet_assessments_v3');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [mealDeliveries, setMealDeliveries] = useState<MealDeliveryRecord[]>(() => {
    const saved = localStorage.getItem('hms_diet_meal_deliveries_v3');
    return saved ? JSON.parse(saved) : INITIAL_MEAL_DELIVERIES;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('hms_diet_food_items_v3', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('hms_diet_charts_v3', JSON.stringify(dietCharts));
    window.dispatchEvent(new CustomEvent('hms_storage_updated'));
  }, [dietCharts]);

  useEffect(() => {
    localStorage.setItem('hms_diet_doctor_orders_v3', JSON.stringify(doctorOrders));
  }, [doctorOrders]);

  useEffect(() => {
    localStorage.setItem('hms_diet_assessments_v3', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('hms_diet_meal_deliveries_v3', JSON.stringify(mealDeliveries));
    window.dispatchEvent(new CustomEvent('hms_storage_updated'));
  }, [mealDeliveries]);

  // -------------------------------------------------------------
  // ALLERGEN CONFLICT DETECTOR
  // -------------------------------------------------------------
  const checkAllergyConflicts = (selectedFoodItemIds: string[], patientAllergies: string[]): string[] => {
    const conflicts: string[] = [];
    if (!patientAllergies || patientAllergies.length === 0) return conflicts;

    selectedFoodItemIds.forEach(fId => {
      const food = foodItems.find(f => f.id === fId);
      if (food && food.allergens) {
        food.allergens.forEach(allergen => {
          const match = patientAllergies.some(
            pa => pa.toLowerCase().includes(allergen.toLowerCase()) || allergen.toLowerCase().includes(pa.toLowerCase())
          );
          if (match) {
            conflicts.push(`Food "${food.name}" contains ${allergen} which conflicts with patient allergy "${allergen}"`);
          }
        });
      }
    });

    return conflicts;
  };

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------
  const createDietChart = (chartData: Omit<ComprehensiveDietChart, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    const newId = `dc-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const allFoodIds: string[] = [];
    chartData.mealSchedules.forEach(ms => {
      ms.foodItems.forEach(fi => allFoodIds.push(fi.foodItemId));
    });

    const conflicts = checkAllergyConflicts(allFoodIds, chartData.allergies);

    const newChart: ComprehensiveDietChart = {
      ...chartData,
      id: newId,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    setDietCharts(prev => [
      newChart,
      ...prev.map(dc => (dc.admissionId === chartData.admissionId && dc.status === 'active' ? { ...dc, status: 'modified' as DietStatus, updatedAt: now } : dc)),
    ]);

    // Automatically generate today's meal schedule records if meal deliveries don't exist yet
    const today = now.slice(0, 10);
    const newDeliveries: MealDeliveryRecord[] = chartData.mealSchedules.map((slot, idx) => ({
      id: `md-${Date.now().toString().slice(-4)}-${idx}`,
      dietChartId: newId,
      admissionId: chartData.admissionId,
      patientId: chartData.patientId,
      patientName: chartData.patientName,
      bedNumber: chartData.bedNumber,
      ward: chartData.ward,
      mealType: slot.mealType,
      date: today,
      scheduledTime: slot.scheduledTime,
      status: 'scheduled',
      kitchenStaff: 'Chef Ramesh',
    }));

    setMealDeliveries(prev => [...newDeliveries, ...prev]);

    return { chartId: newId, hasAllergyConflict: conflicts.length > 0, conflicts };
  };

  const updateDietChart = (id: string, updates: Partial<ComprehensiveDietChart>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setDietCharts(prev => prev.map(dc => (dc.id === id ? { ...dc, ...updates, updatedAt: now } : dc)));
  };

  const modifyDietChart = (id: string, newChartData: Partial<ComprehensiveDietChart>, reason: string, modifierName: string) => {
    const existing = dietCharts.find(dc => dc.id === id);
    if (!existing) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newVersionId = `dc-${Date.now().toString().slice(-4)}`;

    const modifiedVersion: ComprehensiveDietChart = {
      ...existing,
      ...newChartData,
      id: newVersionId,
      version: existing.version + 1,
      previousVersionId: existing.id,
      modificationReason: reason,
      dietitianName: modifierName,
      status: 'active',
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    setDietCharts(prev => [
      modifiedVersion,
      ...prev.map(dc => (dc.id === id ? { ...dc, status: 'modified' as DietStatus, updatedAt: now } : dc)),
    ]);
  };

  const recordNutritionAssessment = (assessment: Omit<NutritionAssessmentRecord, 'id' | 'createdAt' | 'bmi' | 'nutritionalRisk'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const heightM = assessment.heightCm / 100;
    const bmi = Number((assessment.weightKg / (heightM * heightM)).toFixed(1));

    let nutritionalRisk: 'low' | 'moderate' | 'high' = 'low';
    if (bmi < 18.5 || assessment.appetite === 'anorexic' || assessment.swallowingDifficulty) {
      nutritionalRisk = 'high';
    } else if (bmi < 20 || bmi > 30 || assessment.appetite === 'poor') {
      nutritionalRisk = 'moderate';
    }

    const newRecord: NutritionAssessmentRecord = {
      ...assessment,
      id: `na-${Date.now().toString().slice(-4)}`,
      bmi,
      nutritionalRisk,
      createdAt: now,
    };

    setAssessments(prev => [newRecord, ...prev]);
  };

  const updateMealStatus = (deliveryId: string, status: MealStatus, staffName?: string, remarks?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setMealDeliveries(prev =>
      prev.map(md => {
        if (md.id === deliveryId) {
          return {
            ...md,
            status,
            deliveredTime: status === 'delivered' || status === 'served' || status === 'consumed' ? now.slice(11, 16) : md.deliveredTime,
            deliveryStaff: staffName || md.deliveryStaff,
            remarks: remarks || md.remarks,
          };
        }
        return md;
      })
    );
  };

  const recordMealConsumption = (
    deliveryId: string,
    consumptionStatus: 'fully_consumed' | 'partially_consumed' | 'not_consumed',
    patientFeedback?: string,
    foodProblem?: string,
    remarks?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const mealStatus: MealStatus =
      consumptionStatus === 'fully_consumed'
        ? 'consumed'
        : consumptionStatus === 'partially_consumed'
        ? 'partially_consumed'
        : 'missed';

    setMealDeliveries(prev =>
      prev.map(md => {
        if (md.id === deliveryId) {
          return {
            ...md,
            status: mealStatus,
            consumptionStatus,
            patientFeedback: patientFeedback || md.patientFeedback,
            foodProblem: foodProblem || md.foodProblem,
            remarks: remarks || md.remarks,
            deliveredTime: md.deliveredTime || now.slice(11, 16),
          };
        }
        return md;
      })
    );
  };

  const addFoodItem = (item: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...item,
      id: `fi-${Date.now().toString().slice(-4)}`,
    };
    setFoodItems(prev => [...prev, newItem]);
  };

  const updateFoodItem = (id: string, updates: Partial<FoodItem>) => {
    setFoodItems(prev => prev.map(fi => (fi.id === id ? { ...fi, ...updates } : fi)));
  };

  const toggleFoodItemStatus = (id: string) => {
    setFoodItems(prev => prev.map(fi => (fi.id === id ? { ...fi, isActive: !fi.isActive } : fi)));
  };

  // -------------------------------------------------------------
  // DYNAMIC 6 ESSENTIAL KPIS (Active Plans, Today's Meals, Pending, Missed, Special Diets, Review Due)
  // -------------------------------------------------------------
  const kpis: DietDashboardKPIs = useMemo(() => {
    const activeAdms = admissions.filter(a => a.status === 'active');
    const totalInpatients = activeAdms.length;
    const activeCharts = dietCharts.filter(dc => dc.status === 'active');
    const activeDietPlans = activeCharts.length;
    const todayScheduledMeals = mealDeliveries.length;
    const pendingMeals = mealDeliveries.filter(m => m.status === 'scheduled' || m.status === 'pending' || m.status === 'preparing' || m.status === 'ready').length;
    const missedMeals = mealDeliveries.filter(m => m.consumptionStatus === 'not_consumed' || m.status === 'missed' || m.status === 'refused').length;
    const specialDietPatients = activeCharts.filter(dc => dc.dietType !== 'regular').length;

    // Patients requiring review: new orders, pending assessment, or review date today/past
    const patientsRequiringReview = activeAdms.filter(adm => {
      const chart = dietCharts.find(c => c.admissionId === adm.id && c.status === 'active');
      const hasOrder = doctorOrders.some(o => o.admissionId === adm.id && o.status === 'new');
      const hasAssessment = assessments.some(a => a.admissionId === adm.id);
      return !chart || hasOrder || !hasAssessment;
    }).length;

    return {
      activeDietPlans,
      todayScheduledMeals,
      pendingMeals,
      missedMeals,
      specialDietPatients,
      patientsRequiringReview,
      totalInpatients,
      patientsWithDiet: activeDietPlans,
      dietPendingApproval: doctorOrders.filter(o => o.status === 'new').length,
      dietApproved: activeDietPlans,
      dietChangesToday: dietCharts.filter(dc => dc.status === 'modified').length,
      specialDietCount: specialDietPatients,
      allergyCount: activeCharts.filter(dc => dc.allergies && dc.allergies.length > 0).length,
      mealsPending: pendingMeals,
      mealsServed: mealDeliveries.filter(m => m.status === 'served' || m.status === 'consumed').length,
      mealsCancelled: missedMeals,
    };
  }, [admissions, dietCharts, mealDeliveries, doctorOrders, assessments]);

  return (
    <DietContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedAdmissionId,
        setSelectedAdmissionId,
        admissions,
        beds,
        wards,
        patients,
        doctors,
        foodItems,
        dietCharts,
        doctorOrders,
        assessments,
        mealDeliveries,
        kpis,
        createDietChart,
        updateDietChart,
        modifyDietChart,
        recordNutritionAssessment,
        updateMealStatus,
        recordMealConsumption,
        addFoodItem,
        updateFoodItem,
        toggleFoodItemStatus,
        checkAllergyConflicts,
      }}
    >
      {children}
    </DietContext.Provider>
  );
}

export function useDiet() {
  const context = useContext(DietContext);
  if (!context) {
    throw new Error('useDiet must be used within a DietProvider');
  }
  return context;
}
