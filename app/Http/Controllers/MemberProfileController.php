<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MemberProfileController extends Controller
{
    public function show(Request $request)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'id' => $member->id,
            'nomor_anggota' => $member->nomor_anggota,
            'nama' => $member->nama,
            'kelas' => $member->kelas,
            'alamat' => $member->alamat,
            'no_hp' => $member->no_hp,
            'bio' => $member->bio,
            'profile_photo' => $member->profile_photo
                ? Storage::disk('public')->url($member->profile_photo)
                : null,
            'profile_background' => $member->profile_background
                ? Storage::disk('public')->url($member->profile_background)
                : null,
        ]);
    }

    public function update(Request $request)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'bio' => 'nullable|string|max:1000',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'profile_background' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('profile_photo')) {
            if ($member->profile_photo) {
                Storage::disk('public')->delete($member->profile_photo);
            }

            $validated['profile_photo'] = $request
                ->file('profile_photo')
                ->store('profiles/photos', 'public');
        }

        if ($request->hasFile('profile_background')) {
            if ($member->profile_background) {
                Storage::disk('public')->delete($member->profile_background);
            }

            $validated['profile_background'] = $request
                ->file('profile_background')
                ->store('profiles/backgrounds', 'public');
        }

        $member->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data' => [
                'id' => $member->id,
                'nomor_anggota' => $member->nomor_anggota,
                'nama' => $member->nama,
                'kelas' => $member->kelas,
                'alamat' => $member->alamat,
                'no_hp' => $member->no_hp,
                'bio' => $member->bio,
                'profile_photo' => $member->profile_photo
                    ? Storage::disk('public')->url($member->profile_photo)
                    : null,
                'profile_background' => $member->profile_background
                    ? Storage::disk('public')->url($member->profile_background)
                    : null,
            ],
        ]);
    }
}