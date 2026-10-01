<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrowing;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MemberBorrowingController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $hariIni = Carbon::today('Asia/Jakarta');

        $borrowings = Borrowing::with('book')
            ->where('member_id', $member->id)
            ->latest('tanggal_pinjam')
            ->get()
            ->map(function ($borrowing) use ($hariIni) {
                $tanggalPinjam = Carbon::parse(
                    $borrowing->tanggal_pinjam->format('Y-m-d'),
                    'Asia/Jakarta'
                );

                $jatuhTempo = $tanggalPinjam->copy()->addDays(7);

                $statusTampilan = 'Dikembalikan';
                $terlambatHari = 0;

                if ($borrowing->status === 'dipinjam') {
                    if ($jatuhTempo->lt($hariIni)) {
                        $statusTampilan = 'Terlambat';
                        $terlambatHari = $jatuhTempo->diffInDays($hariIni);
                    } elseif ($jatuhTempo->isSameDay($hariIni)) {
                        $statusTampilan = 'Jatuh Tempo';
                    } else {
                        $statusTampilan = 'Dipinjam';
                    }
                }

                $borrowing->jatuh_tempo = $jatuhTempo;
                $borrowing->status_tampilan = $statusTampilan;
                $borrowing->terlambat_hari = $terlambatHari;

                return $borrowing;
            });

        return response()->json($borrowings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $borrowing = DB::transaction(function () use ($validated, $member) {
            $book = Book::lockForUpdate()->findOrFail($validated['book_id']);

            $alreadyBorrowed = Borrowing::where('member_id', $member->id)
                ->where('book_id', $book->id)
                ->where('status', 'dipinjam')
                ->lockForUpdate()
                ->exists();

            if ($alreadyBorrowed) {
                abort(422, 'Buku ini masih sedang dipinjam');
            }

            if ($book->stok <= 0) {
                abort(422, 'Stok buku sedang habis');
            }

            $tanggalPinjam = Carbon::today('Asia/Jakarta')->format('Y-m-d');

            $book->decrement('stok');

            return Borrowing::create([
                'member_id' => $member->id,
                'book_id' => $book->id,
                'tanggal_pinjam' => $tanggalPinjam,
                'tanggal_kembali' => null,
                'status' => 'dipinjam',
            ]);
        });
        
        return response()->json([
            'message' => 'Peminjaman berhasil dibuat',
            'data' => $borrowing->load('book'),
        ], 201);
    }
}