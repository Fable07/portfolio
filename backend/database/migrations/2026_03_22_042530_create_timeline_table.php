<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations — creates the timeline table
     * for education and work experience entries
     */
    public function up(): void
    {
        Schema::create('timeline', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['education', 'work']);   // education or work experience
            $table->string('title');                        // e.g. "Bachelor of Science in IT"
            $table->string('institution');                  // e.g. "Gordon College"
            $table->string('location')->nullable();         // e.g. "Olongapo City"
            $table->string('start_date');                   // e.g. "2020" or "Jun 2020"
            $table->string('end_date')->nullable();         // e.g. "2024" or "Present"
            $table->text('description')->nullable();        // Short description of role/course
            $table->integer('order')->default(0);           // Display order
            $table->timestamps();
        });
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        Schema::dropIfExists('timeline');
    }
};
