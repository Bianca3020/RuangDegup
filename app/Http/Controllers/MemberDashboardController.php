<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;

class MemberDashboardController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $activeBorrowings = $member->borrowings()
            ->with('book')
            ->where('status', 'dipinjam')
            ->latest('tanggal_pinjam')
            ->get();

        $returnedCount = $member->borrowings()
            ->where('status', 'dikembalikan')
            ->count();

        $borrowedCount = $member->borrowings()->count();

        $favorites = $member->favorites()
            ->with('book')
            ->latest()
            ->get();

        $reviews = $member->reviews()
            ->with('book')
            ->latest()
            ->get();

        $hariIni = Carbon::today('Asia/Jakarta');

        $activeBorrowings->transform(function ($borrowing) use ($hariIni) {
            $tanggalPinjam = Carbon::parse(
                $borrowing->tanggal_pinjam->format('Y-m-d'),
                'Asia/Jakarta'
            );

            $jatuhTempo = $tanggalPinjam->copy()->addDays(7);

            $statusTampilan = 'Dipinjam';
            $terlambatHari = 0;

            if ($jatuhTempo->lt($hariIni)) {
                $statusTampilan = 'Terlambat';
                $terlambatHari = $jatuhTempo->diffInDays($hariIni);
            } elseif ($jatuhTempo->isSameDay($hariIni)) {
                $statusTampilan = 'Jatuh Tempo';
            }

            $borrowing->jatuh_tempo = $jatuhTempo->format('Y-m-d');
            $borrowing->status_tampilan = $statusTampilan;
            $borrowing->terlambat_hari = $terlambatHari;

            return $borrowing;
        });

        return response()->json([
            'profile' => [
                'id' => $member->id,
                'nomor_anggota' => $member->nomor_anggota,
                'nama' => $member->nama,
                'kelas' => $member->kelas,
                'bio' => $member->bio,
                'profile_photo' => $member->profile_photo,
                'profile_background' => $member->profile_background,
            ],

            'summary' => [
                'total_borrowings' => $borrowedCount,
                'active_borrowings' => $activeBorrowings->count(),
                'returned_books' => $returnedCount,
                'favorite_books' => $favorites->count(),
                'reviews' => $reviews->count(),
            ],

            'active_borrowings' => $activeBorrowings,

            'favorites' => $favorites,

            'reviews' => $reviews,
        ]);
    }
}