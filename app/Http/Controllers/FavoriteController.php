<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $favorites = Favorite::with('book')
            ->where('member_id', $member->id)
            ->latest()
            ->get();

        return response()->json($favorites);
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

        $favorite = DB::transaction(function () use ($validated, $member) {
            $member = $member->newQuery()
                ->lockForUpdate()
                ->findOrFail($member->id);

            $alreadyFavorite = Favorite::where('member_id', $member->id)
                ->where('book_id', $validated['book_id'])
                ->exists();

            if ($alreadyFavorite) {
                abort(422, 'Buku sudah ada di favorit');
            }

            $favoriteCount = Favorite::where('member_id', $member->id)->count();

            if ($favoriteCount >= 4) {
                abort(422, 'Maksimal 4 buku favorit');
            }

            return Favorite::create([
                'member_id' => $member->id,
                'book_id' => $validated['book_id'],
            ]);
        });

        return response()->json([
            'message' => 'Buku ditambahkan ke favorit',
            'data' => $favorite->load('book'),
        ], 201);
    }

    public function destroy(Request $request, int $book)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $favorite = Favorite::where('member_id', $member->id)
            ->where('book_id', $book)
            ->first();

        if (!$favorite) {
            return response()->json([
                'message' => 'Buku tidak ada di favorit',
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Buku dihapus dari favorit',
        ]);
    }
}