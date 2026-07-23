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
