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