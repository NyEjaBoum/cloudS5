export async function fetchSignalementInfos() {
  const res = await fetch("http://localhost:8080/api/signalements/infos");
  const data = await res.json();
  return data.data || [];
}


export async function fetchSignalementComplet() {
  const res = await fetch("http://localhost:8080/api/signalements/complet");
  const data = await res.json();
  return data.data || [];
}