import { useState, useEffect, useRef, useCallback } from 'react'
import {
  UserIcon,
  CameraIcon,
  TrashIcon,
  ImageIcon,
  ArrowLeft,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshIcon,
  BookOpenIcon,
  PhoneIcon,
  MapPinIcon,
  MailIcon,
  TagIcon,
} from '../common/Icons'
import { Button } from '../common/Button'
import {
  getMemberProfile,
  updateMemberProfile,
  deleteMemberPhoto,
  deleteMemberBackground,
} from '../../services/api'

export function MemberProfileView({ currentUser, onBackToDashboard, onProfileUpdated }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  // Form states
  const [bio, setBio] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [backgroundFile, setBackgroundFile] = useState(null)
  const [backgroundPreview, setBackgroundPreview] = useState(null)

  // File input refs
  const photoInputRef = useRef(null)
  const backgroundInputRef = useRef(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMemberProfile()
      setProfile(data)
      setBio(data.bio || '')
      setPhotoFile(null)
      setPhotoPreview(null)
      setBackgroundFile(null)
      setBackgroundPreview(null)
    } catch (err) {
      setError(err.message || 'Gagal memuat profil anggota. Silakan periksa koneksi Anda.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Clean up object URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview)
    }
  }, [photoPreview, backgroundPreview])

  function handlePhotoSelect(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // Validations (max 1024 KB = 1MB)
    if (file.size > 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'Ukuran foto profil tidak boleh melebihi 1 MB.',
      })
      e.target.value = ''
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setFeedback({
        type: 'error',
        message: 'Format foto harus berupa JPG, PNG, atau WEBP.',
      })
      e.target.value = ''
      return
    }

    setPhotoFile(file)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(URL.createObjectURL(file))
    setFeedback({ type: '', message: '' })
  }

  function handleBackgroundSelect(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // Validations (max 2048 KB = 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'Ukuran gambar latar belakang tidak boleh melebihi 2 MB.',
      })
      e.target.value = ''
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setFeedback({
        type: 'error',
        message: 'Format latar belakang harus berupa JPG, PNG, atau WEBP.',
      })
      e.target.value = ''
      return
    }

    setBackgroundFile(file)
    if (backgroundPreview) URL.revokeObjectURL(backgroundPreview)
    setBackgroundPreview(URL.createObjectURL(file))
    setFeedback({ type: '', message: '' })
  }

  async function handleDeletePhoto() {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) return

    try {
      setSaving(true)
      await deleteMemberPhoto()
      setPhotoFile(null)
      if (photoPreview) URL.revokeObjectURL(photoPreview)
      setPhotoPreview(null)
      setProfile((prev) => (prev ? { ...prev, profile_photo: null } : null))
      setFeedback({
        type: 'success',
        message: 'Foto profil berhasil dihapus.',
      })
      if (onProfileUpdated) onProfileUpdated()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal menghapus foto profil.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteBackground() {
    if (!window.confirm('Apakah Anda yakin ingin menghapus latar belakang profil?')) return

    try {
      setSaving(true)
      await deleteMemberBackground()
      setBackgroundFile(null)
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview)
      setBackgroundPreview(null)
      setProfile((prev) => (prev ? { ...prev, profile_background: null } : null))
      setFeedback({
        type: 'success',
        message: 'Latar belakang profil berhasil dihapus.',
      })
      if (onProfileUpdated) onProfileUpdated()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal menghapus latar belakang profil.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFeedback({ type: '', message: '' })

    try {
      const formData = new FormData()
      formData.append('bio', bio || '')

      if (photoFile) {
        formData.append('profile_photo', photoFile)
      }
      if (backgroundFile) {
        formData.append('profile_background', backgroundFile)
      }

      const res = await updateMemberProfile(formData)
      const updatedData = res.data || res

      setProfile((prev) => ({
        ...prev,
        ...updatedData,
      }))
      setPhotoFile(null)
      setPhotoPreview(null)
      setBackgroundFile(null)
      setBackgroundPreview(null)

      setFeedback({
        type: 'success',
        message: res.message || 'Profil berhasil diperbarui dengan sempurna!',
      })

      if (onProfileUpdated) {
        onProfileUpdated(updatedData)
      }
    } catch (err) {
      let msg = err.message || 'Gagal memperbarui profil.'
      if (err.errors) {
        const errorList = Object.values(err.errors).flat()
        if (errorList.length > 0) msg = errorList.join(' ')
      }
      setFeedback({ type: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setBio(profile?.bio || '')
    setPhotoFile(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    setBackgroundFile(null)
    if (backgroundPreview) URL.revokeObjectURL(backgroundPreview)
    setBackgroundPreview(null)
    setFeedback({ type: '', message: '' })
  }

  if (loading) {
    return (
      <div className="profile-view" aria-busy="true" aria-label="Memuat profil anggota...">
        <div className="page-container">
          <div className="profile-skeleton-header">
            <div className="skeleton skeleton-line" style={{ width: '200px', height: '24px' }} />
            <div className="skeleton skeleton-banner" style={{ height: '240px', marginTop: '20px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-view">
        <div className="page-container">
          <div className="dash-error-state" role="alert">
            <AlertCircleIcon size={44} className="dash-error-icon" />
            <h2 className="dash-error-title">Gagal Mengakses Profil</h2>
            <p className="dash-error-desc">{error}</p>
            <div className="dash-error-actions">
              <Button
                variant="primary"
                size="md"
                icon={<RefreshIcon size={16} />}
                onClick={loadProfile}
              >
                Coba Muat Ulang
              </Button>
              <Button variant="outline" size="md" onClick={onBackToDashboard}>
                Kembali ke Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const effectiveBackground = backgroundPreview || profile?.profile_background
  const effectivePhoto = photoPreview || profile?.profile_photo

  return (
    <div className="profile-view" aria-label="Profil dan Pengaturan Anggota">
      <div className="page-container">
        {/* TOP BAR / BREADCRUMB */}
        <div className="profile-topbar">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={onBackToDashboard}
            aria-label="Kembali ke Dashboard Anggota"
          >
            Kembali ke Dashboard Anggota
          </Button>
          <span className="profile-topbar__meta">
            No. Anggota: <strong>{profile?.nomor_anggota || '-'}</strong>
          </span>
        </div>

        {/* FEEDBACK ALERT */}
        {feedback.message && (
          <aside
            className={`profile-alert ${
              feedback.type === 'error' ? 'profile-alert--error' : 'profile-alert--success'
            }`}
            role="status"
          >
            <span className="profile-alert__icon">
              {feedback.type === 'error' ? (
                <AlertCircleIcon size={20} />
              ) : (
                <CheckCircleIcon size={20} />
              )}
            </span>
            <div className="profile-alert__content">
              <p>{feedback.message}</p>
            </div>
            <button
              type="button"
              className="profile-alert__close"
              onClick={() => setFeedback({ type: '', message: '' })}
              aria-label="Tutup notifikasi"
            >
              &times;
            </button>
          </aside>
        )}

        {/* BANNER & AVATAR COMPOSITE */}
        <section className="profile-header-card" aria-label="Sampul dan Foto Profil">
          <div
            className={`profile-cover ${effectiveBackground ? 'has-image' : 'default-pattern'}`}
            style={
              effectiveBackground
                ? { backgroundImage: `url(${effectiveBackground})` }
                : undefined
            }
          >
            <div className="profile-cover__overlay" />

            {/* Background Actions */}
            <div className="profile-cover__actions">
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                style={{ display: 'none' }}
                onChange={handleBackgroundSelect}
                id="profile-bg-upload"
              />
              <button
                type="button"
                className="cover-action-btn"
                onClick={() => backgroundInputRef.current?.click()}
                title="Pilih gambar latar belakang (maks. 2MB)"
              >
                <ImageIcon size={16} />
                <span>{effectiveBackground ? 'Ganti Sampul' : 'Tambah Sampul'}</span>
              </button>

              {profile?.profile_background && (
                <button
                  type="button"
                  className="cover-action-btn cover-action-btn--danger"
                  onClick={handleDeleteBackground}
                  disabled={saving}
                  title="Hapus gambar latar belakang"
                >
                  <TrashIcon size={16} />
                  <span>Hapus Sampul</span>
                </button>
              )}
            </div>
          </div>

          {/* AVATAR + SUMMARY BAR */}
          <div className="profile-summary-bar">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {effectivePhoto ? (
                  <img src={effectivePhoto} alt={profile?.nama || 'Foto Profil'} />
                ) : (
                  <div className="profile-avatar-fallback">
                    <UserIcon size={48} />
                  </div>
                )}
              </div>

              {/* Photo Upload Trigger */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
                id="profile-photo-upload"
              />
              <button
                type="button"
                className="avatar-edit-badge"
                onClick={() => photoInputRef.current?.click()}
                title="Unggah foto profil (maks. 1MB)"
                aria-label="Ubah foto profil"
              >
                <CameraIcon size={16} />
              </button>
            </div>

            <div className="profile-summary-meta">
              <div className="profile-summary-headings">
                <h1 className="profile-name">{profile?.nama || currentUser?.name}</h1>
                <div className="profile-pills">
                  {profile?.kelas && (
                    <span className="profile-pill profile-pill--kelas">
                      <TagIcon size={14} />
                      Kelas {profile.kelas}
                    </span>
                  )}
                  <span className="profile-pill profile-pill--status">
                    <span className="status-dot" aria-hidden="true" />
                    Anggota Aktif
                  </span>
                </div>
              </div>

              {profile?.profile_photo && (
                <button
                  type="button"
                  className="delete-photo-btn"
                  onClick={handleDeletePhoto}
                  disabled={saving}
                  title="Hapus foto profil"
                >
                  <TrashIcon size={14} />
                  <span>Hapus Foto</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* MAIN TWO-COLUMN CONTENT */}
        <div className="profile-grid">
          {/* LEFT: RESMI SMKN 6 SURAKARTA CARD */}
          <aside className="profile-id-column" aria-label="Kartu Identitas Anggota">
            <div className="library-card">
              <div className="library-card__header">
                <div className="library-card__brand">
                  <span className="brand-mark">r.</span>
                  <div>
                    <h3 className="library-card__school">SMKN 6 SURAKARTA</h3>
                    <p className="library-card__system">Perpustakaan Digital RuangDegup</p>
                  </div>
                </div>
                <BookOpenIcon size={24} className="library-card__watermark" />
              </div>

              <div className="library-card__body">
                <div className="library-card__row">
                  <span className="card-label">Nomor Induk / Anggota</span>
                  <span className="card-value highlight">{profile?.nomor_anggota || '-'}</span>
                </div>

                <div className="library-card__row">
                  <span className="card-label">Nama Lengkap</span>
                  <span className="card-value">{profile?.nama || currentUser?.name || '-'}</span>
                </div>

                <div className="library-card__row">
                  <span className="card-label">Tingkat & Jurusan</span>
                  <span className="card-value">{profile?.kelas || '-'}</span>
                </div>

                <div className="library-card__row">
                  <span className="card-label">Email Terdaftar</span>
                  <span className="card-value card-value--email">
                    <MailIcon size={14} />
                    {currentUser?.email || '-'}
                  </span>
                </div>

                {profile?.no_hp && (
                  <div className="library-card__row">
                    <span className="card-label">Nomor WhatsApp / HP</span>
                    <span className="card-value">
                      <PhoneIcon size={14} />
                      {profile.no_hp}
                    </span>
                  </div>
                )}

                {profile?.alamat && (
                  <div className="library-card__row">
                    <span className="card-label">Alamat Tinggal</span>
                    <span className="card-value">
                      <MapPinIcon size={14} />
                      {profile.alamat}
                    </span>
                  </div>
                )}
              </div>

              <div className="library-card__footer">
                <span className="card-footer-note">
                  Kartu digital terverifikasi SMKN 6 Surakarta. Data pokok hanya dapat disunting oleh Petugas Perpustakaan.
                </span>
              </div>
            </div>
          </aside>

          {/* RIGHT: EDIT PROFILE FORM */}
          <main className="profile-form-column" aria-label="Form Sunting Profil">
            <form onSubmit={handleSubmit} className="profile-edit-card">
              <div className="profile-form-header">
                <h2 className="profile-form-title">Biodata & Catatan Anggota</h2>
                <p className="profile-form-desc">
                  Sesuaikan bio dan foto personal Anda untuk ditampilkan pada kartu anggota dan ulasan buku.
                </p>
              </div>

              {/* BIO FIELD */}
              <div className="form-group">
                <div className="form-group__header">
                  <label htmlFor="member-bio" className="form-label">
                    Bio & Kutipan Favorit
                  </label>
                  <span
                    className={`char-counter ${
                      bio.length > 900 ? 'char-counter--warning' : ''
                    }`}
                  >
                    {bio.length} / 1000
                  </span>
                </div>
                <textarea
                  id="member-bio"
                  className="form-textarea"
                  rows={5}
                  maxLength={1000}
                  placeholder="Ceritakan sedikit tentang dirimu, kutipan literatur favorit, atau genre bacaan yang paling Anda minati di SMKN 6 Surakarta..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={saving}
                />
                <span className="form-helper-text">
                  Bio ini akan terlihat oleh sesama pembaca pada kolom resensi dan ulasan buku.
                </span>
              </div>

              {/* UPLOAD STATUS PENDING REMINDER */}
              {(photoFile || backgroundFile) && (
                <div className="pending-upload-box">
                  <div className="pending-upload-box__header">
                    <CheckCircleIcon size={18} />
                    <strong>Berkas Baru Siap Diunggah:</strong>
                  </div>
                  <ul className="pending-upload-list">
                    {photoFile && (
                      <li>
                        Foto Profil: <strong>{photoFile.name}</strong> (
                        {(photoFile.size / 1024).toFixed(1)} KB)
                      </li>
                    )}
                    {backgroundFile && (
                      <li>
                        Sampul Latar: <strong>{backgroundFile.name}</strong> (
                        {(backgroundFile.size / 1024).toFixed(1)} KB)
                      </li>
                    )}
                  </ul>
                  <p className="pending-upload-note">
                    Klik tombol "Simpan Perubahan" di bawah untuk menerapkan berkas tersebut ke server.
                  </p>
                </div>
              )}

              {/* FORM ACTIONS */}
              <div className="profile-form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saving}
                  icon={saving ? <RefreshIcon size={16} className="spin" /> : <CheckCircleIcon size={16} />}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  disabled={saving}
                  onClick={handleReset}
                >
                  Reset Perubahan
                </Button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}
