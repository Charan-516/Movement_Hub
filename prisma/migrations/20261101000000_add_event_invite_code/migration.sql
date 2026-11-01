-- Each event gets an unguessable invite code; volunteers reach an event only
-- through /join/<inviteCode>. Existing rows are backfilled with random codes.
ALTER TABLE "Event" ADD COLUMN "inviteCode" TEXT;

UPDATE "Event"
SET "inviteCode" = substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)
WHERE "inviteCode" IS NULL;

ALTER TABLE "Event" ALTER COLUMN "inviteCode" SET NOT NULL;

CREATE UNIQUE INDEX "Event_inviteCode_key" ON "Event"("inviteCode");
