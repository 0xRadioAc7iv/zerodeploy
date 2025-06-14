ALTER TABLE "deployments" ALTER COLUMN "timeToReady" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "deployments" ALTER COLUMN "timeToReady" DROP NOT NULL;