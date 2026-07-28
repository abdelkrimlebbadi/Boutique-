-- MockProvider webhooks go through the same webhook_events idempotence
-- table as real providers, so 'mock' needs to be a valid webhook_provider.
alter type webhook_provider add value 'mock';
