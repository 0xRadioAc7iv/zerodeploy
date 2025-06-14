CREATE TABLE "deployments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"projectId" uuid NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"timeToReady" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp,
	CONSTRAINT "deployments_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "createdAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "createdAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;