<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 3 — admin-editable profile and content publishing.
 *
 *  profile (single row)  name, roles, about, avatar, skills, social links… edited in /admin/profile
 *  projects.is_published / certifications.is_published  drafts are hidden from the public site
 *  projects.is_featured  shown in "Featured projects" on the home page
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profile', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('handle', 30)->nullable();       // terminal prompt user, e.g. "jefferson"
            $table->string('email')->nullable();
            $table->string('location')->nullable();
            $table->string('availability', 80)->nullable(); // e.g. "Open to work" (empty = hidden)
            $table->json('roles')->nullable();               // ["Aspiring Fullstack Developer", …]
            $table->json('about')->nullable();               // paragraphs
            $table->json('avatar')->nullable();              // MediaItem
            $table->json('skill_groups')->nullable();        // [{ title, skills: [{ name, icon, icon_media }] }]
            $table->json('social_links')->nullable();        // [{ label, href, icon }]
            $table->timestamps();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->boolean('is_published')->default(true);
            $table->boolean('is_featured')->default(false);
        });

        Schema::table('certifications', function (Blueprint $table) {
            $table->boolean('is_published')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profile');
        Schema::table('projects', fn (Blueprint $table) => $table->dropColumn(['is_published', 'is_featured']));
        Schema::table('certifications', fn (Blueprint $table) => $table->dropColumn('is_published'));
    }
};
