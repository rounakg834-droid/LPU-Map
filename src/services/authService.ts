import { auth, db, isFirebaseConfigured } from '../config/firebase';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuth,
  getIdTokenResult
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StudentAuthProfile } from '../types/events';

const STORAGE_KEY_PROFILE = 'lpu_student_auth_profile';
const STORAGE_KEY_ADMIN_SESSION = 'lpu_verified_admin_session';
const STORAGE_KEY_ADMIN_CREDENTIAL = 'lpu_local_admin_credential';

export interface LocalAdminCredential {
  email: string;
  fullName: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

class AuthService {
  private currentUser: StudentAuthProfile | null = null;
  private listeners: Set<(user: StudentAuthProfile | null) => void> = new Set();

  constructor() {
    this.loadPersistedUser();
    this.initFirebaseListener();
  }

  private loadPersistedUser() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        this.currentUser = JSON.parse(saved);
        // Verify persisted admin session flag
        if (this.currentUser && localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'active_authenticated_admin') {
          this.currentUser.isAdmin = true;
        }
      }
    } catch (e) {
      console.warn('Failed to load persisted student profile:', e);
    }
  }

  private initFirebaseListener() {
    if (isFirebaseConfigured && auth) {
      firebaseOnAuth(auth, async (fbUser) => {
        if (!fbUser) {
          if (this.currentUser?.isAdmin) {
            this.currentUser = null;
            localStorage.removeItem(STORAGE_KEY_PROFILE);
            localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
            this.notifyListeners();
          }
        } else {
          // If a user is authenticated, inspect token claims for admin role
          try {
            const tokenResult = await getIdTokenResult(fbUser);
            if (tokenResult.claims.admin) {
              if (this.currentUser) {
                this.currentUser.isAdmin = true;
                this.currentUser.uid = fbUser.uid;
                this.currentUser.email = fbUser.email || undefined;
                localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'active_authenticated_admin');
                this.notifyListeners();
              }
            }
          } catch (e) {
            console.warn('Error reading token claims:', e);
          }
        }
      });
    }
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  public getCurrentUser(): StudentAuthProfile | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public isAdmin(): boolean {
    return Boolean(this.currentUser?.isAdmin);
  }

  /**
   * Register or sign in a student with required academic details (Non-admin)
   */
  public async signInStudent(details: {
    fullName: string;
    course: string;
    yearOfStudy: string;
    displayName?: string;
  }): Promise<StudentAuthProfile> {
    const trimmedName = details.fullName.trim();
    const publicDisplayName = (details.displayName || trimmedName.split(' ')[0] || 'LPU Student').trim();

    let uid = `std_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInAnonymously(auth);
        uid = cred.user.uid;
      } catch (err) {
        console.warn('Firebase anonymous auth fallback:', err);
      }
    }

    const profile: StudentAuthProfile = {
      uid,
      fullName: trimmedName,
      displayName: publicDisplayName,
      course: details.course.trim(),
      yearOfStudy: details.yearOfStudy.trim(),
      isAdmin: false, // Students can never self-assign admin roles
    };

    this.currentUser = profile;
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not persist student profile to localStorage:', e);
    }

    this.notifyListeners();
    return profile;
  }

  public getAuthMode(): 'firebase' | 'local' {
    return isFirebaseConfigured ? 'firebase' : 'local';
  }

  /**
   * Cryptographic 16-byte random salt generator
   */
  private generateSalt(): string {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Salted SHA-256 password hash using standard Web Crypto API
   */
  private async hashPassword(password: string, salt: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${salt}:${password}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback deterministic hash
    let hash = 0;
    const combined = `${salt}:${password}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Check whether an initial master administrator account has been configured
   */
  public hasConfiguredAdmin(): boolean {
    if (isFirebaseConfigured) {
      // In Firebase mode, check if flagged or initialized
      return localStorage.getItem('lpu_firebase_admin_initialized') === 'true';
    }
    // In Local mode, check if local administrator credential exists
    const stored = localStorage.getItem(STORAGE_KEY_ADMIN_CREDENTIAL);
    if (!stored) return false;
    try {
      const cred = JSON.parse(stored);
      return Boolean(cred && cred.email && cred.passwordHash && cred.salt);
    } catch {
      return false;
    }
  }

  /**
   * Get the configured administrator email (returns null if uninitialized)
   * Note: NEVER reveals passwords or hashes.
   */
  public getConfiguredAdminEmail(): string | null {
    if (isFirebaseConfigured) {
      return localStorage.getItem('lpu_firebase_admin_email') || null;
    }
    const stored = localStorage.getItem(STORAGE_KEY_ADMIN_CREDENTIAL);
    if (!stored) return null;
    try {
      const cred = JSON.parse(stored);
      return cred.email || null;
    } catch {
      return null;
    }
  }

  /**
   * Secure First-Admin Setup Process
   * Initialises the master administrator account. Subsequent attempts are blocked.
   */
  public async setupFirstAdmin(details: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<StudentAuthProfile> {
    const cleanEmail = details.email.trim().toLowerCase();
    const fullName = details.fullName.trim() || 'University Administrator';

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid administrator university email address.');
    }

    if (!details.password || details.password.length < 8) {
      throw new Error('Administrator password must be at least 8 characters long for university security.');
    }

    if (this.hasConfiguredAdmin()) {
      throw new Error(
        'An administrator account has already been initialized on this system. First-time setup is permanently closed.'
      );
    }

    // 1. Firebase Production Mode Setup
    if (isFirebaseConfigured && auth) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, details.password);
        const fbUser = userCred.user;

        if (db) {
          await setDoc(doc(db, 'admin_users', fbUser.uid), {
            email: cleanEmail,
            uid: fbUser.uid,
            fullName,
            role: 'administrator',
            grantedAt: new Date().toISOString()
          });
        }

        localStorage.setItem('lpu_firebase_admin_initialized', 'true');
        localStorage.setItem('lpu_firebase_admin_email', cleanEmail);

        const adminProfile: StudentAuthProfile = {
          uid: fbUser.uid,
          email: cleanEmail,
          fullName,
          displayName: 'LPU Admin',
          course: 'Proctorial Board / DSW',
          yearOfStudy: 'Staff',
          isAdmin: true
        };

        this.currentUser = adminProfile;
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(adminProfile));
        localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'active_authenticated_admin');
        this.notifyListeners();
        return adminProfile;
      } catch (err: any) {
        throw new Error(err?.message || 'Failed to initialize Firebase administrator account.');
      }
    }

    // 2. Local Cryptographic Mode Setup
    const salt = this.generateSalt();
    const passwordHash = await this.hashPassword(details.password, salt);

    const localAdminCred: LocalAdminCredential = {
      email: cleanEmail,
      fullName,
      salt,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY_ADMIN_CREDENTIAL, JSON.stringify(localAdminCred));

    const adminProfile: StudentAuthProfile = {
      uid: `admin_${Date.now()}`,
      email: cleanEmail,
      fullName,
      displayName: 'LPU Admin',
      course: 'Proctorial Board / DSW',
      yearOfStudy: 'Staff',
      isAdmin: true
    };

    this.currentUser = adminProfile;
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(adminProfile));
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'active_authenticated_admin');
    this.notifyListeners();
    return adminProfile;
  }

  /**
   * Secure Admin Authentication with Firebase Auth or Salted Cryptographic Verification
   * Rejects users who do not have verified credentials or custom claim `admin: true`
   */
  public async signInAdminWithEmail(email: string, pass: string): Promise<StudentAuthProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !pass) {
      throw new Error('Please provide both administrator email and password.');
    }

    // 1. Production Mode with Live Firebase Auth
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const fbUser = cred.user;

        // Verify Firebase Custom User Claims (assigned securely via Admin SDK)
        const idToken = await getIdTokenResult(fbUser, true);
        let hasAdminPrivileges = Boolean(idToken.claims.admin);

        // Also check restricted /admin_users/{uid} collection in Firestore
        if (!hasAdminPrivileges && db) {
          try {
            const adminDoc = await getDoc(doc(db, 'admin_users', fbUser.uid));
            if (adminDoc.exists()) {
              hasAdminPrivileges = true;
            }
          } catch (err) {
            console.warn('Error verifying admin_users collection:', err);
          }
        }

        if (!hasAdminPrivileges) {
          // Explicitly sign out unprivileged account
          await firebaseSignOut(auth);
          throw new Error(
            `Access Denied: Account "${cleanEmail}" is authenticated, but is not authorized with campus administrative privileges. Please run scripts/setAdmin.cjs to grant admin claims.`
          );
        }

        const adminProfile: StudentAuthProfile = {
          uid: fbUser.uid,
          email: fbUser.email || cleanEmail,
          fullName: fbUser.displayName || 'University Administrator',
          displayName: 'LPU Admin',
          course: 'Proctorial Board / DSW',
          yearOfStudy: 'Staff',
          isAdmin: true
        };

        this.currentUser = adminProfile;
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(adminProfile));
        localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'active_authenticated_admin');
        this.notifyListeners();
        return adminProfile;
      } catch (err: any) {
        if (err.message.includes('Access Denied')) {
          throw err;
        }
        throw new Error(err.message || 'Authentication failed. Please verify credentials.');
      }
    }

    // 2. Local Secured Mode (when Firebase credentials are not yet configured in .env)
    if (!this.hasConfiguredAdmin()) {
      throw new Error(
        'No administrator account has been initialized yet. Please complete the First-Time Administrator Setup.'
      );
    }

    const storedRaw = localStorage.getItem(STORAGE_KEY_ADMIN_CREDENTIAL);
    if (!storedRaw) {
      throw new Error('Administrator account data missing. Please initialize administrator account.');
    }

    const storedCred: LocalAdminCredential = JSON.parse(storedRaw);

    // Verify email match
    if (cleanEmail !== storedCred.email.toLowerCase()) {
      throw new Error('Access Denied: Invalid administrator email or password.');
    }

    // Verify cryptographic salted SHA-256 password hash
    const computedHash = await this.hashPassword(pass, storedCred.salt);
    if (computedHash !== storedCred.passwordHash) {
      throw new Error('Access Denied: Invalid administrator email or password.');
    }

    const adminProfile: StudentAuthProfile = {
      uid: `admin_${Date.now()}`,
      email: storedCred.email,
      fullName: storedCred.fullName || 'University Administrator',
      displayName: 'LPU Admin',
      course: 'Proctorial Board / DSW',
      yearOfStudy: 'Staff',
      isAdmin: true
    };

    this.currentUser = adminProfile;
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(adminProfile));
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'active_authenticated_admin');
    this.notifyListeners();
    return adminProfile;
  }

  /**
   * Sign out student or administrator
   */
  public async signOut(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Firebase signout error:', e);
      }
    }

    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    this.notifyListeners();
  }

  /**
   * Subscribe to auth state changes
   */
  public onAuthStateChanged(callback: (user: StudentAuthProfile | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentUser);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const authService = new AuthService();
