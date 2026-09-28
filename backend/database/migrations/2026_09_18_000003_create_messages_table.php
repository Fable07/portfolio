<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Messages sent through the public contact form, read in the admin inbox.
 * `read_at` is null while the message is unread (that drives the inbox badge).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email');
            $table->string('subject', 150)->nullable();
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->json('meta')->nullable(); // where it came from: ip, user agent
            $table->timestamps();

            $table->index('read_at'); // unread lookups
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
