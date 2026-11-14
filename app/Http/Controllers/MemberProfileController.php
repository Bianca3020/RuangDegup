<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

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
            'nama' => 'sometimes|required|string|max:255',
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string|max:500',
            'bio' => 'nullable|string|max:1000',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'profile_background' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $oldPhoto = $member->profile_photo;
        $oldBackground = $member->profile_background;

        if ($request->hasFile('profile_photo')) {
            $validated['profile_photo'] = $request
                ->file('profile_photo')
                ->store("profiles/{$member->id}/photo", 'public');
        }

        if ($request->hasFile('profile_background')) {
            $validated['profile_background'] = $request
                ->file('profile_background')
                ->store("profiles/{$member->id}/background", 'public');
        }

        $member->update($validated);

        if (!empty($validated['nama']) && $request->user()) {
            $request->user()->update(['name' => $validated['nama']]);
        }

        if (
            $request->hasFile('profile_photo') &&
            $oldPhoto &&
            $oldPhoto !== $member->profile_photo
        ) {
            Storage::disk('public')->delete($oldPhoto);
        }

        if (
            $request->hasFile('profile_background') &&
            $oldBackground &&
            $oldBackground !== $member->profile_background
        ) {
            Storage::disk('public')->delete($oldBackground);
        }

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

    public function deletePhoto(Request $request)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        if ($member->profile_photo) {
            Storage::disk('public')->delete($member->profile_photo);

            $member->update([
                'profile_photo' => null,
            ]);
        }

        return response()->json([
            'message' => 'Foto profil berhasil dihapus',
        ]);
    }

    public function deleteBackground(Request $request)
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'message' => 'Data anggota tidak ditemukan',
            ], 404);
        }

        if ($member->profile_background) {
            Storage::disk('public')->delete($member->profile_background);

            $member->update([
                'profile_background' => null,
            ]);
        }

        return response()->json([
            'message' => 'Background profil berhasil dihapus',
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'new_password.required' => 'Password baru wajib diisi.',
            'new_password.min' => 'Password baru minimal harus 6 karakter.',
            'new_password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Password saat ini tidak sesuai.',
                'errors' => [
                    'current_password' => ['Password saat ini yang Anda masukkan salah.']
                ]
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'message' => 'Password Anda berhasil diperbarui!',
        ]);
    }
}