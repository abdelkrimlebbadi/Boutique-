-- Adds the local/demo payment provider. Kept separate from any migration
-- that uses the new value: ALTER TYPE ... ADD VALUE cannot be used in the
-- same transaction it was added in.
alter type payment_provider add value 'mock';
