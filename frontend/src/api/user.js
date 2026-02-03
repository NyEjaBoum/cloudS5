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

export async function fetchUserById(id) {
  const token = localStorage.getItem("jwt");
  const res = await fetch(`http://localhost:8080/api/utilisateurs/${id}`, {
    headers: { "Authorization": "Bearer " + token }
  });
  return await res.json();
}

export async function updateUser(id, userData) {
  const token = localStorage.getItem("jwt");
  const res = await fetch(`http://localhost:8080/api/utilisateurs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(userData)
  });
  return await res.json();
}

export async function unblockUser(userId) {
  const token = localStorage.getItem("jwt");
  const res = await fetch(`http://localhost:8080/api/utilisateurs/unblock/${userId}`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.error || "Erreur déblocage utilisateur");
  return data.data;
}

export async function importUsersFromFirebase() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/utilisateurs/firebase/import", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.error || "Erreur import Firebase");
  return data.data;
}

export async function exportUsersToFirebase() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/utilisateurs/firebase/export", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.error || "Erreur export Firebase");
  return data.data;
}

export async function synchronizeUsers() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/utilisateurs/firebase/sync", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.error || "Erreur synchronisation Firebase");
  return data.data;
}