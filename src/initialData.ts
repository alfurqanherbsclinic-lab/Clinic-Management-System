import { Patient, MedicalRecord, Consultation, Medicine, LabRecord, Appointment, Invoice, InventoryItem, Staff, AuditLog } from "./types";

export const initialPatients: Patient[] = [
  {
    id: "AF-001",
    cardNumber: "AHC-001",
    mrn: "MRN-2026-0001",
    name: "Ali Hassan",
    phone: "0712345678",
    age: 45,
    gender: "Mwanaume",
    address: "Gungu, Kigoma",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    fingerprintPlaceholder: true,
    emergencyContact: {
      name: "Salma Hassan",
      phone: "0712987654",
      relation: "Mke"
    },
    occupation: "Mkulima",
    religion: "Islam",
    nationality: "Tanzanian",
    bloodGroup: "O+",
    weight: 72,
    height: 1.75,
    bmi: 23.5,
    email: "ali.hassan@example.com",
    insurance: {
      hasInsurance: true,
      provider: "NHIF",
      policyNumber: "NHIF-99882211"
    },
    paymentMethod: "Insurance",
    referralSource: "Kipepeo Dispensary",
    guardian: "N/A",
    maritalStatus: "Ndoa",
    nextOfKin: "Salma Hassan (Mke)",
    registrationDate: "2026-06-17"
  },
  {
    id: "AF-002",
    cardNumber: "AHC-002",
    mrn: "MRN-2026-0002",
    name: "Fatma Suleiman",
    phone: "0755555555",
    age: 32,
    gender: "Mwanamke",
    address: "Mwanga, Kigoma",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    fingerprintPlaceholder: false,
    emergencyContact: {
      name: "Suleiman Bakari",
      phone: "0755123456",
      relation: "Baba"
    },
    occupation: "Mwalimu",
    religion: "Islam",
    nationality: "Tanzanian",
    bloodGroup: "A-",
    weight: 60,
    height: 1.62,
    bmi: 22.9,
    email: "fatma.s@example.com",
    insurance: {
      hasInsurance: false,
      provider: "",
      policyNumber: ""
    },
    paymentMethod: "Mobile Money",
    referralSource: "Kujisajili Mwenyewe",
    guardian: "N/A",
    maritalStatus: "Hajaolewa",
    nextOfKin: "Suleiman Bakari (Baba)",
    registrationDate: "2026-06-17"
  },
  {
    id: "AF-003",
    cardNumber: "AHC-003",
    mrn: "MRN-2026-0003",
    name: "Juma Shaban",
    phone: "0766443322",
    age: 28,
    gender: "Mwanaume",
    address: "Gungu, Kigoma",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    fingerprintPlaceholder: true,
    emergencyContact: {
      name: "Shaban Juma",
      phone: "0766998877",
      relation: "Baba"
    },
    occupation: "Mjasiriamali",
    religion: "Islam",
    nationality: "Tanzanian",
    bloodGroup: "B+",
    weight: 68,
    height: 1.70,
    bmi: 23.5,
    email: "juma.shaban@example.com",
    insurance: {
      hasInsurance: false,
      provider: "",
      policyNumber: ""
    },
    paymentMethod: "Cash",
    referralSource: "Tangazo la Radio",
    guardian: "N/A",
    maritalStatus: "Hajaoa",
    nextOfKin: "Shaban Juma (Baba)",
    registrationDate: "2026-07-01"
  }
];

