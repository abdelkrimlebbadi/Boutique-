-- Idempotence claim for inbound webhooks, stronger than a naive
-- `insert ... on conflict do nothing`: if a previous attempt crashed after
-- claiming the row but before marking it processed, that event would be
-- stuck forever under the naive pattern (the provider's retry would just
-- hit the conflict and be silently swallowed). This allows a re-claim once
-- an unprocessed row is old enough (2 minutes) to safely assume the prior
-- attempt died rather than being merely slow.
--
-- Returns the claimed row's id when the caller should process the event,
-- or null when it's already processed or a very recent attempt is still
-- in flight (caller should just ack with 200 and do nothing).
--
-- SECURITY DEFINER, EXECUTE revoked from PUBLIC/anon/authenticated — only
-- service_role (used exclusively by the webhook route handler) may call
-- this.

create function claim_webhook_event(
  p_provider webhook_provider,
  p_external_id text,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into webhook_events (provider, external_id, payload)
  values (p_provider, p_external_id, p_payload)
  on conflict (provider, external_id) do update
    set payload = excluded.payload
    where webhook_events.processed_at is null
      and webhook_events.created_at < now() - interval '2 minutes'
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function claim_webhook_event from public, anon, authenticated;
