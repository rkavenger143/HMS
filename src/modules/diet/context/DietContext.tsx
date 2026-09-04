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
// SEED FOOD MASTER ITEMS
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
];

// -------------------------------------------------------------
// SEED DIET CHARTS
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
    mealFrequency: '6 Meals / Day (Fractionated)',
    estimatedCalories: 1600,
    proteinGrams: 65,
    carbsGrams: 180,
    fatGrams: 40,
    fluidRequirementMl: 2000,
    restrictions: ['Refined Sugar', 'High GI Fruits', 'Deep Fried Foods'],
    allergies: ['Peanuts'],
    specialInstructions: 'Strictly no added sugar or fruit juice. Check postprandial blood sugar 2h after lunch.',
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
        foodItems: [{ foodItemId: 'fi-012', foodName: 'Warm Methi Seed Water', portion: '1 Glass (200ml)', calories: 15 }],
        specialInstructions: 'Empty stomach',
      },
      {
        id: 'ms-2',
        mealType: 'breakfast',
        scheduledTime: '08:30',
        foodItems: [
          { foodItemId: 'fi-001', foodName: 'Oatmeal Porridge', portion: '1 Bowl (200g)', calories: 150 },
          { foodItemId: 'fi-002', foodName: 'Boiled Egg Whites', portion: '2 pcs', calories: 34 },
        ],
        specialInstructions: 'Sugar-free preparation',
      },
      {
        id: 'ms-3',
        mealType: 'mid_morning',
        scheduledTime: '11:00',
        foodItems: [{ foodItemId: 'fi-008', foodName: 'Papaya Cubes', portion: '1 Bowl (150g)', calories: 60 }],
      },
      {
        id: 'ms-4',
        mealType: 'lunch',
        scheduledTime: '13:00',
        foodItems: [
          { foodItemId: 'fi-011', foodName: 'Whole Wheat Phulka Roti', portion: '2 pcs', calories: 160 },
          { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl', calories: 65 },
          { foodItemId: 'fi-005', foodName: 'Low-Fat Curd', portion: '1 Cup', calories: 95 },
        ],
      },
      {
        id: 'ms-5',
        mealType: 'evening_snack',
        scheduledTime: '16:30',
        foodItems: [{ foodItemId: 'fi-007', foodName: 'Clear Vegetable Broth', portion: '1 Cup (200ml)', calories: 30 }],
      },
      {
        id: 'ms-6',
        mealType: 'dinner',
        scheduledTime: '19:30',
        foodItems: [
          { foodItemId: 'fi-003', foodName: 'Moong Dal Khichdi', portion: '1 Bowl (250g)', calories: 220 },
          { foodItemId: 'fi-006', foodName: 'Steamed Seasonal Veggies', portion: '1 Bowl', calories: 65 },
        ],
        specialInstructions: 'Light dinner before 20:00',
      },
    ],
  },
  {
    id: 'dc-002',
    admissionId: 'adm-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    doctorName: 'Dr. Sarah Khan',
    dietitianId: 'dt-002',
    dietitianName: 'Dietitian Rohan Mehta',
    dietType: 'npo',
    dietConsistency: 'npo',
    feedingMethod: 'npo',
    mealFrequency: 'Nil Per Os',
    estimatedCalories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
    restrictions: ['NPO - Nothing by mouth', 'No oral fluids'],
    allergies: ['Penicillin', 'Shellfish'],
    specialInstructions: 'Strict NPO prior to Emergency Exploratory Laparotomy at 16:00. Maintain IV crystalloids.',
    status: 'active',
    version: 1,
    approvedBy: 'Dr. Sarah Khan',
    approvedAt: '2026-08-31 06:00',
    createdAt: '2026-08-31 06:00',
    updatedAt: '2026-08-31 06:00',
    mealSchedules: [],
  },
  {
    id: 'dc-003',
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
    mealFrequency: '5 Meals / Day',
    estimatedCalories: 1500,
    proteinGrams: 60,
    carbsGrams: 200,
    fatGrams: 30,
    fluidRequirementMl: 1500,
    restrictions: ['Low Sodium (<2g/day)', 'Low Saturated Fat', 'Caffeine Restricted'],
    allergies: ['Dust', 'Sulfa Drugs'],
    specialInstructions: 'Strict low-salt cardiac diet. Measure daily 24h fluid intake strictly.',
    status: 'active',
    version: 1,
    approvedBy: 'Dietitian Shalini Gupta, RD',
    approvedAt: '2026-08-29 14:00',
    createdAt: '2026-08-29 11:30',
    updatedAt: '2026-08-29 14:00',
    mealSchedules: [
      {
        id: 'ms-31',
        mealType: 'breakfast',
        scheduledTime: '08:30',
        foodItems: [
          { foodItemId: 'fi-001', foodName: 'Oatmeal with Skimmed Milk', portion: '1 Bowl', calories: 150 },
          { foodItemId: 'fi-008', foodName: 'Papaya Slices', portion: '1 Bowl', calories: 60 },
        ],
      },
      {
        id: 'ms-32',
        mealType: 'lunch',
        scheduledTime: '13:00',
        foodItems: [
          { foodItemId: 'fi-003', foodName: 'Moong Dal Khichdi (Low Salt)', portion: '1 Bowl', calories: 220 },
          { foodItemId: 'fi-006', foodName: 'Steamed Veggies', portion: '1 Bowl', calories: 65 },
        ],
      },
      {
        id: 'ms-33',
        mealType: 'dinner',
        scheduledTime: '19:30',
        foodItems: [
          { foodItemId: 'fi-011', foodName: 'Phulka Roti', portion: '2 pcs', calories: 160 },
          { foodItemId: 'fi-006', foodName: 'Steamed Veggies', portion: '1 Bowl', calories: 65 },
          { foodItemId: 'fi-005', foodName: 'Low-Fat Curd', portion: '1 Cup', calories: 95 },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------
// SEED DOCTOR DIET ORDERS
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
    instructions: '1600 kcal ADA diabetic diet with high fiber and low glycemic load. Avoid simple carbohydrates.',
    priority: 'routine',
    isNPO: false,
    orderDate: '2026-08-30 08:30',
    status: 'completed',
    acknowledgedBy: 'Dietitian Shalini Gupta, RD',
    acknowledgedAt: '2026-08-30 09:00',
  },
  {
    id: 'ddo-002',
    admissionId: 'adm-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    doctorId: 'doc-002',
    doctorName: 'Dr. Sarah Khan',
    requestedDietType: 'npo',
    instructions: 'Strict NPO post-midnight for abdominal surgery.',
    priority: 'stat',
    isNPO: true,
    npoReason: 'Pre-operative fasting for Exploratory Laparotomy',
    orderDate: '2026-08-31 05:45',
    status: 'completed',
    acknowledgedBy: 'Dietitian Rohan Mehta',
    acknowledgedAt: '2026-08-31 06:00',
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
    instructions: 'Post-op orthopedic fracture healing diet: High protein (1.5g/kg) and calcium rich.',
    priority: 'urgent',
    isNPO: false,
    orderDate: '2026-09-02 09:15',
    status: 'new',
  },
];

// -------------------------------------------------------------
// SEED NUTRITION ASSESSMENTS
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
    dietaryHistory: 'Vegetarian, irregular meal times, high tea intake with sugar',
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
    dietaryHistory: 'Cardiac history, salt sensitivity, mild pedal edema',
    notes: 'Needs small frequent meals to prevent postprandial cardiac stress.',
    createdAt: '2026-08-29 11:00',
  },
];

