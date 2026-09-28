<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrowing;
use Illuminate\Http\Request;

class BorrowingController extends Controller
{
    public function index()
    {
        $borrowings = Borrowing::with(['member', 'book'])
            ->latest('tanggal_pinjam')
            ->get();

        return response()->json($borrowings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'book_id' => 'required|exists:books,id',
            'tanggal_pinjam' => 'required|date',
            'tanggal_kembali' => 'nullable|date|after_or_equal:tanggal_pinjam',
            'status' => 'required|in:dipinjam,dikembalikan',
        ]);

        $borrowing = Borrowing::create($validated);

        return response()->json([
            'message' => 'Peminjaman berhasil ditambahkan',
            'data' => $borrowing->load(['member', 'book']),
        ], 201);
    }

    public function show(Borrowing $borrowing)
    {
        return response()->json(
            $borrowing->load(['member', 'book'])
        );
    }

    public function update(Request $request, Borrowing $borrowing)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'book_id' => 'required|exists:books,id',
            'tanggal_pinjam' => 'required|date',
            'tanggal_kembali' => 'nullable|date|after_or_equal:tanggal_pinjam',
            'status' => 'required|in:dipinjam,dikembalikan',
        ]);

        $borrowing->update($validated);

        return response()->json([
            'message' => 'Peminjaman berhasil diperbarui',
            'data' => $borrowing->load(['member', 'book']),
        ]);
    }

    public function destroy(Borrowing $borrowing)
    {
        $borrowing->delete();

        return response()->json([
            'message' => 'Peminjaman berhasil dihapus',
        ]);
    }
}