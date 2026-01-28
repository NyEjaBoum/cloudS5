import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export async function handleLogin({ email, password }, navigate, setError, setLoading) {
  setLoading(true);
  setError("");
  let token;
  try {
    if (navigator.onLine) {
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        token = await loginFirebase(idToken);
      } catch (firebaseErr) {
        // Gestion des erreurs Firebase
        if (
          firebaseErr.code === "auth/network-request-failed" ||
          firebaseErr.message.includes("network-request-failed") ||
          firebaseErr.message.includes("ERR_NAME_NOT_RESOLVED")
        ) {
          // Erreur de connexion Internet : fallback local
          try {
            // token = await loginLocal(email, password);
          } catch (localErr) {
            setError("Erreur locale : " + localErr.message);
            setLoading(false);
            return;
          }
        // } else if (firebaseErr.code === "auth/user-not-found") {
        //   setError("Aucun compte Firebase trouvé pour cet email.");
        //   setLoading(false);
        //   return;
        // } else if (firebaseErr.code === "auth/wrong-password") {
        //   setError("Mot de passe incorrect pour le compte Firebase.");
        //   setLoading(false);
        //   return;
        // } else if (firebaseErr.code === "auth/invalid-credential") {
        //   setError("Identifiants invalides : vérifiez l'email et le mot de passe.");
        //   setLoading(false);
        //   return;
        // } else if (firebaseErr.code === "auth/invalid-email") {
        //   setError("Format d'email invalide.");
        //   setLoading(false);
        //   return;
        // } else {
         }else {
          // setError("Erreur Firebase : " + firebaseErr.message);
          // setLoading(false);
          // return;
          token = await loginLocal(email, password);
        }
      }
    } else {
      token = await loginLocal(email, password);
    }
    localStorage.setItem("jwt", token);
    navigate("/manager");
  } catch (err) {
    setError("Erreur : " + err.message);
  }
  setLoading(false);
}

export function logout() {
  localStorage.removeItem("jwt");
}


export async function loginLocal(email, password) {
  const res = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, motDePasse: password }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.error || "Login failed");
  return data.data; // Le token est dans data.data
}

export async function loginFirebase(idToken) {
  const res = await fetch("http://localhost:8080/api/auth/firebase/login", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.error || "Firebase login failed");
  return data.data.token; // Le token est dans data.data.token
}


export async function registerLocal({ email, password, lastname, firstname }, idToken) {
  const res = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify({
      email,
      motDePasse: password,
      nom: lastname,
      prenom: firstname,
    }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.error || "Registration failed");
  return data.data;
}

export async function fetchAllUsers() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/utilisateurs", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
  return await res.json();
}



// Importer tous les users Firebase dans Postgres
export async function importUsersFromFirebase() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/auth/firebase/import", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.error || "Erreur import Firebase");
  return data.data;
}

// Exporter tous les users Postgres vers Firebase (à faire côté backend si tu veux tout synchroniser)
export async function exportUsersToFirebase() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/auth/firebase/export", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.error || "Erreur export Firebase");
  return data.data;
}