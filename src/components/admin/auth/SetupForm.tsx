"use client";

import { useState, useTransition, type FormEvent } from "react";
import { unstable_rethrow } from "next/navigation";
import { bootstrapFirstAdmin } from "@/actions/admin/auth";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";

export function SetupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await bootstrapFirstAdmin({ email, password, secret });
        if (result?.error) setError(result.error);
      } catch (submitError) {
        unstable_rethrow(submitError);
        setError("Une erreur est survenue.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>E-mail administrateur</span>
        <Input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Mot de passe (8 caractères minimum)</span>
        <Input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Clé de démarrage (ADMIN_BOOTSTRAP_SECRET)</span>
        <Input
          type="password"
          required
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
        />
      </label>
      {error && <p className="text-sm">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Créer le compte administrateur"}
      </Button>
    </form>
  );
}
