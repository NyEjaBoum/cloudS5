import React, { useEffect, useState } from "react";
import { fetchAllUsers, importUsersFromFirebase, exportUsersToFirebase } from "../../api/user";
import { Upload } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshUsers = () => {
    fetchAllUsers()
      .then(setUsers)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  // const handleImport = async () => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     await importUsersFromFirebase();
  //     refreshUsers();
  //     alert("Import depuis Firebase terminé !");
  //   } catch (e) {
  //     setError(e.message);
  //   }
  //   setLoading(false);
  // };

  const handleExport = async () => {
    setLoading(true);
    setError("");
    try {
      await exportUsersToFirebase();
      alert("Export vers Firebase terminé !");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="card bg-base-100 shadow-sm animate-fade-in">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-xl">Liste des utilisateurs</h2>
          {/* <button className="btn btn-primary btn-sm gap-2" onClick={handleImport} disabled={loading}>
            Importer depuis Firebase
          </button> */}
          <button className="btn btn-primary btn-sm gap-2" onClick={handleExport} disabled={loading}>
            <Upload size={14} />
            Exporter vers Firebase
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.nom}</td>
                  <td>{u.prenom}</td>
                  <td>{u.role?.nom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
