export async function fetchRecapitulatif() {
  const response = await fetch("http://localhost:8080/api/signalements/recapitulatif");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du récapitulatif");
  }
  const data = await response.json();
  return data.data;
}