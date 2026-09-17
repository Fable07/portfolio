<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resume', function (Blueprint $table) {
            $table->id();
            $table->string('pdf_url')->nullable();
            $table->timestamps();
        });

        // Insert initial row
        DB::table('resume')->insert(['pdf_url' => '/resume.pdf']);
    }

    public function down(): void
    {
        Schema::dropIfExists('resume');
    }
};
