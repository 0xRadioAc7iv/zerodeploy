ALTER TABLE "projects" ADD COLUMN "deployedUrl" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_deployedUrl_unique" UNIQUE("deployedUrl");