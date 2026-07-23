export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Insurance {
  hasInsurance: boolean;
  provider: string;
  policyNumber: string;
}

export interface MedicationReminder {
  medicationName: string;
  frequency: string;
  startTime: string;
  timesPerDay: string[];
  durationDays: number;
  startDate: string;
  endDate: string;
  notes?: string;
  active: boolean;
}

export interface Patient {
  id: string;
  cardNumber: string;
  mrn: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  photoUrl: string;
  fingerprintPlaceholder: boolean;
  emergencyContact: EmergencyContact;
  occupation: string;
  religion: string;
  nationality: string;
  bloodGroup: string;
  weight: number;
  height: number;
  bmi: number;
  email: string;
  insurance: Insurance;
  paymentMethod: string;
  referralSource: string;
  guardian: string;
  maritalStatus: string;
  nextOfKin: string;
  registrationDate: string;
  medicationReminder?: MedicationReminder;
}

export interface DoctorConsultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  doctorName: string;
  vitals: {
    bp: string;
    temperature: string;
    pulse: string;
    weight: number;
    height: number;
    bmi: number;
  };
  symptoms: string;
  diagnosis: string;
  prescriptions: Array<{
    drugName: string;
    dosage: string;
    durationDays: number;
    notes: string;
  }>;
  followUpDate?: string;
  status: "In Progress" | "Completed" | "Pending Lab";
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  category: string;
  requestDate: string;
  status: "Requested" | "In Progress" | "Completed";
  result?: string;
  normalRange?: string;
  unit?: string;
  performedBy?: string;
  notes?: string;
  cost: number;
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: "Dawa za Asili" | "Mafuta" | "Unga wa Miti" | "Tiba Lishe" | "Tablets" | "Syrup";
  quantity: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  expiryDate: string;
  minStockLevel: number;
}

export interface PharmacySale {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  items: Array<{
    itemName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  grandTotal: number;
  paymentMethod: string;
  receiptNumber: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  status: "Paid" | "Pending" | "Partial";
  paymentMethod: string;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  stock: number;
  coverUrl?: string;
  description: string;
}

export interface StaffUser {
  id: string;
  name: string;
  role: "Doctor" | "Nurse" | "Pharmacist" | "Lab Tech" | "Receptionist" | "Admin";
  phone: string;
  email: string;
  status: "Active" | "Inactive";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