export const initialRecords: MedicalRecord[] = [
  {
    id: "REC-001",
    patientId: "AF-001",
    date: "2026-06-17",
    history: "Mgonjwa ana historia ya Maumivu ya Viungo na uchovu mwilini kwa miezi mitatu iliyopita.",
    diagnosis: "Arthro-rheumatic disorder & General body weakness",
    symptoms: "Maumivu ya viungo vya magoti, bega, uchovu mwingi wakati wa asubuhi.",
    treatment: "Kutumia Mafuta ya Habbat Soda kusugua viungo na kunywa kijiko kimoja asubuhi na jioni.",
    prescription: "1. Habbat Soda Oil (100ml) - Kuchua na Kunywa kijiko 1 x 2\n2. Asali ya Nyuki mweusi (Black Seed Honey) - Kijiko 1 x 3",
    labResults: "Rheumatoid Factor (RF): Elevated, Uric Acid: 6.8 mg/dL (Normal)",
    radiology: "Kuharibika kidogo kwa cartilage kwenye goti la kulia.",
    allergies: "N/A",
    pastHistory: "General Malaria 2025",
    familyHistory: "Historia ya Kisukari kwa Baba yake mzazi.",
    clinicalNotes: "Mgonjwa ameshauriwa kufanya mazoezi mepesi na kuepuka vyakula vyenye sukari nyingi.",
    soapNotes: {
      subjective: "Maumivu makali kwenye joints za magoti",
      objective: "Mgonjwa anatembea kwa shida, kuvimba kiasi kwenye goti la kulia",
      assessment: "Arthro-rheumatic syndrome",
      plan: "Matibabu ya asili na asali pamoja na Habbat Soda, mazoezi ya kunyoosha viungo."
    }
  },
  {
    id: "REC-002",
    patientId: "AF-002",
    date: "2026-06-17",
    history: "Mgonjwa anasumbuliwa na matatizo ya mmeng'enyo wa chakula (acid reflux / kiungulia) na kukosa usingizi.",
    diagnosis: "Gastroesophageal Reflux (GERD) & Insomnia",
    symptoms: "Kuhisi moto kifuani, kukosa usingizi hadi usiku wa manane.",
    treatment: "Unywaji wa mafuta ya Uwatu (Fenugreek) na unga wa Tangawizi kavu na asali ya Al-Furqan.",
    prescription: "1. Al-Furqan Herbs Powder (Fenugreek & Ginger mixture) - Kijiko 1 kwenye maji ya moto x 2\n2. Mafuta ya Zaituni (Olive Oil Extra Virgin) - Kijiko 1 usiku kabla ya kulala",
    labResults: "H. Pylori Test: Negative",
    radiology: "N/A",
    allergies: "Vyakula vyenye pilipili na ndimu",
    pastHistory: "N/A",
    familyHistory: "N/A",
    clinicalNotes: "Aache kula vyakula vya mafuta na vyenye viungo vingi usiku.",
    soapNotes: {
      subjective: "Kiungulia kikali na kukosa usingizi",
      objective: "Kukauka kwa ulimi na uchovu wa macho",
      assessment: "Hyperacidity na anxiety",
      plan: "Lishe mbadala, mafuta ya Zaituni na mchanganyiko wa Uwatu na asali."
    }
  }
];

export const initialConsultations: Consultation[] = [
  {
    id: "CON-001",
    patientId: "AF-001",
    date: "2026-07-13",
    temperature: 36.8,
    bp: "128/82",
    pulse: 74,
    respiration: 18,
    weight: 72,
    height: 1.75,
    bmi: 23.5,
    doctorNotes: "Mgonjwa amepata nafuu kiasi kwenye joints lakini bado anahitaji muendelezo wa lishe bora.",
    diagnosis: "Arthro-rheumatism in progress",
    icdCode: "M19.9",
    prescription: "Habbat Soda oil na Asali ya Al-Furqan",
    advice: "Aendelee na mazoezi na anywe maji ya kutosha (lita 3 kwa siku).",
    followUpDate: "2026-07-27"
  }
];

export const initialMedicines: Medicine[] = [
  { id: "MED-001", name: "Mafuta ya Habbat Soda (100ml)", category: "Mafuta ya Tiba", qty: 45, batchNumber: "B-HB2026", expiryDate: "2027-12-01", supplier: "Al-Furqan Pharmacy Supplies", lowStockAlert: 10 },
  { id: "MED-002", name: "Asali ya Nyuki Mwitu (Black Seed Honey)", category: "Asali & Virutubisho", qty: 32, batchNumber: "B-BH9982", expiryDate: "2028-06-15", supplier: "Kigoma Beekeepers Assoc", lowStockAlert: 5 },
  { id: "MED-003", name: "Unga wa Uwatu (Fenugreek Powder)", category: "Mimea Tiba Kavu", qty: 8, batchNumber: "B-FN3321", expiryDate: "2026-09-30", supplier: "Zanzibar Spice Farms", lowStockAlert: 10 },
  { id: "MED-004", name: "Mafuta ya Zaituni (Extra Virgin Olive Oil)", category: "Mafuta ya Tiba", qty: 60, batchNumber: "B-OL4412", expiryDate: "2027-04-10", supplier: "Al-Furqan Pharmacy Supplies", lowStockAlert: 15 },
  { id: "MED-005", name: "Vidonge vya Mlonge (Moringa Capsules)", category: "Vidonge Lishe", qty: 3, batchNumber: "B-MR8891", expiryDate: "2026-08-15", supplier: "Kilimanjaro Organics", lowStockAlert: 10 }
];

export const initialLabs: LabRecord[] = [
  {
    id: "LAB-001",
    patientId: "AF-001",
    patientName: "Ali Hassan",
    testType: "CBC",
    results: {
      "WBC": "6.5 x10^9/L (Normal: 4.0 - 11.0)",
      "RBC": "4.8 x10^12/L (Normal: 4.5 - 5.9)",
      "Hemoglobin (HB)": "14.2 g/dL (Normal: 13.5 - 17.5)",
      "Platelets": "250 x10^9/L (Normal: 150 - 450)",
      "Lymphocytes": "30% (Normal: 20 - 40%)"
    },
    status: "Completed",
    doctorReview: "CBC ipo katika hali ya kawaida kabisa. Hakuna dalili za maambukizi (Infection).",
    reviewer: "Dr. Khalifa Rehani",
    date: "2026-07-13"
  },
  {
    id: "LAB-002",
    patientId: "AF-002",
    patientName: "Fatma Suleiman",
    testType: "Malaria",
    results: {
      "mRDT Test": "Negative",
      "Blood Smear for MPS": "No Malaria Parasites Seen"
    },
    status: "Completed",
    doctorReview: "Mgonjwa hana vimelea vya malaria.",
    reviewer: "Dr. Khalifa Rehani",
    date: "2026-07-12"
  }
];

