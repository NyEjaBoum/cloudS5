export async function fetchSignalementInfos() {
const token = localStorage.getItem("jwt");
const res = await fetch("http://localhost:8080/api/signalements/infos", {
  headers: {
    "Authorization": "Bearer " + token
  }
});
  const data = await res.json();
  return data.data || [];
}

export async function fetchSignalementHistorique(id) {
  const token = localStorage.getItem("jwt");
  const res = await fetch(`http://localhost:8080/api/signalements/${id}/historique`, {
    headers: { "Authorization": "Bearer " + token }
  });
  const data = await res.json();
  return data.data || [];
}


export async function fetchDureeSignalements() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/signalements/duree", {
    headers: { "Authorization": "Bearer " + token }
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchStatsDelaiMoyen() {
  const token = localStorage.getItem("jwt");
  const res = await fetch("http://localhost:8080/api/signalements/stats-delai-moyen", {
    headers: { "Authorization": "Bearer " + token }
  });
  const data = await res.json();
  return data.data;
}


export async function fetchSignalementComplet() {
  const res = await fetch("http://localhost:8080/api/signalements/complet");
  const data = await res.json();
  return data.data || [];
}


export async function fetchSignalementById(id) {
  const token = localStorage.getItem("jwt");
  const res = await fetch(`http://localhost:8080/api/signalements/${id}`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  const data = await res.json();
  return data.data;
}

export async function updateSignalement(id, data) {
  const token = localStorage.getItem("jwt");
  const payload = {
    ...data,
    entreprise: typeof data.entreprise === "object"
      ? data.entreprise
      : { nom: data.entreprise }
  };
  const res = await fetch(`http://localhost:8080/api/signalements/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.status === "error" || !res.ok) {
    throw new Error(json.error || "Erreur lors de la mise à jour");
  }
  return json.data;
}



export async function syncAllSignalements() {
  const token = localStorage.getItem("jwt");
  console.log(localStorage.getItem("jwt"));
  const res = await fetch("http://localhost:8080/api/signalements/sync", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    }
  });
  const json = await res.json();
  if (json.status === "error" || !res.ok) {
    throw new Error(json.error || "Erreur lors de la synchronisation");
  }
  return json;
}