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
import { auth, db } from '../config/firebase.config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

interface UserStatus {
  tentativesEchouees: number;
  compteBloque: boolean;
  dateBlocage: Date | null;
}

const MAX_ATTEMPTS = 3;

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

  // ===== CONNEXION Firebase uniquement =====
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Tentative de connexion Firebase avec:', email);

      // 1. Vérifier le statut de blocage dans Firestore
      const status = await this.getUserStatus(email);
      
      if (status.compteBloque) {
        // Vérifier si déblocage automatique après 24h
        if (status.dateBlocage) {
          const now = new Date();
          const blocageDate = new Date(status.dateBlocage);
          const diff = now.getTime() - blocageDate.getTime();
          const hours = diff / (1000 * 60 * 60);
          
          if (hours >= 24) {
            // Déblocage automatique
            await this.resetUserStatus(email);
            console.log('✅ Déblocage automatique après 24h');
          } else {
            console.log('❌ Compte bloqué');
            return {
              success: false,
              error: 'Compte bloqué. Contactez un administrateur.',
              blocked: true,
              tentativesRestantes: 0
            };
          }
        } else {
          return {
            success: false,
            error: 'Compte bloqué. Contactez un administrateur.',
            blocked: true,
            tentativesRestantes: 0
          };
        }
      }

      // 2. Tentative de connexion Firebase
      let userCredential: UserCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (firebaseError: any) {
        console.log('❌ Erreur Firebase:', firebaseError.code);
        
        // Incrémenter les tentatives échouées
        await this.incrementFailedAttempts(email);
        const newStatus = await this.getUserStatus(email);
        
        return {
          success: false,
          error: this.getFirebaseErrorMessage(firebaseError.code),
          blocked: newStatus.compteBloque,
          tentativesRestantes: MAX_ATTEMPTS - newStatus.tentativesEchouees
        };
      }

      // 3. Connexion réussie - réinitialiser les tentatives
      await this.resetFailedAttempts(email);
      
      const firebaseToken = await userCredential.user.getIdToken();
      this.setStoredToken(firebaseToken);
      this.setStoredUser(userCredential.user);

      console.log('✅ Connexion Firebase réussie');
      return {
        success: true,
        user: userCredential.user,
        token: firebaseToken
      };

    } catch (error: any) {
      console.error('❌ Erreur inattendue:', error);
      return {
        success: false,
        error: 'Erreur de connexion inattendue'
      };
    }
  }

  // ===== INSCRIPTION Firebase uniquement =====
  async signUp(data: RegisterData): Promise<AuthResult> {
    try {
      console.log('📝 Tentative d\'inscription Firebase avec:', data.email);

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      const token = await user.getIdToken();

      this.setStoredToken(token);
      this.setStoredUser(user);

      console.log('✅ Inscription Firebase réussie');
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

  public clearStoredData(): void {
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // ===== GESTION BLOCAGE FIRESTORE =====
  private async getUserStatus(email: string): Promise<UserStatus> {
    try {
      const statusRef = doc(db, 'utilisateurs_status', email);
      const statusDoc = await getDoc(statusRef);
      
      if (statusDoc.exists()) {
        const data = statusDoc.data();
        return {
          tentativesEchouees: data.tentativesEchouees || 0,
          compteBloque: data.compteBloque || false,
          dateBlocage: data.dateBlocage ? data.dateBlocage.toDate() : null
        };
      }
      
      // Pas de statut existant = nouvel utilisateur
      return {
        tentativesEchouees: 0,
        compteBloque: false,
        dateBlocage: null
      };
    } catch (error) {
      console.error('Erreur lecture statut:', error);
      return {
        tentativesEchouees: 0,
        compteBloque: false,
        dateBlocage: null
      };
    }
  }

  private async incrementFailedAttempts(email: string): Promise<void> {
    try {
      const statusRef = doc(db, 'utilisateurs_status', email);
      const status = await this.getUserStatus(email);
      
      const newAttempts = status.tentativesEchouees + 1;
      const isBlocked = newAttempts >= MAX_ATTEMPTS;
      
      await setDoc(statusRef, {
        email: email,
        tentativesEchouees: newAttempts,
        compteBloque: isBlocked,
        dateBlocage: isBlocked ? serverTimestamp() : null,
        lastUpdate: serverTimestamp()
      });
      
      console.log(`⚠️ Tentatives échouées: ${newAttempts}/${MAX_ATTEMPTS}`);
      if (isBlocked) {
        console.log('🔒 Compte bloqué automatiquement');
      }
    } catch (error) {
      console.error('Erreur mise à jour tentatives:', error);
    }
  }

  private async resetFailedAttempts(email: string): Promise<void> {
    try {
      const statusRef = doc(db, 'utilisateurs_status', email);
      await setDoc(statusRef, {
        email: email,
        tentativesEchouees: 0,
        compteBloque: false,
        dateBlocage: null,
        lastUpdate: serverTimestamp()
      });
      console.log('✅ Tentatives réinitialisées');
    } catch (error) {
      console.error('Erreur réinitialisation tentatives:', error);
    }
  }

  private async resetUserStatus(email: string): Promise<void> {
    try {
      const statusRef = doc(db, 'utilisateurs_status', email);
      await updateDoc(statusRef, {
        compteBloque: false,
        tentativesEchouees: 0,
        dateBlocage: null,
        lastUpdate: serverTimestamp()
      });
      console.log('✅ Statut utilisateur réinitialisé');
    } catch (error) {
      console.error('Erreur réinitialisation statut:', error);
    }
  }
}

const authService = new AuthService();
export default authService;