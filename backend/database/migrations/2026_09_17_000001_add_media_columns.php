<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds JSON media columns. Only file DESCRIPTIONS (url, type, size…) are stored
 * here — the files themselves live in the media storage driver (see config/media.php).
 *
 *  projects.media        array  gallery: images, uploaded videos, YouTube/Vimeo embeds
 *  certifications.badge  object badge / certificate image
 *  hobbies.image         object optional photo
 *  resume.pdf            object uploaded resume PDF
 *
 * Existing URL columns (thumbnail_url, badge_url, pdf_url) are kept and filled
 * automatically from these, so older data and clients keep working.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', fn (Blueprint $table) => $table->json('media')->nullable());
        Schema::table('certifications', fn (Blueprint $table) => $table->json('badge')->nullable());
        Schema::table('hobbies', fn (Blueprint $table) => $table->json('image')->nullable());
        Schema::table('resume', fn (Blueprint $table) => $table->json('pdf')->nullable());
    }

    public function down(): void
    {
        Schema::table('projects', fn (Blueprint $table) => $table->dropColumn('media'));
        Schema::table('certifications', fn (Blueprint $table) => $table->dropColumn('badge'));
        Schema::table('hobbies', fn (Blueprint $table) => $table->dropColumn('image'));
        Schema::table('resume', fn (Blueprint $table) => $table->dropColumn('pdf'));
    }
};
