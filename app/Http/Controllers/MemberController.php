<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
        $members = Member::orderBy('nama')->get();

        return response()->json($members);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_anggota' => 'required|string|max:255|unique:members,nomor_anggota',
            'nama' => 'required|string|max:255',
            'kelas' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:255',
            'tanggal_daftar' => 'nullable|date',
        ]);

        $member = Member::create($validated);

        return response()->json([
            'message' => 'Anggota berhasil ditambahkan',
            'data' => $member,
        ], 201);
    }

    public function show(Member $member)
    {
        return response()->json($member);
    }

    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'nomor_anggota' => 'required|string|max:255|unique:members,nomor_anggota,' . $member->id,
            'nama' => 'required|string|max:255',
            'kelas' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:255',
            'tanggal_daftar' => 'nullable|date',
        ]);

        $member->update($validated);

        return response()->json([
            'message' => 'Anggota berhasil diperbarui',
            'data' => $member,
        ]);
    }

    public function destroy(Member $member)
    {
        $member->delete();

        return response()->json([
            'message' => 'Anggota berhasil dihapus',
        ]);
    }
}