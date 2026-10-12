CREATE TYPE "public"."app_role" AS ENUM('admin', 'officer', 'member');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('guildHunt', 'sandstorm', 'guildDuel', 'guildClash', 'pallantis', 'arcticShowdown');--> statement-breakpoint
CREATE TYPE "public"."role_source" AS ENUM('discord', 'env', 'pinned');--> statement-breakpoint
CREATE TYPE "public"."roster_status" AS ENUM('active', 'LOA', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."sanctum_type" AS ENUM('goldglade', 'woodsong', 'steelstory', 'craftsman', 'scholar');--> statement-breakpoint
CREATE TYPE "public"."stronghold_category" AS ENUM('sanctum', 'desertRuin');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actorUserId" text,
	"action" text NOT NULL,
	"target" text,
	"detail" jsonb,
	"at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donation_history" (
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"value" bigint DEFAULT 0,
	"period" text,
	"capturedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "event_type" NOT NULL,
	"title" text NOT NULL,
	"startsAt" timestamp NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"opponent" text,
	"typeFields" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guild_clash_history" (
	"id" text PRIMARY KEY NOT NULL,
	"week" integer NOT NULL,
	"tier" text,
	"rank" integer,
	"points" bigint DEFAULT 0,
	"capturedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guild_weekly_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"week" text NOT NULL,
	"weekIndex" integer NOT NULL,
	"donations" bigint DEFAULT 0,
	"kills" bigint DEFAULT 0,
	"rosterSize" integer DEFAULT 0,
	"avgPower" bigint DEFAULT 0,
	"sandstormPoints" bigint DEFAULT 0,
	"capturedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kill_history" (
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"value" bigint DEFAULT 0,
	"period" text,
	"capturedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"discordId" text,
	"userId" text,
	"ign" text NOT NULL,
	"guildRank" integer DEFAULT 1 NOT NULL,
	"isGuildmaster" boolean DEFAULT false NOT NULL,
	"timezone" text,
	"onlineWindows" jsonb DEFAULT '[]'::jsonb,
	"sandstormSquad" text,
	"power" bigint DEFAULT 0,
	"level" integer DEFAULT 1,
	"rosterStatus" "roster_status" DEFAULT 'active' NOT NULL,
	"lastSeenBucket" jsonb,
	"lastSeenObservedAt" timestamp,
	"donations" bigint DEFAULT 0,
	"kills" bigint DEFAULT 0,
	"notes" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "member_discordId_unique" UNIQUE("discordId")
);
--> statement-breakpoint
CREATE TABLE "participation" (
	"id" text PRIMARY KEY NOT NULL,
	"eventId" text NOT NULL,
	"memberId" text NOT NULL,
	"signedUp" boolean DEFAULT false NOT NULL,
	"participated" boolean DEFAULT false NOT NULL,
	"squad" text,
	"metric" text,
	"value" bigint DEFAULT 0,
	"subScores" jsonb,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "participation_history" (
	"id" text PRIMARY KEY NOT NULL,
	"eventId" text NOT NULL,
	"memberId" text NOT NULL,
	"value" bigint DEFAULT 0,
	"capturedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rank_change_log" (
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"fromRank" integer,
	"toRank" integer,
	"power" bigint,
	"changedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stronghold_history" (
	"id" text PRIMARY KEY NOT NULL,
	"strongholdId" text NOT NULL,
	"change" jsonb,
	"capturedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stronghold" (
	"id" text PRIMARY KEY NOT NULL,
	"category" "stronghold_category" NOT NULL,
	"sanctumType" "sanctum_type",
	"name" text,
	"level" integer DEFAULT 1 NOT NULL,
	"coordX" integer NOT NULL,
	"coordY" integer NOT NULL,
	"occupier" text,
	"deathRate" integer,
	"guardianId" text,
	"governorIds" jsonb DEFAULT '[]'::jsonb,
	"opensAt" timestamp,
	"closesAt" timestamp,
	"notes" text,
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"discordId" text,
	"role" "app_role" DEFAULT 'member' NOT NULL,
	"roleSource" "role_source" DEFAULT 'discord' NOT NULL,
	"rolePinned" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_discordId_unique" UNIQUE("discordId")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation" ADD CONSTRAINT "participation_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation" ADD CONSTRAINT "participation_memberId_member_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;