<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrowing;
use App\Models\Category;
use App\Models\Member;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $totalBuku = Book::count();
        $totalStok = Book::sum('stok');
        $totalKategori = Category::count();
        $totalAnggota = Member::count();

        $peminjamanAktif = Borrowing::where('status', 'dipinjam')->get();

        $sedangDipinjam = $peminjamanAktif->count();

        $terlambat = $peminjamanAktif
            ->filter(function ($borrowing) {
                $jatuhTempo = $borrowing->tanggal_pinjam
                    ->copy()
                    ->addDays(7);

                return $jatuhTempo->lt(Carbon::today());
            })
            ->count();

        $sudahDikembalikan = Borrowing::where('status', 'dikembalikan')->count();

        return response()->json([
            'total_buku' => $totalBuku,
            'total_stok' => $totalStok,
            'total_kategori' => $totalKategori,
            'total_anggota' => $totalAnggota,
            'sedang_dipinjam' => $sedangDipinjam,
            'sudah_dikembalikan' => $sudahDikembalikan,
            'terlambat' => $terlambat,
        ]);
    }
}