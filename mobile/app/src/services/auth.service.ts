// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase.config';
import { checkUserStatus, loginWithFirebaseToken, registerFailedAttempt } from './api';

interface AuthResult {
  success: boolean;
  user?: User | null;
  token?: string;
  error?: string;
  blocked?: boolean;
  tentativesRestantes?: number;
}

interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        user.getIdToken().then(token => {
          this.setStoredToken(token);
        });
      } else {
        this.clearStoredData();
      }
    });
    this.currentUser = auth.currentUser;
  }

  // ===== CONNEXION avec vérification blocage =====
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Tentative de connexion avec:', email);

      // Étape 1: Tenter la connexion Firebase
      let userCredential: UserCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (firebaseError: any) {
        console.log('❌ Erreur Firebase:', firebaseError.code);
        
        // Enregistrer la tentative échouée côté backend
        const failedResult = await registerFailedAttempt(email);
        
        if (failedResult.status === 'success' && failedResult.data) {
          if (failedResult.data.blocked) {
            return {
              success: false,
              blocked: true,
              error: 'Compte bloqué après trop de tentatives. Contactez un administrateur.',
              tentativesRestantes: 0
            };
          }
          
          return {
            success: false,
            error: this.getFirebaseErrorMessage(firebaseError.code),
            tentativesRestantes: failedResult.data.tentativesRestantes
          };
        }
        
        return {
          success: false,
          error: this.getFirebaseErrorMessage(firebaseError.code)
        };
      }

      // Étape 2: Obtenir le token Firebase
      const firebaseToken = await userCredential.user.getIdToken();

      // Étape 3: Vérifier le statut côté backend
      const statusResult = await checkUserStatus(firebaseToken);
      
      if (statusResult.status === 'success' && statusResult.data) {
        if (statusResult.data.blocked) {
          // Déconnecter de Firebase si bloqué côté backend
          await firebaseSignOut(auth);
          return {
            success: false,
            blocked: true,
            error: 'Compte bloqué. Contactez un administrateur.',
            tentativesRestantes: 0
          };
        }
        
        if (!statusResult.data.exists) {
          await firebaseSignOut(auth);
          return {
            success: false,
            error: 'Aucun compte local associé. Contactez un administrateur.'
          };
        }
      }

      // Étape 4: Obtenir le JWT backend
      const loginResult = await loginWithFirebaseToken(firebaseToken);
      
      if (loginResult.status === 'error') {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: loginResult.error || 'Erreur de connexion au serveur'
        };
      }

      // Étape 5: Stocker les tokens
      if (loginResult.data) {
        this.setStoredToken(loginResult.data.token);
        localStorage.setItem('backend_jwt', loginResult.data.token);
        this.setStoredUser(userCredential.user);
      }

      console.log('✅ Connexion réussie');
      return {
        success: true,
        user: userCredential.user,
        token: loginResult.data?.token
      };

    } catch (error: any) {
      console.error('❌ Erreur inattendue:', error);
      return {
        success: false,
        error: 'Erreur de connexion inattendue'
      };
    }
  }

  // ===== INSCRIPTION =====
  async signUp(data: RegisterData): Promise<AuthResult> {
    try {
      console.log('📝 Tentative d\'inscription avec:', data.email);

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      const token = await user.getIdToken();

      this.setStoredToken(token);
      this.setStoredUser(user);

      console.log('✅ Inscription réussie');
      return {
        success: true,
        user,
        token
      };
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error.code);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error.code)
      };
    }
  }

  // ===== DÉCONNEXION =====
  async signOut(): Promise<AuthResult> {
    try {
      await firebaseSignOut(auth);
      this.clearStoredData();
      console.log('✅ Déconnexion réussie');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur de déconnexion:', error.message);
      return {
        success: false,
        error: 'Erreur lors de la déconnexion'
      };
    }
  }

  // ===== HELPERS =====
  private getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cet email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard.';
      case 'auth/network-request-failed':
        return 'Erreur réseau. Vérifiez votre connexion.';
      case 'auth/email-already-in-use':
        return 'Un compte avec cet email existe déjà';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      default:
        return 'Erreur de connexion';
    }
  }

  isLoggedIn(): boolean {
    return !!auth.currentUser || !!this.getStoredToken();
  }

  getCurrentUser(): User | null {
    return auth.currentUser || this.currentUser;
  }

  async getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return this.getStoredToken();
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error.code)
      };
    }
  }

  private setStoredUser(user: User): void {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    localStorage.setItem('user', JSON.stringify(userData));
  }

  getStoredUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private setStoredToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private clearStoredData(): void {
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('backend_jwt');
    localStorage.removeItem('user');
  }
}

const authService = new AuthService();
export default authService;
