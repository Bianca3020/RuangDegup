<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $reviews = Review::with('book')
            ->where('member_id', $member->id)
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'rating' => 'required|integer|min:1|max:5',
            'ulasan' => 'nullable|string',
        ]);

        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $alreadyReviewed = Review::where('member_id', $member->id)
            ->where('book_id', $validated['book_id'])
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'message' => 'Buku ini sudah pernah direview',
            ], 422);
        }

        $review = Review::create([
            'member_id' => $member->id,
            'book_id' => $validated['book_id'],
            'rating' => $validated['rating'],
            'ulasan' => $validated['ulasan'] ?? null,
        ]);

        return response()->json([
            'message' => 'Review berhasil ditambahkan',
            'data' => $review->load('book'),
        ], 201);
    }

    public function update(Request $request, int $review)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $reviewData = Review::where('id', $review)
            ->where('member_id', $member->id)
            ->first();

        if (!$reviewData) {
            return response()->json([
                'message' => 'Review tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'ulasan' => 'nullable|string',
        ]);

        $reviewData->update($validated);

        return response()->json([
            'message' => 'Review berhasil diperbarui',
            'data' => $reviewData->load('book'),
        ]);
    }

    public function destroy(Request $request, int $review)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $reviewData = Review::where('id', $review)
            ->where('member_id', $member->id)
            ->first();

        if (!$reviewData) {
            return response()->json([
                'message' => 'Review tidak ditemukan',
            ], 404);
        }

        $reviewData->delete();

        return response()->json([
            'message' => 'Review berhasil dihapus',
        ]);
    }
}