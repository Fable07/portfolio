<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Case study content for a project (shown on /projects/{id}).
 *
 * JSON shape — every field optional, so a project can have a short or a full write-up:
 * {
 *   "role":       "Full-stack developer",
 *   "period":     "Jan – Mar 2026",
 *   "problem":    "…what needed solving",
 *   "approach":   "…how you built it",
 *   "outcome":    "…results and what you learned",
 *   "highlights": ["Cut load time by 60%", "…"],
 *   "sections":   [{ "heading": "Architecture", "body": "…" }]
 * }
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', fn (Blueprint $table) => $table->json('case_study')->nullable());
    }

    public function down(): void
    {
        Schema::table('projects', fn (Blueprint $table) => $table->dropColumn('case_study'));
    }
};
