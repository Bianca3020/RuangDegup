<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use Barryvdh\DomPDF\Facade\Pdf;
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

        $hariIni = Carbon::today('Asia/Jakarta');

        $borrowings = $query->get()->map(function ($borrowing) use ($hariIni) {
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
    public function exportPdf(Request $request)
    {
        $query = Borrowing::with(['member', 'book'])
            ->latest('tanggal_pinjam');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $hariIni = Carbon::today('Asia/Jakarta');

        $borrowings = $query->get()->map(function ($borrowing) use ($hariIni) {
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

        $pdf = Pdf::loadView('reports.borrowings', [
            'borrowings' => $borrowings,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('laporan-peminjaman.pdf');
    }
}