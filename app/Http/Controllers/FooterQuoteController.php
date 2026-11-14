<?php

namespace App\Http\Controllers;

use App\Models\FooterQuote;
use Illuminate\Http\Request;

class FooterQuoteController extends Controller
{
    /**
     * Public endpoint: Get a random active quote, avoiding immediate repetition.
     */
    public function random(Request $request)
    {
        $excludeId = $request->query('exclude');

        $query = FooterQuote::where('is_active', true);

        if ($excludeId) {
            $hasOthers = (clone $query)->where('id', '!=', $excludeId)->exists();
            if ($hasOthers) {
                $query->where('id', '!=', $excludeId);
            }
        }

        $quote = $query->inRandomOrder()->first();

        // If no quote matched with filter, fallback to any active quote
        if (!$quote) {
            $quote = FooterQuote::where('is_active', true)->inRandomOrder()->first();
        }

        return response()->json([
            'status' => 'success',
            'data' => $quote,
        ]);
    }

    /**
     * Public endpoint: Get list of active quotes.
     */
    public function publicQuotes()
    {
        $quotes = FooterQuote::where('is_active', true)
            ->select('id', 'quote', 'author')
            ->get();

        return response()->json($quotes);
    }

    /**
     * Admin: Get all quotes.
     */
    public function index()
    {
        $quotes = FooterQuote::latest('created_at')->get();
        return response()->json($quotes);
    }

    /**
     * Admin: Store a new quote.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'quote' => 'required|string',
            'author' => 'required|string|max:255',
            'is_active' => 'nullable|boolean',
        ], [
            'quote.required' => 'Isi kutipan puitis wajib diisi.',
            'author.required' => 'Nama penulis / sumber kutipan wajib diisi.',
        ]);

        $validated['is_active'] = $request->has('is_active') ? (bool) $request->is_active : true;

        $quote = FooterQuote::create($validated);

        return response()->json([
            'message' => 'Kutipan berhasil ditambahkan.',
            'data' => $quote,
        ], 201);
    }

    /**
     * Admin: Display the specified quote.
     */
    public function show(FooterQuote $footerQuote)
    {
        return response()->json($footerQuote);
    }

    /**
     * Admin: Update the specified quote.
     */
    public function update(Request $request, FooterQuote $footerQuote)
    {
        $validated = $request->validate([
            'quote' => 'required|string',
            'author' => 'required|string|max:255',
            'is_active' => 'nullable|boolean',
        ], [
            'quote.required' => 'Isi kutipan puitis wajib diisi.',
            'author.required' => 'Nama penulis / sumber kutipan wajib diisi.',
        ]);

        if ($request->has('is_active')) {
            $validated['is_active'] = (bool) $request->is_active;
        }

        $footerQuote->update($validated);

        return response()->json([
            'message' => 'Kutipan berhasil diperbarui.',
            'data' => $footerQuote,
        ]);
    }

    /**
     * Admin: Toggle quote active status.
     */
    public function toggle(FooterQuote $footerQuote)
    {
        $footerQuote->update([
            'is_active' => !$footerQuote->is_active,
        ]);

        $statusText = $footerQuote->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "Kutipan berhasil {$statusText}.",
            'data' => $footerQuote,
        ]);
    }

    /**
     * Admin: Delete the quote.
     */
    public function destroy(FooterQuote $footerQuote)
    {
        $footerQuote->delete();

        return response()->json([
            'message' => 'Kutipan berhasil dihapus.',
        ]);
    }
}