// -------------------------------------------------------------
// SEED MEAL DELIVERIES
// -------------------------------------------------------------
const INITIAL_MEAL_DELIVERIES: MealDeliveryRecord[] = [
  {
    id: 'md-001',
    dietChartId: 'dc-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    mealType: 'breakfast',
    date: '2026-09-02',
    scheduledTime: '08:30',
    status: 'served',
    deliveredTime: '08:25',
    kitchenStaff: 'Chef Ramesh',
    deliveryStaff: 'Suresh Kumar',
    remarks: 'Tray delivered and consumed fully.',
  },
  {
    id: 'md-002',
    dietChartId: 'dc-001',
    admissionId: 'adm-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    mealType: 'lunch',
    date: '2026-09-02',
    scheduledTime: '13:00',
    status: 'ready',
    kitchenStaff: 'Chef Ramesh',
    remarks: 'Tray plated in heated food cart.',
  },
  {
    id: 'md-003',
    dietChartId: 'dc-003',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    bedNumber: 'PW-101',
    ward: 'Private Ward',
    mealType: 'breakfast',
    date: '2026-09-02',
    scheduledTime: '08:30',
    status: 'served',
    deliveredTime: '08:30',
    kitchenStaff: 'Chef Ramesh',
    deliveryStaff: 'Suresh Kumar',
  },
  {
    id: 'md-004',
    dietChartId: 'dc-003',
    admissionId: 'adm-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    bedNumber: 'PW-101',
    ward: 'Private Ward',
    mealType: 'lunch',
    date: '2026-09-02',
    scheduledTime: '13:00',
    status: 'preparing',
    kitchenStaff: 'Chef Ramesh',
  },
];

