<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowingController extends Controller
{
    public function index()
    {
        $borrowings = Borrowing::with(['member', 'book'])
            ->latest('tanggal_pinjam')
            ->get()
            ->map(function ($borrowing) {
                $borrowing->jatuh_tempo = $borrowing->tanggal_pinjam
                    ->copy()
                    ->addDays(7);

                return $borrowing;
            });

        return response()->json($borrowings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'book_id' => 'required|exists:books,id',
            'tanggal_pinjam' => 'required|date',
        ]);

        $borrowing = DB::transaction(function () use ($validated) {

            $book = Book::lockForUpdate()->findOrFail($validated['book_id']);

            if ($book->stok <= 0) {
                abort(422, 'Stok buku sedang habis');
            }

            $book->decrement('stok');

            return Borrowing::create([
                'member_id' => $validated['member_id'],
                'book_id' => $validated['book_id'],
                'tanggal_pinjam' => $validated['tanggal_pinjam'],
                'tanggal_kembali' => null,
                'status' => 'dipinjam',
            ]);
        });

        return response()->json([
            'message' => 'Peminjaman berhasil ditambahkan',
            'data' => $borrowing->load(['member', 'book']),
        ], 201);
    }

    public function show(Borrowing $borrowing)
    {
        $borrowing->load(['member', 'book']);

        $borrowing->jatuh_tempo = $borrowing->tanggal_pinjam
            ->copy()
            ->addDays(7);

        return response()->json($borrowing);
    }

    public function update(Request $request, Borrowing $borrowing)
    {
        $validated = $request->validate([
            'tanggal_kembali' => 'required|date|after_or_equal:' . $borrowing->tanggal_pinjam,
        ]);

        if ($borrowing->status === 'dikembalikan') {
            return response()->json([
                'message' => 'Buku sudah dikembalikan sebelumnya',
            ], 422);
        }

        DB::transaction(function () use ($borrowing, $validated) {

            $book = Book::lockForUpdate()->findOrFail($borrowing->book_id);

            $borrowing->update([
                'tanggal_kembali' => $validated['tanggal_kembali'],
                'status' => 'dikembalikan',
            ]);

            $book->increment('stok');
        });

        return response()->json([
            'message' => 'Buku berhasil dikembalikan',
            'data' => $borrowing->load(['member', 'book']),
        ]);
    }

    public function destroy(Borrowing $borrowing)
    {
        return response()->json([
            'message' => 'Data peminjaman merupakan riwayat transaksi dan tidak dapat dihapus',
        ], 422);
    }
}