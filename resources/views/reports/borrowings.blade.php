<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">

    <title>Laporan Peminjaman RuangDegup</title>

    <style>
        @page {
            margin: 30px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #222;
        }

        h1 {
            text-align: center;
            margin-bottom: 5px;
        }

        .subtitle {
            text-align: center;
            margin-bottom: 25px;
            color: #666;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #999;
            padding: 7px;
        }

        th {
            text-align: center;
        }

        td.center {
            text-align: center;
        }

        .footer {
            margin-top: 20px;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>

<body>

    <h1>Laporan Peminjaman Buku</h1>

    <div class="subtitle">
        RuangDegup
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nomor Anggota</th>
                <th>Nama Anggota</th>
                <th>Judul Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Tanggal Kembali</th>
                <th>Status</th>
                <th>Terlambat</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($borrowings as $borrowing)
                <tr>
                    <td class="center">{{ $loop->iteration }}</td>

                    <td class="center">
                        {{ $borrowing->member->nomor_anggota }}
                    </td>

                    <td>
                        {{ $borrowing->member->nama }}
                    </td>

                    <td>
                        {{ $borrowing->book->judul }}
                    </td>

                    <td class="center">
                        {{ $borrowing->tanggal_pinjam->format('d/m/Y') }}
                    </td>

                    <td class="center">
                        {{ $borrowing->jatuh_tempo->format('d/m/Y') }}
                    </td>

                    <td class="center">
                        {{ $borrowing->tanggal_kembali
                            ? $borrowing->tanggal_kembali->format('d/m/Y')
                            : '-' }}
                    </td>

                    <td class="center">
                        {{ $borrowing->status_tampilan }}
                    </td>

                    <td class="center">
                        {{ $borrowing->terlambat_hari > 0
                            ? $borrowing->terlambat_hari . ' hari'
                            : '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="center">
                        Belum ada data peminjaman.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada {{ now()->format('d/m/Y H:i') }}
    </div>

</body>
</html>