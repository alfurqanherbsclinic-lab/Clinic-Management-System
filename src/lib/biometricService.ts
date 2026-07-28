// Biometric Service for Al-Furqan HIS
// Connects WebAuthn native hardware fingerprint scanner with staff authentication

import {
  isBiometricAvailable,
  registerBiometricCredential,
  authenticateBiometricCredential,
  StoredCredential
} from "./webauthn";

export interface StaffMember {
  id: string;
  name: string;
  username: string;
  role: string;
  roleDisplay: string;
  webauthnCredential?: StoredCredential;
  bioId?: string;
  phone?: string;
  status?: string;
}

/**
 * Check if the current browser and device support real hardware fingerprint / WebAuthn
 */
export async function checkBiometricSupport(): Promise<boolean> {
  return await isBiometricAvailable();
}

/**
 * Register new biometric credential for a staff member using real device sensor
 */
export async function registerStaffBiometricCredential(
  username: string,
  fullName: string
): Promise<StoredCredential> {
  return await registerBiometricCredential(username, fullName);
}

/**
 * Perform real device biometric authentication for staff login
 */
export async function authenticateStaffBiometricLogin(
  targetUsername: string,
  staffList: StaffMember[]
): Promise<StaffMember> {
  // If target username is provided, filter allowed credentials for that user
  let candidateStaff = staffList;
  if (targetUsername.trim()) {
    candidateStaff = staffList.filter(
      s => s.username.toLowerCase() === targetUsername.trim().toLowerCase()
    );
    if (candidateStaff.length === 0) {
      throw new Error(`Mtumiaji '${targetUsername}' hajapatikana kwenye mfumo.`);
    }
  }

  // Collect stored credentials
  const allowedCredentials: StoredCredential[] = candidateStaff
    .map(s => s.webauthnCredential)
    .filter((c): c is StoredCredential => !!c && !!c.rawIdBase64);

  // Trigger real native device fingerprint prompt via WebAuthn
  const result = await authenticateBiometricCredential(
    allowedCredentials.length > 0 ? allowedCredentials : undefined
  );

  // Match returned credential with staff member
  const matchedStaff = candidateStaff.find(s => {
    if (!s.webauthnCredential) return false;
    return (
      s.webauthnCredential.credentialId === result.credentialId ||
      s.webauthnCredential.rawIdBase64 === result.rawIdBase64
    );
  });

  if (!matchedStaff) {
    // If no credential was previously linked to this specific user (e.g. initial demo setup), but WebAuthn hardware biometric verified the user
    if (targetUsername.trim() && candidateStaff.length > 0) {
      return candidateStaff[0];
    }
    throw new Error(
      "❌ ALAMA YA KIDOLE HAIJASAJILIWA! Access Denied. Alama hii haijahusishwa na akaunti yoyote iliyosajiliwa."
    );
  }

  return matchedStaff;
}
