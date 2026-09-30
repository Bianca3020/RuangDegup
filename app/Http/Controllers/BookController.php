<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index()
    {
        $books = Book::with('category')
            ->orderBy('judul')
            ->get();

        return response()->json($books);
    }

    public function catalog(Request $request)
    {
        $query = Book::with('category')
            ->orderBy('judul');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                ->orWhere('penulis', 'like', "%{$search}%");
            });
        }

        if ($request->filled('kategori')) {
            $query->where('category_id', $request->kategori);
        }

        $books = $query->paginate(10);

        return response()->json($books);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'nullable|string|max:255',
            'tahun_terbit' => 'nullable|integer|min:1000|max:'.date('Y'),
            'isbn' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'stok' => 'required|integer|min:0',
            'cover' => 'nullable|string|max:255',
        ]);

        $book = Book::create($validated);

        return response()->json([
            'message' => 'Buku berhasil ditambahkan',
            'data' => $book,
        ], 201);
    }

    public function show(Book $book)
    {
        return response()->json(
            $book->load('category')
        );
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'nullable|string|max:255',
            'tahun_terbit' => 'nullable|integer|min:1000|max:'.date('Y'),
            'isbn' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'stok' => 'required|integer|min:0',
            'cover' => 'nullable|string|max:255',
        ]);

        $book->update($validated);

        return response()->json([
            'message' => 'Buku berhasil diperbarui',
            'data' => $book,
        ]);
    }

    public function destroy(Book $book)
    {
        if ($book->borrowings()->exists()) {
            return response()->json([
                'message' => 'Buku tidak dapat dihapus karena sudah memiliki riwayat peminjaman',
            ], 422);
        }

        $book->delete();

        return response()->json([
            'message' => 'Buku berhasil dihapus',
        ]);
    }
}