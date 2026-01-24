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


export async function fetchSignalementById(id) {
  const res = await fetch(`http://localhost:8080/api/signalements/${id}`);
  const data = await res.json();
  return data.data;
}

export async function updateSignalement(id, data) {
  const payload = {
    ...data,
    entreprise: typeof data.entreprise === "object"
      ? data.entreprise
      : { nom: data.entreprise }
  };
  const res = await fetch(`http://localhost:8080/api/signalements/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour");
  return (await res.json()).data;
}