// -------------------------------------------------------------
// SEED NPO PATIENTS
// -------------------------------------------------------------
const INITIAL_NPO_PATIENTS: NPOPatientRecord[] = [
  {
    id: 'npo-001',
    admissionId: 'adm-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    doctorName: 'Dr. Sarah Khan',
    startDateTime: '2026-08-31 06:00',
    endDateTime: '2026-09-02 18:00',
    reason: 'Pre-operative fasting for Exploratory Laparotomy',
    orderedBy: 'Dr. Sarah Khan',
    status: 'active',
  },
];

// -------------------------------------------------------------
// SEED DIET ALERTS
// -------------------------------------------------------------
const INITIAL_DIET_ALERTS: DietAlert[] = [
  {
    id: 'da-001',
    admissionId: 'adm-004',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    bedNumber: 'GW-02',
    alertType: 'new_order',
    priority: 'high',
    message: 'New Urgent Doctor Order: High Protein fracture healing diet requested by Dr. Amit Trivedi.',
    timestamp: '2026-09-02 09:15',
    status: 'new',
  },
  {
    id: 'da-002',
    admissionId: 'adm-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    alertType: 'npo_patient',
    priority: 'critical',
    message: 'Patient is STRICT NPO. Kitchen tray generation blocked.',
    timestamp: '2026-08-31 06:00',
    status: 'acknowledged',
    acknowledgedBy: 'Dietitian Rohan Mehta',
  },
];

// -------------------------------------------------------------
// CONTEXT INTERFACE
// -------------------------------------------------------------
export type DietTab =
  | 'dashboard'
  | 'patient_diets'
  | 'patient_profile'
  | 'create_diet'
  | 'nutrition_assessment'
  | 'doctor_orders'
  | 'daily_meal_plans'
  | 'kitchen_service'
  | 'meal_delivery'
  | 'meal_refusals'
  | 'npo_management'
  | 'food_items'
  | 'allergies_restrictions'
  | 'diet_history'
  | 'dietitian_management'
  | 'alerts'
  | 'analytics'
  | 'reports'
  | 'settings';

interface DietContextType {
  // Navigation & Selection
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
  npoPatients: NPOPatientRecord[];
  dietAlerts: DietAlert[];
  kpis: DietDashboardKPIs;

