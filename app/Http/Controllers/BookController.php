<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index()
    {
        $books = Book::with(['category', 'reviews.member'])
            ->orderBy('judul')
            ->get();

        return response()->json($books);
    }

    public function catalog(Request $request)
    {
        $query = Book::with(['category', 'reviews.member'])
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

    public function newArrivals()
    {
        $books = Book::with(['category', 'reviews.member'])
            ->latest('created_at')
            ->take(6)
            ->get();

        return response()->json($books);
    }

    public function store(Request $request)
    {
        $rules = [
            'category_id' => 'required',
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'nullable|string|max:255',
            'tahun_terbit' => 'nullable|digits:4|integer|min:1000|max:' . date('Y'),
            'isbn' => 'nullable|regex:/^[0-9-]+$/|max:255',
            'deskripsi' => 'nullable|string',
            'stok' => 'required|integer|min:0',
        ];

        if ($request->hasFile('cover')) {
            $rules['cover'] = 'required|image|mimes:jpeg,png,jpg,webp,gif,jfif|max:10240';
        } else {
            $rules['cover'] = 'nullable';
        }

        $messages = [
            'judul.required' => 'Judul buku wajib diisi.',
            'category_id.required' => 'Kategori buku wajib dipilih.',
            'penulis.required' => 'Nama penulis wajib diisi.',
            'stok.required' => 'Jumlah stok fisik wajib diisi.',
            'stok.integer' => 'Jumlah stok fisik harus berupa angka bulat.',
            'stok.min' => 'Jumlah stok fisik minimal 0.',
            'tahun_terbit.digits' => 'Tahun terbit harus terdiri dari 4 angka.',
            'tahun_terbit.integer' => 'Tahun terbit harus berupa angka.',
            'isbn.regex' => 'ISBN hanya boleh berisi angka dan tanda hubung (-).',
            'cover.image' => 'Berkas sampul harus berupa gambar (JPG, JPEG, PNG, WEBP, atau GIF).',
            'cover.max' => 'Ukuran berkas sampul tidak boleh melebihi 10 MB.',
        ];

        $validated = $request->validate($rules, $messages);
        $validated['category_id'] = (int) $validated['category_id'];
        $validated['stok'] = (int) $validated['stok'];

        if ($request->hasFile('cover')) {
            $validated['cover'] = $request->file('cover')->store('books/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            $validated['cover'] = $request->cover_url;
        } elseif ($request->filled('cover') && is_string($request->cover) && (str_starts_with($request->cover, 'http://') || str_starts_with($request->cover, 'https://'))) {
            $validated['cover'] = $request->cover;
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
            'category_id' => 'required',
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'nullable|string|max:255',
            'tahun_terbit' => 'nullable|digits:4|integer|min:1000|max:' . date('Y'),
            'isbn' => 'nullable|regex:/^[0-9-]+$/|max:255',
            'deskripsi' => 'nullable|string',
            'stok' => 'required|integer|min:0',
        ];

        if ($request->hasFile('cover')) {
            $rules['cover'] = 'required|image|mimes:jpeg,png,jpg,webp,gif,jfif|max:10240';
        } else {
            $rules['cover'] = 'nullable';
        }

        $messages = [
            'judul.required' => 'Judul buku wajib diisi.',
            'category_id.required' => 'Kategori buku wajib dipilih.',
            'penulis.required' => 'Nama penulis wajib diisi.',
            'stok.required' => 'Jumlah stok fisik wajib diisi.',
            'stok.integer' => 'Jumlah stok fisik harus berupa angka bulat.',
            'stok.min' => 'Jumlah stok fisik minimal 0.',
            'tahun_terbit.digits' => 'Tahun terbit harus terdiri dari 4 angka.',
            'tahun_terbit.integer' => 'Tahun terbit harus berupa angka.',
            'isbn.regex' => 'ISBN hanya boleh berisi angka dan tanda hubung (-).',
            'cover.image' => 'Berkas sampul harus berupa gambar (JPG, JPEG, PNG, WEBP, atau GIF).',
            'cover.max' => 'Ukuran berkas sampul tidak boleh melebihi 10 MB.',
        ];

        $validated = $request->validate($rules, $messages);
        $validated['category_id'] = (int) $validated['category_id'];
        $validated['stok'] = (int) $validated['stok'];

        $oldCover = $book->getRawOriginal('cover');

        if ($request->hasFile('cover')) {
            $validated['cover'] = $request->file('cover')->store('books/covers', 'public');
        } elseif ($request->filled('cover_url')) {
            $validated['cover'] = $request->cover_url;
        } elseif ($request->filled('cover') && is_string($request->cover) && (str_starts_with($request->cover, 'http://') || str_starts_with($request->cover, 'https://'))) {
            $validated['cover'] = $request->cover;
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