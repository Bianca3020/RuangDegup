<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function borrowings(Request $request)
    {
        $query = Borrowing::with(['member', 'book'])
            ->latest('tanggal_pinjam');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $borrowings = $query->get()->map(function ($borrowing) {
            $jatuhTempo = $borrowing->tanggal_pinjam
                ->copy()
                ->addDays(7);

            $statusTampilan = 'Dikembalikan';
            $terlambatHari = 0;

            if ($borrowing->status === 'dipinjam') {
                if ($jatuhTempo->lt(Carbon::today())) {
                    $statusTampilan = 'Terlambat';
                    $terlambatHari = $jatuhTempo->diffInDays(Carbon::today());
                } elseif ($jatuhTempo->isToday()) {
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
}