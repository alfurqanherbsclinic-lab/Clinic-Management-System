// WebAuthn Passkey & Biometric Helper Module
// Provides real hardware biometric (Fingerprint / Touch ID / Face ID / Windows Hello) authentication

export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function base64UrlToBuffer(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch (e) {
    console.warn("WebAuthn biometric availability check notice:", e);
    return false;
  }
}

export interface StoredCredential {
  credentialId: string;
  rawIdBase64: string;
  registeredAt: string;
}

/**
 * Perform real device biometric enrollment (Fingerprint registration) via WebAuthn
 */
export async function registerBiometricCredential(
  username: string,
  displayName: string
): Promise<StoredCredential> {
  const supported = await isBiometricAvailable();
  if (!supported) {
    throw new Error(
      "Kifaa hiki au kivinjari hakijawezeshwa kusoma Fingerprint / WebAuthn. Hakikisha Fingerprint / Screen Lock imewezeshwa kwenye kifaa chako."
    );
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  // Use hostname or fallback if localhost/IP
  const hostname = window.location.hostname || "localhost";

  const creationOptions: PublicKeyCredentialCreationOptions = {
    challenge: challenge.buffer,
    rp: {
      name: "Al-Furqan Herb's Clinic HIS",
      id: hostname
    },
    user: {
      id: userId.buffer,
      name: username,
      displayName: displayName
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },  // ES256 (Standard Passkey/WebAuthn)
      { alg: -257, type: "public-key" } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Enforces native device fingerprint / Touch ID / Face ID
      userVerification: "required",       // Requires strict biometric verification
      residentKey: "preferred"
    },
    timeout: 60000,
    attestation: "none"
  };

  try {
    const credential = (await navigator.credentials.create({
      publicKey: creationOptions
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error("Usajili wa kidole haukukamilika au ulisitisishwa.");
    }

    const rawIdBase64 = bufferToBase64Url(credential.rawId);

    return {
      credentialId: credential.id,
      rawIdBase64,
      registeredAt: new Date().toISOString()
    };
  } catch (err: any) {
    if (err.name === "NotAllowedError") {
      throw new Error("Usajili wa kidole ulighairiwa au haukuthibitishwa kwenye kifaa.");
    }
    if (err.name === "InvalidStateError") {
      throw new Error("Fingerprint au credential hii imeshasajiliwa tayari kwenye kifaa hiki.");
    }
    throw new Error(`Hitilafu ya WebAuthn: ${err.message || "Uhakiki ulifeli"}`);
  }
}

/**
 * Authenticate user with real device fingerprint via WebAuthn
 */
export async function authenticateBiometricCredential(
  allowedCredentials?: StoredCredential[]
): Promise<{ credentialId: string; rawIdBase64: string }> {
  const supported = await isBiometricAvailable();
  if (!supported) {
    throw new Error("Kifaa hiki hakijawezeshwa kusoma Fingerprint.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const hostname = window.location.hostname || "localhost";

  const allowCredentialsList: PublicKeyCredentialDescriptor[] = (allowedCredentials || [])
    .filter(c => c && c.rawIdBase64)
    .map(c => ({
      id: base64UrlToBuffer(c.rawIdBase64).buffer,
      type: "public-key"
    }));

  const requestOptions: PublicKeyCredentialRequestOptions = {
    challenge: challenge.buffer,
    timeout: 60000,
    userVerification: "required",
    rpId: hostname,
    ...(allowCredentialsList.length > 0 ? { allowCredentials: allowCredentialsList } : {})
  };

  try {
    const assertion = (await navigator.credentials.get({
      publicKey: requestOptions
    })) as PublicKeyCredential | null;

    if (!assertion) {
      throw new Error("Uhakiki wa kidole ulisitisishwa.");
    }

    const rawIdBase64 = bufferToBase64Url(assertion.rawId);

    return {
      credentialId: assertion.id,
      rawIdBase64
    };
  } catch (err: any) {
    if (err.name === "NotAllowedError") {
      throw new Error("Uhakiki wa kidole ulighairiwa au kidole hakikutambuliwa na kifaa.");
    }
    throw new Error(`Uhakiki wa Fingerprint ulifeli: ${err.message || "Access Denied"}`);
  }
}
