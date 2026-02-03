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

// Interface pour les résultats d'authentification
interface AuthResult {
  success: boolean;
  user?: User | null;
  token?: string;
  error?: string;
}

// Interface pour les données d'inscription
interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Écouter les changements d'état d'authentification
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        // Stocker le token quand l'utilisateur est connecté
        user.getIdToken().then(token => {
          this.setStoredToken(token);
        });
      } else {
        this.clearStoredData();
      }
    });

    // Récupérer l'utilisateur stocké au démarrage
    this.currentUser = auth.currentUser;
  }

  // ===== INSCRIPTION (signUp) =====
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

      // Stocker le token
      this.setStoredToken(token);
      this.setStoredUser(user);

      console.log('✅ Inscription réussie');
      return {
        success: true,
        user,
        token
      };
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error.code, error.message);

      let errorMessage = 'Erreur lors de l\'inscription';

      // Messages d'erreur Firebase traduits
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Un compte avec cet email existe déjà';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'L\'inscription par email/mot de passe n\'est pas activée';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ===== CONNEXION (signIn) =====
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Tentative de connexion avec:', email);
      console.log('⏳ Appel Firebase en cours...');

      // Ajouter un timeout de 15 secondes
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 15000);
      });

      const authPromise = signInWithEmailAndPassword(auth, email, password);

      const userCredential: UserCredential = await Promise.race([
        authPromise,
        timeoutPromise
      ]) as UserCredential;

      console.log('✅ Réponse Firebase reçue');

      const user = userCredential.user;
      const token = await user.getIdToken();

      // Stocker le token
      this.setStoredToken(token);
      this.setStoredUser(user);

      console.log('✅ Connexion réussie');
      return {
        success: true,
        user,
        token
      };
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.code || error.message, error);

      let errorMessage = 'Erreur de connexion';

      // Timeout personnalisé
      if (error.message === 'TIMEOUT') {
        errorMessage = 'Connexion trop lente. Vérifiez votre connexion internet.';
        return { success: false, error: errorMessage };
      }

      // Messages d'erreur Firebase traduits
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cet email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Réessayez plus tard.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
          break;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ===== DÉCONNEXION (signOut) =====
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

  // ===== VÉRIFICATION (isLoggedIn) =====
  isLoggedIn(): boolean {
    return !!auth.currentUser || !!this.getStoredToken();
  }

  // ===== RÉCUPÉRER L'UTILISATEUR ACTUEL =====
  getCurrentUser(): User | null {
    return auth.currentUser || this.currentUser;
  }

  // ===== RÉCUPÉRER LE TOKEN =====
  async getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return this.getStoredToken();
  }

  // ===== RÉINITIALISATION MOT DE PASSE =====
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email de réinitialisation envoyé');
      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Erreur de réinitialisation:', error.code);

      let errorMessage = 'Erreur lors de la réinitialisation';

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cet email';
          break;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ===== GESTION LOCALSTORAGE =====
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
    localStorage.removeItem('user');
  }
}

// Exporter une instance unique (singleton)
const authService = new AuthService();
export default authService;