  // Actions
  createDietChart: (chart: Omit<ComprehensiveDietChart, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => { chartId: string; hasAllergyConflict: boolean; conflicts: string[] };
  updateDietChart: (id: string, updates: Partial<ComprehensiveDietChart>) => void;
  approveDietChart: (id: string, approvedBy: string) => void;
  modifyDietChart: (id: string, newChartData: Partial<ComprehensiveDietChart>, reason: string, modifierName: string) => void;
  recordNutritionAssessment: (assessment: Omit<NutritionAssessmentRecord, 'id' | 'createdAt' | 'bmi' | 'nutritionalRisk'>) => void;
  createDoctorDietOrder: (order: Omit<DoctorDietOrder, 'id' | 'orderDate' | 'status'>) => void;
  acknowledgeDietOrder: (orderId: string, dietitianName: string) => void;
  completeDietOrder: (orderId: string) => void;
  updateMealStatus: (deliveryId: string, status: MealStatus, staffName?: string, remarks?: string) => void;
  recordMealRefusal: (deliveryId: string, reason: string, remarks?: string) => void;
  setNPOStatus: (admissionId: string, reason: string, doctorName: string, endDateTime?: string) => void;
  clearNPOStatus: (admissionId: string) => void;
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  toggleFoodItemStatus: (id: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
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
    const saved = localStorage.getItem('hms_diet_food_items');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_ITEMS;
  });

  const [dietCharts, setDietCharts] = useState<ComprehensiveDietChart[]>(() => {
    const saved = localStorage.getItem('hms_diet_charts');
    return saved ? JSON.parse(saved) : INITIAL_DIET_CHARTS;
  });

  const [doctorOrders, setDoctorOrders] = useState<DoctorDietOrder[]>(() => {
    const saved = localStorage.getItem('hms_diet_doctor_orders');
    return saved ? JSON.parse(saved) : INITIAL_DOCTOR_ORDERS;
  });

