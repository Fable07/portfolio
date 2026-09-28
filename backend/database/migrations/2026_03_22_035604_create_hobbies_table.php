<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations — creates the hobbies table
     */
    public function up(): void
    {
        Schema::create('hobbies', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // Hobby name e.g. "Photography"
            $table->string('icon')->nullable();         // Emoji or icon URL
            $table->text('description')->nullable();    // Short description
            $table->integer('order')->default(0);       // Display order
            $table->timestamps();
        });
    }

    /**
     * Reverse the migration
     */
    public function down(): void
    {
        Schema::dropIfExists('hobbies');
    }
};
