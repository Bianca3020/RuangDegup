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
        Schema::create('footer_quotes', function (Blueprint $table) {
            $table->id();
            $table->text('quote');
            $table->string('author');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        \Illuminate\Support\Facades\DB::table('footer_quotes')->insert([
            [
                'quote' => 'Di antara halaman yang terbuka, selalu ada kemungkinan untuk menemukan diri sendiri.',
                'author' => 'Ruang Degup',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quote' => 'Sebuah buku adalah gerbang sunyi menuju ribuan semesta baru. Di RuangDegup, kami merawat kecintaan membaca dengan tenang dan hangat.',
                'author' => 'Redaksi RuangDegup',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quote' => 'Membaca bukan sekadar mengeja kata, melainkan merayakan percakapan dengan jiwa-jiwa terdahulu.',
                'author' => 'Pramoedya Ananta Toer',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quote' => 'Buku adalah sahabat paling hening dan setia, guru paling bijak dan terbuka.',
                'author' => 'Charles W. Eliot',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quote' => 'Ada keajaiban yang tak terjelaskan saat aroma lembar kertas bertemu dengan rasa ingin tahu manusia.',
                'author' => 'Ruang Degup',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('footer_quotes');
    }
};