  const [assessments, setAssessments] = useState<NutritionAssessmentRecord[]>(() => {
    const saved = localStorage.getItem('hms_diet_assessments');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [mealDeliveries, setMealDeliveries] = useState<MealDeliveryRecord[]>(() => {
    const saved = localStorage.getItem('hms_diet_meal_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_MEAL_DELIVERIES;
  });

  const [npoPatients, setNpoPatients] = useState<NPOPatientRecord[]>(() => {
    const saved = localStorage.getItem('hms_diet_npo_patients');
    return saved ? JSON.parse(saved) : INITIAL_NPO_PATIENTS;
  });

  const [dietAlerts, setDietAlerts] = useState<DietAlert[]>(() => {
    const saved = localStorage.getItem('hms_diet_alerts');
    return saved ? JSON.parse(saved) : INITIAL_DIET_ALERTS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('hms_diet_food_items', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('hms_diet_charts', JSON.stringify(dietCharts));
  }, [dietCharts]);

  useEffect(() => {
    localStorage.setItem('hms_diet_doctor_orders', JSON.stringify(doctorOrders));
  }, [doctorOrders]);

  useEffect(() => {
    localStorage.setItem('hms_diet_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('hms_diet_meal_deliveries', JSON.stringify(mealDeliveries));
  }, [mealDeliveries]);

  useEffect(() => {
    localStorage.setItem('hms_diet_npo_patients', JSON.stringify(npoPatients));
  }, [npoPatients]);

  useEffect(() => {
    localStorage.setItem('hms_diet_alerts', JSON.stringify(dietAlerts));
  }, [dietAlerts]);

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
          const match = patientAllergies.some(pa => pa.toLowerCase().includes(allergen.toLowerCase()) || allergen.toLowerCase().includes(pa.toLowerCase()));
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

    // Extract all food item IDs from meal schedules
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

    // If another active diet exists for this admission, mark it modified/discontinued
    setDietCharts(prev => [
      newChart,
      ...prev.map(dc => (dc.admissionId === chartData.admissionId && dc.status === 'active' ? { ...dc, status: 'modified' as DietStatus, updatedAt: now } : dc))
    ]);

    if (conflicts.length > 0) {
      const alertId = `da-${Date.now()}`;
      setDietAlerts(prev => [
        {
          id: alertId,
          admissionId: chartData.admissionId,
          patientId: chartData.patientId,
          patientName: chartData.patientName,
          bedNumber: chartData.bedNumber,
          alertType: 'allergy_conflict',
          priority: 'critical',
          message: `Allergy Conflict in Diet Chart: ${conflicts[0]}`,
          timestamp: now,
          status: 'new',
        },
        ...prev,
      ]);
    }

    return { chartId: newId, hasAllergyConflict: conflicts.length > 0, conflicts };
  };

  const updateDietChart = (id: string, updates: Partial<ComprehensiveDietChart>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setDietCharts(prev => prev.map(dc => (dc.id === id ? { ...dc, ...updates, updatedAt: now } : dc)));
  };

  const approveDietChart = (id: string, approvedBy: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setDietCharts(prev => prev.map(dc => (dc.id === id ? { ...dc, status: 'approved' as DietStatus, approvedBy, approvedAt: now, updatedAt: now } : dc)));
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
      ...prev.map(dc => (dc.id === id ? { ...dc, status: 'modified' as DietStatus, updatedAt: now } : dc))
    ]);

    setDietAlerts(prev => [
      {
        id: `da-${Date.now()}`,
        admissionId: existing.admissionId,
        patientId: existing.patientId,
        patientName: existing.patientName,
        bedNumber: existing.bedNumber,
        alertType: 'diet_modified',
        priority: 'medium',
        message: `Diet modified by ${modifierName} (Reason: ${reason}). Version ${modifiedVersion.version} created.`,
        timestamp: now,
        status: 'new',
      },
      ...prev,
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

  const createDoctorDietOrder = (order: Omit<DoctorDietOrder, 'id' | 'orderDate' | 'status'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newOrder: DoctorDietOrder = {
      ...order,
      id: `ddo-${Date.now().toString().slice(-4)}`,
      orderDate: now,
      status: 'new',
    };

    setDoctorOrders(prev => [newOrder, ...prev]);

    setDietAlerts(prev => [
      {
        id: `da-${Date.now()}`,
        admissionId: order.admissionId,
        patientId: order.patientId,
        patientName: order.patientName,
        bedNumber: order.bedNumber,
        alertType: 'new_order',
        priority: order.priority === 'stat' ? 'critical' : order.priority === 'urgent' ? 'high' : 'medium',
        message: `Doctor Diet Order from ${order.doctorName}: ${order.requestedDietType.toUpperCase()} ${order.isNPO ? '(NPO)' : ''}`,
        timestamp: now,
        status: 'new',
      },
      ...prev,
    ]);
  };

  const acknowledgeDietOrder = (orderId: string, dietitianName: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setDoctorOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'acknowledged', acknowledgedBy: dietitianName, acknowledgedAt: now } : o)));
  };

  const completeDietOrder = (orderId: string) => {
    setDoctorOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'completed' } : o)));
  };

  const updateMealStatus = (deliveryId: string, status: MealStatus, staffName?: string, remarks?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setMealDeliveries(prev => prev.map(md => {
      if (md.id === deliveryId) {
        return {
          ...md,
          status,
          deliveredTime: status === 'served' || status === 'delivered' ? now.slice(11, 16) : md.deliveredTime,
          deliveryStaff: staffName || md.deliveryStaff,
          remarks: remarks || md.remarks,
        };
      }
      return md;
    }));
  };

  const recordMealRefusal = (deliveryId: string, reason: string, remarks?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const meal = mealDeliveries.find(m => m.id === deliveryId);

    setMealDeliveries(prev => prev.map(md => (md.id === deliveryId ? { ...md, status: 'refused' as MealStatus, refusalReason: reason, remarks: remarks || md.remarks } : md)));

    if (meal) {
      setDietAlerts(prev => [
        {
          id: `da-${Date.now()}`,
          admissionId: meal.admissionId,
          patientId: meal.patientId,
          patientName: meal.patientName,
          bedNumber: meal.bedNumber,
          alertType: 'meal_refused',
          priority: 'high',
          message: `Meal Refusal: ${meal.patientName} (${meal.mealType}) refused meal due to "${reason}".`,
          timestamp: now,
          status: 'new',
        },
        ...prev,
      ]);
    }
  };

  const setNPOStatus = (admissionId: string, reason: string, doctorName: string, endDateTime?: string) => {
    const adm = admissions.find(a => a.id === admissionId);
    if (!adm) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newNPO: NPOPatientRecord = {
      id: `npo-${Date.now().toString().slice(-4)}`,
      admissionId,
      patientId: adm.patientId,
      patientName: adm.patientName,
      bedNumber: adm.bedNumber,
      ward: adm.ward,
      doctorName,
      startDateTime: now,
      endDateTime,
      reason,
      orderedBy: doctorName,
      status: 'active',
    };

    setNpoPatients(prev => [newNPO, ...prev.filter(n => n.admissionId !== admissionId)]);

    // Cancel pending meal deliveries for this patient
    setMealDeliveries(prev => prev.map(md => (md.admissionId === admissionId && (md.status === 'pending' || md.status === 'preparing') ? { ...md, status: 'cancelled' as MealStatus, remarks: `Cancelled: Patient NPO (${reason})` } : md)));

    // Trigger high-priority alert
    setDietAlerts(prev => [
      {
        id: `da-${Date.now()}`,
        admissionId,
        patientId: adm.patientId,
        patientName: adm.patientName,
        bedNumber: adm.bedNumber,
        alertType: 'npo_patient',
        priority: 'critical',
        message: `PATIENT PLACED ON STRICT NPO by ${doctorName}: ${reason}`,
        timestamp: now,
        status: 'new',
      },
      ...prev,
    ]);
  };

  const clearNPOStatus = (admissionId: string) => {
    setNpoPatients(prev => prev.map(n => (n.admissionId === admissionId ? { ...n, status: 'completed' as const } : n)));
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

  const acknowledgeAlert = (alertId: string) => {
    setDietAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, status: 'acknowledged' } : a)));
  };

  const resolveAlert = (alertId: string) => {
    setDietAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, status: 'resolved' } : a)));
  };

  // -------------------------------------------------------------
  // DYNAMIC KPIS
  // -------------------------------------------------------------
  const kpis: DietDashboardKPIs = useMemo(() => {
    const totalInpatients = admissions.filter(a => a.status === 'active').length;
    const activeCharts = dietCharts.filter(dc => dc.status === 'active');
    const patientsWithDiet = activeCharts.length;
    const dietPendingApproval = dietCharts.filter(dc => dc.status === 'pending_review' || dc.status === 'draft').length;
    const dietApproved = activeCharts.length;
    const dietChangesToday = dietCharts.filter(dc => dc.status === 'modified').length + 1;
    const specialDietCount = activeCharts.filter(dc => dc.dietType !== 'regular').length;
    const allergyCount = activeCharts.filter(dc => dc.allergies && dc.allergies.length > 0).length;
    const mealsPending = mealDeliveries.filter(m => m.status === 'pending' || m.status === 'preparing' || m.status === 'ready').length;
    const mealsServed = mealDeliveries.filter(m => m.status === 'served').length;
    const mealsCancelled = mealDeliveries.filter(m => m.status === 'cancelled' || m.status === 'refused').length;

    return {
      totalInpatients,
      patientsWithDiet,
      dietPendingApproval,
      dietApproved,
      dietChangesToday,
      specialDietCount,
      allergyCount,
      mealsPending,
      mealsServed,
      mealsCancelled,
    };
  }, [admissions, dietCharts, mealDeliveries]);

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
        npoPatients,
        dietAlerts,
        kpis,
        createDietChart,
        updateDietChart,
        approveDietChart,
        modifyDietChart,
        recordNutritionAssessment,
        createDoctorDietOrder,
        acknowledgeDietOrder,
        completeDietOrder,
        updateMealStatus,
        recordMealRefusal,
        setNPOStatus,
        clearNPOStatus,
        addFoodItem,
        updateFoodItem,
        toggleFoodItemStatus,
        acknowledgeAlert,
        resolveAlert,
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
