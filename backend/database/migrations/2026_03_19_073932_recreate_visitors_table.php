<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the old visitors table
        Schema::dropIfExists('visitors');

        // Create new visitors table with per-visit tracking
        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id'); // unique identifier per browser
            $table->timestamp('visited_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
