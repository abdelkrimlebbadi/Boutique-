import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { SetupForm } from "@/components/admin/auth/SetupForm";

export default async function AdminSetupPage() {
  const serviceRole = createServiceRoleClient();
  const { count } = await serviceRole
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if (count && count > 0) {
    return (
      <div>
        <h1 className="mb-4 font-display text-xl font-semibold">Déjà configuré</h1>
        <p className="text-sm">
          Un compte administrateur existe déjà. Rendez-vous sur la page de connexion.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-xl font-semibold">
        Créer le premier compte administrateur
      </h1>
      <SetupForm />
    </div>
  );
}
