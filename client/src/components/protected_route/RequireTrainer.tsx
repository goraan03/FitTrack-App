import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { clientApi } from "../../api_services/client/ClientAPIService";

export default function RequireTrainer() {
  const [checking, setChecking] = useState(true);
  const [hasTrainer, setHasTrainer] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const resp = await clientApi.getMyProfile();
        if (!alive) return;
        const assigned = resp?.data?.assignedTrainerId ?? null;
        setHasTrainer(assigned !== null && assigned !== undefined);
      } catch {
        // Ako ne možemo da učitamo profil, ponašaj se kao da nema trenera
        if (!alive) return;
        setHasTrainer(false);
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (checking) {
    return (
      <div className="p-6 text-gray-600">Provera profila...</div>
    );
  }

  if (!hasTrainer) {
    return <Navigate to="/app/choose-trainer" replace state={{ from: location }} />;
  }

  return <Outlet />;
}