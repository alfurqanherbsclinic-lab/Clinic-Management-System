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
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  occupation: string;
  religion: string;
  nationality: string;
  bloodGroup: string;
  weight: number;
  height: number;
  bmi: number;
  email: string;
  insurance: {
    hasInsurance: boolean;
    provider: string;
    policyNumber: string;
  };
  paymentMethod: string;
  referralSource: string;
  guardian: string;
  maritalStatus: string;
  nextOfKin: string;
  registrationDate: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  history: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescription: string;
  labResults: string;
  radiology: string;
  allergies: string;
  pastHistory: string;
  familyHistory: string;
  clinicalNotes: string;
  soapNotes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  temperature: number;
  bp: string;
  pulse: number;
  respiration: number;
  weight: number;
  height: number;
  bmi: number;
  doctorNotes: string;
  diagnosis: string;
  icdCode: string;
  prescription: string;
  advice: string;
  followUpDate: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  qty: number;
  batchNumber: string;
  expiryDate: string;
  supplier: string;
  lowStockAlert: number;
}

export interface LabRecord {
  id: string;
  patientId: string;
  patientName: string;
  testType: "CBC" | "Malaria" | "Urine" | "Stool" | "Blood Sugar" | "Liver Function" | "Kidney Function";
  results: { [key: string]: string };
  status: "Pending" | "Completed";
  doctorReview: string;
  reviewer: string;
  date: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  date: string;
  time: string;
  queueNumber: number;
  status: "Scheduled" | "In Consultation" | "Completed" | "Cancelled";
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: { description: string; amount: number }[];
  discount: number;
  insuranceProvider: string;
  paymentMethod: "Cash" | "Bank" | "Mobile Money" | "Insurance";
  controlNumber: string;
  status: "Paid" | "Pending";
  total: number;
  netAmount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Asset" | "Equipment" | "Consumable";
  quantity: number;
  status: "Good" | "Requires Maintenance" | "Out of Order";
  supplier: string;
  purchaseDate: string;
}

export interface Staff {
  id: string;
  name: string;
  role: "Doctor" | "Nurse" | "Receptionist" | "Cashier" | "Pharmacist" | "Lab Technician" | "Administrator";
  phone: string;
  attendance: "Present" | "Absent" | "Late" | "On Leave";
  payrollSalary: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  ipAddress: string;
}
