<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Member;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin default
        User::updateOrCreate(
            ['email' => 'admin@ruangdegup.com'],
            [
                'name' => 'Admin RuangDegup',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Member demo
        $memberUser = User::updateOrCreate(
            ['email' => 'bianca@ruangdegup.local'],
            [
                'name' => 'Bianca',
                'password' => Hash::make('RuangDegup123!'),
                'role' => 'member',
            ]
        );

        Member::updateOrCreate(
            ['user_id' => $memberUser->id],
            [
                'nomor_anggota' => 'MBR-' . date('Y') . '-' . str_pad($memberUser->id, 4, '0', STR_PAD_LEFT),
                'nama' => 'Bianca',
                'kelas' => 'XI PPLG',
                'no_hp' => '081234567890',
                'alamat' => 'Surakarta',
                'tanggal_daftar' => now()->toDateString(),
            ]
        );
    }
}

