<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin RuangDegup',
            'email' => 'admin@ruangdegup.com',
            'password' => 'admin123',
            'role' => 'admin',
        ]);
    }
}