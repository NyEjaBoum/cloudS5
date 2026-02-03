import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// export async function handleLogin({ email, password }, navigate, setError, setLoading) {
//   setLoading(true);
//   setError("");
//   let token;
//   try {
//     if (navigator.onLine) {
//       try {
//         const auth = getAuth();
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const idToken = await userCredential.user.getIdToken();
//         token = await loginFirebase(idToken);
//       } catch (firebaseErr) {
//         // Si Firebase échoue, on tente la connexion locale
//         try {
//           // token = await loginLocal(email, password);
//         } catch (localErr) {
//           setError(
//             "Erreur Firebase : " +
//               (firebaseErr.code ? firebaseErr.code + " - " : "") +
//               (firebaseErr.message || firebaseErr.toString()) +
//             "\nErreur locale : " +
//               (localErr.message || localErr.toString())
//           );
//           setLoading(false);
//           return;
//         }
//       }
//     } else {
//       // Si offline, on tente directement la connexion locale
//       try {
//         token = await loginLocal(email, password);
//       } catch (localErr) {
//         setError("Erreur locale : " + (localErr.message || localErr.toString()));
//         setLoading(false);
//         return;
//       }
//     }
//     localStorage.setItem("jwt", token);
//     navigate("/manager");
//   } catch (err) {
//     setError("Erreur : " + (err.message || err.toString()));
//   }
//   setLoading(false);
// }

export async function handleLogin({ email, password }, navigate, setError, setLoading) {
  setLoading(true);
  setError("");
  try {
    const token = await loginLocal(email, password);
    localStorage.setItem("jwt", token);
    navigate("/manager");
  } catch (err) {
    setError("Erreur : " + (err.message || err.toString()));
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
  return data.data;
}

export async function loginFirebase(idToken) {
  const res = await fetch("http://localhost:8080/api/auth/firebase/login", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.error || "Firebase login failed");
  return data.data.token;
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