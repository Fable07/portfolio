<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// php artisan admin:create you@example.com --name="Your Name"
Artisan::command('admin:create {email} {--name=Admin}', function (string $email) {
    $password = $this->secret('Password (min 12 characters)');
    $confirm = $this->secret('Confirm password');

    if (strlen((string) $password) < 12) {
        $this->error('Password must be at least 12 characters.');
        return 1;
    }
    if ($password !== $confirm) {
        $this->error('Passwords do not match.');
        return 1;
    }

    $user = \App\Models\User::updateOrCreate(
        ['email' => $email],
        ['name' => $this->option('name'), 'password' => $password],
    );
    $user->tokens()->delete();

    $this->info("Admin account ready for {$user->email}. Existing sessions were signed out.");
    return 0;
})->purpose('Create an admin account or reset its password');
