import React, { useState, useEffect } from 'react'
import {
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  InfoIcon,
  CheckIcon,
  ArrowRight,
} from '../common/Icons'
import { Button } from '../common/Button'
import { loginUser, registerUser } from '../../services/api'

export function AuthModal({
  isOpen = false,
  initialMode = 'login',
  onClose,
  onAuthSuccess,
}) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'register'

  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [registerData, setRegisterData] = useState({
    nama: '',
    email: '',
    password: '',
    password_confirmation: '',
    no_hp: '',
    alamat: '',
  })

  // Dropdown Tingkat & Jurusan (SMKN 6 Surakarta)
  const [tingkatKelas, setTingkatKelas] = useState('')
  const [jurusan, setJurusan] = useState('')

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  // Status feedback
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Sync mode when initialMode changes
  useEffect(() => {
    setMode(initialMode)
    setGeneralError('')
    setFieldErrors({})
    setSuccessMessage('')
  }, [initialMode, isOpen])

  // Escape key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Switch tabs
  function switchMode(newMode) {
    setMode(newMode)
    setGeneralError('')
    setFieldErrors({})
    setSuccessMessage('')
    setShowPassword(false)
    setShowPasswordConfirm(false)
  }

  // Handle Login
  async function handleLoginSubmit(e) {
    e.preventDefault()
    setGeneralError('')
    setFieldErrors({})
    setSuccessMessage('')

    if (!loginData.email.trim()) {
      setFieldErrors({ email: ['Email wajib diisi'] })
      return
    }
    if (!loginData.password) {
      setFieldErrors({ password: ['Kata sandi wajib diisi'] })
      return
    }

    setLoading(true)
    try {
      const res = await loginUser({
        email: loginData.email.trim(),
        password: loginData.password,
      })

      setSuccessMessage(res.message || 'Login berhasil!')
      if (onAuthSuccess) {
        onAuthSuccess(res.user, res.token, res.message)
      }
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err) {
      if (err.status === 401) {
        setGeneralError('Email atau kata sandi tidak cocok. Silakan periksa kembali.')
      } else if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors)
        setGeneralError(err.message || 'Terjadi kesalahan validasi data.')
      } else {
        setGeneralError(err.message || 'Gagal masuk. Pastikan server backend sedang aktif.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Register
  async function handleRegisterSubmit(e) {
    e.preventDefault()
    setGeneralError('')
    setFieldErrors({})
    setSuccessMessage('')

    // Client-side quick validations
    const errors = {}
    if (!registerData.nama.trim()) errors.nama = ['Nama lengkap wajib diisi']
    if (!registerData.email.trim()) errors.email = ['Email wajib diisi']
    if (!registerData.password) errors.password = ['Kata sandi wajib diisi (minimal 8 karakter)']
    else if (registerData.password.length < 8) errors.password = ['Kata sandi minimal 8 karakter']

    if (registerData.password !== registerData.password_confirmation) {
      errors.password_confirmation = ['Konfirmasi kata sandi tidak cocok']
    }

    if (!tingkatKelas) {
      errors.tingkat = ['Tingkat kelas wajib dipilih']
    }
    if (!jurusan) {
      errors.jurusan = ['Jurusan SMKN 6 Surakarta wajib dipilih']
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    // Gabungkan tingkat dan jurusan menjadi satu nilai untuk field `kelas` (contoh: "XII PPLG")
    const kelasGabungan = `${tingkatKelas} ${jurusan}`.trim()

    setLoading(true)
    try {
      const payload = {
        nama: registerData.nama.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        password_confirmation: registerData.password_confirmation,
        kelas: kelasGabungan,
        no_hp: registerData.no_hp.trim() || null,
        alamat: registerData.alamat.trim() || null,
      }

      const res = await registerUser(payload)
      setSuccessMessage('Pendaftaran berhasil! Akun anggota Anda siap digunakan.')

      if (onAuthSuccess) {
        onAuthSuccess(res.user, res.token, 'Selamat datang di RuangDegup! Akun Anda telah aktif.')
      }

      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors)
        setGeneralError('Mohon periksa kembali kolom formulir yang belum sesuai.')
      } else {
        setGeneralError(err.message || 'Gagal mendaftar. Pastikan koneksi atau email belum pernah terdaftar.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Tutup jendela autentikasi"
        >
          <CloseIcon size={20} />
        </button>

        {/* HEADER BRAND & TAB SWITCH */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <span className="brand-mark">r.</span>
            <span className="brand-name">Ruang<span>Degup</span></span>
          </div>

          <h2 id="auth-modal-title" className="auth-title">
            {mode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Anggota Perpustakaan'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Lanjutkan perjalanan membacamu dan nikmati akses peminjaman buku.'
              : 'Daftarkan diri Anda untuk mulai meminjam buku fisik, menyimpan favorit, dan menulis ulasan.'}
          </p>

          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {/* FEEDBACK ALERTS */}
        {generalError && (
          <div className="alert-message alert-message--error" role="alert">
            <InfoIcon size={18} />
            <span>{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert-message alert-message--success" role="status">
            <CheckIcon size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM 1: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Alamat Email <span className="text-required">*</span>
              </label>
              <div className="form-input-box">
                <MailIcon size={18} className="form-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />
              </div>
              {fieldErrors.email && (
                <span className="field-error-text">{fieldErrors.email[0]}</span>
              )}
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="login-password" className="form-label">
                  Kata Sandi <span className="text-required">*</span>
                </label>
              </div>
              <div className="form-input-box">
                <LockIcon size={18} className="form-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                  placeholder="Masukkan kata sandi..."
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error-text">{fieldErrors.password[0]}</span>
              )}
            </div>

            <div className="auth-action-row">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="auth-submit-btn"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Masuk ke RuangDegup
              </Button>
            </div>

            <div className="auth-footer-prompt">
              <span>Belum memiliki kartu anggota?</span>
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => switchMode('register')}
              >
                Daftar sekarang
              </button>
            </div>
          </form>
        )}

        {/* FORM 2: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="reg-nama" className="form-label">
                Nama Lengkap <span className="text-required">*</span>
              </label>
              <div className="form-input-box">
                <UserIcon size={18} className="form-input-icon" />
                <input
                  id="reg-nama"
                  type="text"
                  className={`form-input ${fieldErrors.nama ? 'has-error' : ''}`}
                  placeholder="Nama sesuai identitas"
                  autoComplete="name"
                  value={registerData.nama}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, nama: e.target.value })
                  }
                  required
                />
              </div>
              {fieldErrors.nama && (
                <span className="field-error-text">{fieldErrors.nama[0]}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                Alamat Email <span className="text-required">*</span>
              </label>
              <div className="form-input-box">
                <MailIcon size={18} className="form-input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  required
                />
              </div>
              {fieldErrors.email && (
                <span className="field-error-text">{fieldErrors.email[0]}</span>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">
                  Kata Sandi <span className="text-required">*</span>
                </label>
                <div className="form-input-box">
                  <LockIcon size={18} className="form-input-icon" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                    placeholder="Min. 8 karakter"
                    autoComplete="new-password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="field-error-text">{fieldErrors.password[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm" className="form-label">
                  Konfirmasi Sandi <span className="text-required">*</span>
                </label>
                <div className="form-input-box">
                  <LockIcon size={18} className="form-input-icon" />
                  <input
                    id="reg-confirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    className={`form-input ${
                      fieldErrors.password_confirmation ? 'has-error' : ''
                    }`}
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
                    value={registerData.password_confirmation}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password_confirmation: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    aria-label={
                      showPasswordConfirm
                        ? 'Sembunyikan konfirmasi sandi'
                        : 'Tampilkan konfirmasi sandi'
                    }
                  >
                    {showPasswordConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {fieldErrors.password_confirmation && (
                  <span className="field-error-text">
                    {fieldErrors.password_confirmation[0]}
                  </span>
                )}
              </div>
            </div>

            {/* DROPDOWN KELAS & JURUSAN SMKN 6 SURAKARTA */}
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="reg-tingkat" className="form-label">
                  Tingkat Kelas <span className="text-required">*</span>
                </label>
                <div className="form-select-wrapper">
                  <select
                    id="reg-tingkat"
                    className={`form-input form-input--plain form-select ${
                      fieldErrors.tingkat || (fieldErrors.kelas && !tingkatKelas)
                        ? 'has-error'
                        : ''
                    }`}
                    value={tingkatKelas}
                    onChange={(e) => {
                      setTingkatKelas(e.target.value)
                      if (fieldErrors.tingkat || fieldErrors.kelas) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          tingkat: null,
                          kelas: null,
                        }))
                      }
                    }}
                    required
                  >
                    <option value="">Pilih tingkat</option>
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>
                {fieldErrors.tingkat && (
                  <span className="field-error-text">
                    {fieldErrors.tingkat[0]}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-jurusan" className="form-label">
                  Jurusan SMKN 6 Surakarta <span className="text-required">*</span>
                </label>
                <div className="form-select-wrapper">
                  <select
                    id="reg-jurusan"
                    className={`form-input form-input--plain form-select ${
                      fieldErrors.jurusan || (fieldErrors.kelas && !jurusan)
                        ? 'has-error'
                        : ''
                    }`}
                    value={jurusan}
                    onChange={(e) => {
                      setJurusan(e.target.value)
                      if (fieldErrors.jurusan || fieldErrors.kelas) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          jurusan: null,
                          kelas: null,
                        }))
                      }
                    }}
                    required
                  >
                    <option value="">Pilih jurusan</option>
                    <option value="AKL">AKL — Akuntansi dan Keuangan Lembaga</option>
                    <option value="PM">PM — Pemasaran</option>
                    <option value="MPLB">MPLB — Manajemen Perkantoran dan Layanan Bisnis</option>
                    <option value="ULP">ULP — Usaha Layanan Pariwisata</option>
                    <option value="DKV">DKV — Desain Komunikasi Visual</option>
                    <option value="PPLG">PPLG — Pengembangan Perangkat Lunak dan Gim</option>
                    <option value="BP">BP — Broadcasting dan Perfilman</option>
                  </select>
                </div>
                {fieldErrors.jurusan && (
                  <span className="field-error-text">
                    {fieldErrors.jurusan[0]}
                  </span>
                )}
              </div>
            </div>

            {/* PREVIEW KELAS GABUNGAN */}
            {tingkatKelas && jurusan && (
              <div className="class-preview-chip">
                <span>Nilai Terdaftar: <strong>{tingkatKelas} {jurusan}</strong></span>
              </div>
            )}
            {fieldErrors.kelas && !fieldErrors.tingkat && !fieldErrors.jurusan && (
              <span className="field-error-text">{fieldErrors.kelas[0]}</span>
            )}

            <div className="form-group">
              <label htmlFor="reg-phone" className="form-label">
                Nomor Telepon / WhatsApp <span className="text-optional">(Opsional)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="form-input form-input--plain"
                placeholder="0812xxxxxxxx"
                value={registerData.no_hp}
                onChange={(e) =>
                  setRegisterData({ ...registerData, no_hp: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-alamat" className="form-label">
                Alamat Tinggal <span className="text-optional">(Opsional)</span>
              </label>
              <textarea
                id="reg-alamat"
                rows={2}
                className="form-input form-input--plain form-textarea"
                placeholder="Alamat domisili untuk keperluan administrasi perpustakaan..."
                value={registerData.alamat}
                onChange={(e) =>
                  setRegisterData({ ...registerData, alamat: e.target.value })
                }
              />
            </div>

            <div className="auth-action-row">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="auth-submit-btn"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Daftar Sebagai Anggota
              </Button>
            </div>

            <div className="auth-footer-prompt">
              <span>Sudah memiliki akun terdaftar?</span>
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => switchMode('login')}
              >
                Masuk di sini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

