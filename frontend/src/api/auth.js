export async function loginLocal(email, password) {
  const res = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, motDePasse: password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data.token || data.data?.token;
}

export async function loginFirebase(idToken) {
  const res = await fetch("http://localhost:8080/api/auth/firebase-login", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Firebase login failed");
  return data.token;
}