<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $rules = [
            'category_id' => 'required|exists:categories,id',
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'nullable|string|max:255',
            'tahun_terbit' => 'nullable|integer|min:1000|max:'.date('Y'),
            'isbn' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'stok' => 'required|integer|min:0',
        ];

        if ($request->hasFile('cover')) {
            $rules['cover'] = 'required|image|mimes:jpg,jpeg,png,webp|max:2048';
        } else {
            $rules['cover'] = 'nullable';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('cover')) {
            $validated['cover'] = $request->file('cover')->store('books/covers', 'public');
        } else {
            unset($validated['cover']);
        }

        $book = Book::create($validated);

        return response()->json([
            'message' => 'Buku berhasil ditambahkan',
            'data' => $book->load('category'),
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
        $rules = [
            'category_id' => 'required|exists:categories,id',
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'nullable|string|max:255',
            'tahun_terbit' => 'nullable|integer|min:1000|max:'.date('Y'),
            'isbn' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'stok' => 'required|integer|min:0',
        ];

        if ($request->hasFile('cover')) {
            $rules['cover'] = 'required|image|mimes:jpg,jpeg,png,webp|max:2048';
        }

        $validated = $request->validate($rules);

        $oldCover = $book->getRawOriginal('cover');

        if ($request->hasFile('cover')) {
            $validated['cover'] = $request->file('cover')->store('books/covers', 'public');
        } else {
            // Keep existing cover if not replaced
            unset($validated['cover']);
        }

        $book->update($validated);

        if ($request->hasFile('cover') && $oldCover && $oldCover !== $validated['cover']) {
            if (!str_starts_with($oldCover, 'http') && Storage::disk('public')->exists($oldCover)) {
                Storage::disk('public')->delete($oldCover);
            }
        }

        return response()->json([
            'message' => 'Buku berhasil diperbarui',
            'data' => $book->load('category'),
        ]);
    }

    public function destroy(Book $book)
    {
        if ($book->borrowings()->exists()) {
            return response()->json([
                'message' => 'Buku tidak dapat dihapus karena sudah memiliki riwayat peminjaman',
            ], 422);
        }

        $oldCover = $book->getRawOriginal('cover');

        $book->delete();

        if ($oldCover && !str_starts_with($oldCover, 'http') && Storage::disk('public')->exists($oldCover)) {
            Storage::disk('public')->delete($oldCover);
        }

        return response()->json([
            'message' => 'Buku berhasil dihapus',
        ]);
    }
}