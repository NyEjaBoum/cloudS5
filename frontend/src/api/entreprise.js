export async function fetchEntreprises() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/entreprises", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  const data = await res.json();
  return data.data || [];
}