export const initialAppointments: Appointment[] = [
  { id: "APT-001", patientId: "AF-001", patientName: "Ali Hassan", patientPhone: "0712345678", doctorName: "Dr. Abdu Khalifa Rehani", date: "2026-07-13", time: "09:00 AM", queueNumber: 1, status: "In Consultation" },
  { id: "APT-002", patientId: "AF-002", patientName: "Fatma Suleiman", patientPhone: "0755555555", doctorName: "Dr. Abdu Khalifa Rehani", date: "2026-07-13", time: "10:30 AM", queueNumber: 2, status: "Scheduled" },
  { id: "APT-003", patientId: "AF-003", patientName: "Juma Shaban", patientPhone: "0766443322", doctorName: "Dr. Abdu Khalifa Rehani", date: "2026-07-13", time: "11:15 AM", queueNumber: 3, status: "Scheduled" }
];

export const initialInvoices: Invoice[] = [
  { id: "INV-2026-0001", patientId: "AF-001", patientName: "Ali Hassan", date: "2026-07-13", items: [{ description: "Sajili & Kadi ya Premium", amount: 20000 }, { description: "Vipimo vya Lab (CBC)", amount: 15000 }, { description: "Mafuta ya Habbat Soda", amount: 15000 }], discount: 5000, insuranceProvider: "NHIF", paymentMethod: "Insurance", controlNumber: "990264789123", status: "Paid", total: 50000, netAmount: 45000 },
  { id: "INV-2026-0002", patientId: "AF-002", patientName: "Fatma Suleiman", date: "2026-07-13", items: [{ description: "Sajili & Kadi ya Premium", amount: 20000 }, { description: "Mafuta ya Zaituni", amount: 12000 }], discount: 0, insuranceProvider: "", paymentMethod: "Mobile Money", controlNumber: "990264115598", status: "Paid", total: 32000, netAmount: 32000 }
];

export const initialInventory: InventoryItem[] = [
  { id: "INV-001", name: "Mashine ya Kupima Presha (Digital BP)", category: "Equipment", quantity: 4, status: "Good", supplier: "Medical Equipment East Africa", purchaseDate: "2025-10-12" },
  { id: "INV-002", name: "Kipimajoto cha Laser (Digital Thermometer)", category: "Equipment", quantity: 6, status: "Good", supplier: "Anudha Ltd Dar", purchaseDate: "2026-02-05" },
  { id: "INV-003", name: "Mizani ya Weight & Height (Stadiometer)", category: "Equipment", quantity: 2, status: "Good", supplier: "Anudha Ltd Dar", purchaseDate: "2025-08-20" },
  { id: "INV-004", name: "Chupa tupu za kuweka Mafuta ya Tiba", category: "Consumable", quantity: 500, status: "Good", supplier: "Kioo Ltd", purchaseDate: "2026-06-01" }
];

export const initialStaff: Staff[] = [
  { id: "STF-001", name: "Abdu Khalifa Rehani", role: "Doctor", phone: "0711223344", attendance: "Present", payrollSalary: 2500000 },
  { id: "STF-002", name: "Halima Juma", role: "Nurse", phone: "0755112233", attendance: "Present", payrollSalary: 1200000 },
  { id: "STF-003", name: "Ramadhan Hamis", role: "Pharmacist", phone: "0766223344", attendance: "Present", payrollSalary: 1500000 },
  { id: "STF-004", name: "Aisha Bakari", role: "Lab Technician", phone: "0788334455", attendance: "Present", payrollSalary: 1400000 },
  { id: "STF-005", name: "Faraji Athumani", role: "Cashier", phone: "0744556677", attendance: "Present", payrollSalary: 950000 },
  { id: "STF-006", name: "Grace Mwita", role: "Receptionist", phone: "0733667788", attendance: "Present", payrollSalary: 850000 }
];

export const initialAuditLogs: AuditLog[] = [
  { id: "LOG-001", timestamp: "2026-07-13 08:30:15", username: "admin", role: "Msimamizi Mkuu", action: "Login Mafanikio", ipAddress: "192.168.1.100" },
  { id: "LOG-002", timestamp: "2026-07-13 08:45:22", username: "admin", role: "Msimamizi Mkuu", action: "Kusajili mgonjwa mpya (Juma Shaban)", ipAddress: "192.168.1.100" }
];
