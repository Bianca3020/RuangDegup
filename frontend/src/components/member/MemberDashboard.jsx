import { useState, useEffect, useCallback } from 'react'
import {
  BookOpenIcon,
  HeartIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UserIcon,
  ArrowRight,
  ArrowUpRight,
  RefreshIcon,
  CloseIcon,
  TrashIcon,
} from '../common/Icons'
import { Button } from '../common/Button'
import { getMemberDashboard, removeFavorite, deleteReview, getStorageUrl, returnMemberBorrowing } from '../../services/api'

export function MemberDashboard({
  currentUser,
  onSelectBook,
  onExploreBooks,
  onNavigateToProfile,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionNotice, setActionNotice] = useState('')
  const [borrowingTab, setBorrowingTab] = useState('active')
  const [returningId, setReturningId] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMemberDashboard()
      setData(res)
    } catch (err) {
      setError(
        err.message || 'Gagal memuat data dashboard anggota. Silakan periksa koneksi Anda.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Remove a favorite directly from the dashboard
  async function handleRemoveFavorite(bookId, bookTitle) {
    try {
      await removeFavorite(bookId)
      setActionNotice(`Buku "${bookTitle}" telah dihapus dari daftar favorit.`)
      // Refresh local dashboard state
      loadDashboard()
    } catch (err) {
      setActionNotice(err.message || 'Gagal menghapus buku dari favorit.')
    }
  }

  // Delete a review directly from the dashboard
  async function handleDeleteReview(reviewId, bookTitle) {
    if (!window.confirm(`Hapus ulasan Anda untuk buku "${bookTitle}"?`)) return
    try {
      await deleteReview(reviewId)
      setActionNotice(`Ulasan untuk buku "${bookTitle}" berhasil dihapus.`)
      loadDashboard()
    } catch (err) {
      setActionNotice(err.message || 'Gagal menghapus ulasan.')
    }
  }

  // Return a borrowed book
  async function handleReturnBook(borrowingId, bookTitle) {
    if (!window.confirm(`Kembalikan buku "${bookTitle}" sekarang?`)) return
    setReturningId(borrowingId)
    try {
      await returnMemberBorrowing(borrowingId)
      setActionNotice(`Buku "${bookTitle}" berhasil dikembalikan. Terima kasih!`)
      loadDashboard()
    } catch (err) {
      setActionNotice(err.message || 'Gagal mengembalikan buku.')
    } finally {
      setReturningId(null)
    }
  }

  if (loading) {
    return (
      <div className="member-dashboard" aria-busy="true" aria-label="Memuat dashboard anggota...">
        <div className="page-container">
          {/* SKELETON HEADER */}
          <div className="dash-skeleton-hero">
            <div className="skeleton skeleton-line" style={{ width: '40%', height: '36px' }} />
            <div className="skeleton skeleton-line" style={{ width: '25%', height: '18px', marginTop: '10px' }} />
          </div>

          {/* SKELETON METRICS */}
          <div className="dash-metrics-grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="metric-card-skeleton">
                <div className="skeleton skeleton-line" style={{ width: '60%', height: '14px' }} />
                <div className="skeleton skeleton-line" style={{ width: '40%', height: '32px', marginTop: '12px' }} />
              </div>
            ))}
          </div>

          {/* SKELETON SECTION */}
          <div className="dash-skeleton-section">
            <div className="skeleton skeleton-cover" style={{ height: '220px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="member-dashboard">
        <div className="page-container">
          <div className="dash-error-state" role="alert">
            <AlertCircleIcon size={44} className="dash-error-icon" />
            <h2 className="dash-error-title">Gagal Mengakses Ruang Anggota</h2>
            <p className="dash-error-desc">{error}</p>
            <Button
              variant="primary"
              size="md"
              icon={<RefreshIcon size={16} />}
              onClick={loadDashboard}
            >
              Coba Muat Ulang
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { profile, summary, active_borrowings = [], past_borrowings = [], favorites = [], reviews = [] } = data || {}

  return (
    <div className="member-dashboard" aria-label="Dashboard Anggota RuangDegup">
      <div className="page-container">
        {/* INLINE NOTICE */}
        {actionNotice && (
          <aside className="dash-notice-bar" role="status">
            <span>{actionNotice}</span>
            <button
              type="button"
              onClick={() => setActionNotice('')}
              aria-label="Tutup pemberitahuan"
            >
              &times;
            </button>
          </aside>
        )}

        {/* HERO GREETING & PROFILE SUMMARY */}
        <header className="dash-hero">
          <div className="dash-hero__content">
            <div className="dash-hero__identity">
              <div className="dash-hero__avatar">
                {profile?.profile_photo ? (
                  <img src={getStorageUrl(profile.profile_photo)} alt={profile.nama} />
                ) : (
                  <UserIcon size={32} />
                )}
              </div>
              <div className="dash-hero__titles">
                <span className="section-eyebrow">
                  <span className="eyebrow-dot" aria-hidden="true" />
                  RUANG ANGGOTA
                </span>
                <h1 className="dash-hero__name">
                  Selamat Datang, <span>{profile?.nama || currentUser?.name}</span>
                </h1>
                <div className="dash-hero__badges">
                  {profile?.nomor_anggota && (
                    <span className="dash-id-badge">
                      No. Anggota: <strong>{profile.nomor_anggota}</strong>
                    </span>
                  )}
                  {profile?.kelas && (
                    <span className="dash-class-badge">{profile.kelas}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="dash-hero__actions">
              <Button
                variant="sage"
                size="md"
                icon={<ArrowUpRight size={16} />}
                iconPosition="right"
                onClick={onExploreBooks}
              >
                Jelajahi Katalog
              </Button>
              {onNavigateToProfile && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={onNavigateToProfile}
                >
                  Edit Profil
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* METRICS STATS CARDS */}
        <section className="dash-metrics-section" aria-label="Ringkasan Aktivitas Anggota">
          <div className="dash-metrics-grid">
            <div className="metric-card">
              <div className="metric-card__header">
                <span className="metric-card__label">Total Peminjaman</span>
                <span className="metric-card__icon metric-card__icon--plum">
                  <ClockIcon size={18} />
                </span>
              </div>
              <span className="metric-card__value">
                {summary?.total_borrowings ?? 0}
              </span>
              <span className="metric-card__sub">Seluruh riwayat transaksi</span>
            </div>

            <div className="metric-card metric-card--active">
              <div className="metric-card__header">
                <span className="metric-card__label">Buku Sedang Dipinjam</span>
                <span className="metric-card__icon metric-card__icon--sage">
                  <BookOpenIcon size={18} />
                </span>
              </div>
              <span className="metric-card__value">
                {summary?.active_borrowings ?? 0}
              </span>
              <span className="metric-card__sub">Perlu dikembalikan tepat waktu</span>
            </div>

            <div className="metric-card">
              <div className="metric-card__header">
                <span className="metric-card__label">Sudah Dikembalikan</span>
                <span className="metric-card__icon metric-card__icon--green">
                  <CheckCircleIcon size={18} />
                </span>
              </div>
              <span className="metric-card__value">
                {summary?.returned_books ?? 0}
              </span>
              <span className="metric-card__sub">Transaksi selesai</span>
            </div>

            <div className="metric-card">
              <div className="metric-card__header">
                <span className="metric-card__label">Buku Favorit</span>
                <span className="metric-card__icon metric-card__icon--heart">
                  <HeartIcon size={18} filled />
                </span>
              </div>
              <span className="metric-card__value">
                {summary?.favorite_books ?? 0} <small>/ 4</small>
              </span>
              <span className="metric-card__sub">Maksimal 4 buku pilihan</span>
            </div>

            <div className="metric-card">
              <div className="metric-card__header">
                <span className="metric-card__label">Ulasan Ditulis</span>
                <span className="metric-card__icon metric-card__icon--gold">
                  <StarIcon size={18} filled />
                </span>
              </div>
              <span className="metric-card__value">
                {summary?.reviews ?? 0}
              </span>
              <span className="metric-card__sub">Apresiasi dan catatan bacaan</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: ACTIVE BORROWINGS & PAST BORROWINGS */}
        <section className="dash-section" aria-label="Sirkulasi Peminjaman Buku">
          <div className="dash-section__header">
            <div>
              <span className="section-eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                SIRKULASI ANGGOTA
              </span>
              <h2 className="dash-section__title">
                {borrowingTab === 'active' ? 'Buku yang Sedang Dipinjam' : 'Riwayat Peminjaman Selesai'}
              </h2>
            </div>
            <div className="dash-tab-pills" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={borrowingTab === 'active'}
                className={`dash-tab-pill ${borrowingTab === 'active' ? 'is-active' : ''}`}
                onClick={() => setBorrowingTab('active')}
              >
                Sedang Dipinjam ({active_borrowings.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={borrowingTab === 'past'}
                className={`dash-tab-pill ${borrowingTab === 'past' ? 'is-active' : ''}`}
                onClick={() => setBorrowingTab('past')}
              >
                Riwayat Selesai ({past_borrowings.length})
              </button>
            </div>
          </div>

          {borrowingTab === 'active' ? (
            active_borrowings.length === 0 ? (
              <div className="dash-empty-box">
                <BookOpenIcon size={40} className="dash-empty-icon" />
                <h3>Tidak Ada Buku yang Sedang Dipinjam</h3>
                <p>
                  Anda sedang tidak memiliki pinjaman buku aktif. Temukan karya sastra, filosofi, atau sains favorit Anda di katalog perpustakaan.
                </p>
                <Button variant="sage" size="md" onClick={onExploreBooks}>
                  Cari Buku untuk Dipinjam
                </Button>
              </div>
            ) : (
              <div className="borrowings-grid">
                {active_borrowings.map((borrowing) => {
                  const book = borrowing.book || {}
                  const statusType = borrowing.status_tampilan // 'Dipinjam' | 'Jatuh Tempo' | 'Terlambat'

                  return (
                    <article key={borrowing.id} className="borrow-card">
                      <div className="borrow-card__cover">
                        {book.cover ? (
                          <img src={getStorageUrl(book.cover)} alt={book.judul} />
                        ) : (
                          <div className="borrow-card__fallback">
                            <span>r.</span>
                            <h4>{book.judul}</h4>
                          </div>
                        )}
                      </div>

                      <div className="borrow-card__body">
                        <div className="borrow-card__status-row">
                          <span
                            className={`borrow-badge borrow-badge--${
                              statusType === 'Terlambat'
                                ? 'late'
                                : statusType === 'Jatuh Tempo'
                                ? 'warning'
                                : 'active'
                            }`}
                          >
                            {statusType === 'Terlambat'
                              ? `Terlambat ${borrowing.terlambat_hari} Hari`
                              : statusType === 'Jatuh Tempo'
                              ? 'Jatuh Tempo Hari Ini'
                              : 'Sedang Dipinjam'}
                          </span>
                          <span className="borrow-card__id">Trx #{borrowing.id}</span>
                        </div>

                        <h3 className="borrow-card__title">{book.judul}</h3>
                        <p className="borrow-card__author">Oleh {book.penulis}</p>

                        <div className="borrow-card__dates">
                          <div>
                            <span className="date-label">Tgl Pinjam</span>
                            <span className="date-value">{borrowing.tanggal_pinjam}</span>
                          </div>
                          <div>
                            <span className="date-label">Batas Kembali</span>
                            <span className="date-value date-value--due">
                              {borrowing.jatuh_tempo}
                            </span>
                          </div>
                        </div>

                        <div className="borrow-card__footer">
                          <button
                            type="button"
                            className="borrow-card__btn-detail"
                            onClick={() => onSelectBook && onSelectBook(book)}
                          >
                            <span>Lihat Detail Buku</span>
                            <ArrowRight size={14} />
                          </button>
                          <button
                            type="button"
                            className="borrow-card__btn-return"
                            disabled={returningId === borrowing.id}
                            onClick={() => handleReturnBook(borrowing.id, book.judul)}
                          >
                            {returningId === borrowing.id ? 'Memproses...' : 'Kembalikan Buku'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )
          ) : (
            past_borrowings.length === 0 ? (
              <div className="dash-empty-box">
                <CheckCircleIcon size={40} className="dash-empty-icon" />
                <h3>Belum Ada Riwayat Selesai</h3>
                <p>
                  Buku yang telah Anda kembalikan ke perpustakaan akan tercatat rapi di bagian ini sebagai jejak bacaan Anda.
                </p>
              </div>
            ) : (
              <div className="borrowings-grid">
                {past_borrowings.map((borrowing) => {
                  const book = borrowing.book || {}

                  return (
                    <article key={borrowing.id} className="borrow-card borrow-card--returned">
                      <div className="borrow-card__cover">
                        {book.cover ? (
                          <img src={getStorageUrl(book.cover)} alt={book.judul} />
                        ) : (
                          <div className="borrow-card__fallback">
                            <span>r.</span>
                            <h4>{book.judul}</h4>
                          </div>
                        )}
                      </div>

                      <div className="borrow-card__body">
                        <div className="borrow-card__status-row">
                          <span className="borrow-badge borrow-badge--returned">
                            Telah Dikembalikan
                          </span>
                          <span className="borrow-card__id">Trx #{borrowing.id}</span>
                        </div>

                        <h3 className="borrow-card__title">{book.judul}</h3>
                        <p className="borrow-card__author">Oleh {book.penulis}</p>

                        <div className="borrow-card__dates">
                          <div>
                            <span className="date-label">Tgl Pinjam</span>
                            <span className="date-value">{borrowing.tanggal_pinjam ? String(borrowing.tanggal_pinjam).split('T')[0] : '-'}</span>
                          </div>
                          <div>
                            <span className="date-label">Dikembalikan</span>
                            <span className="date-value date-value--returned">
                              {borrowing.tanggal_kembali ? String(borrowing.tanggal_kembali).split('T')[0] : '-'}
                            </span>
                          </div>
                        </div>

                        <div className="borrow-card__footer">
                          <button
                            type="button"
                            className="borrow-card__btn-detail"
                            onClick={() => onSelectBook && onSelectBook(book)}
                          >
                            <span>Beri Ulasan / Baca Lagi</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )
          )}
        </section>

        {/* SECTION 2: FAVORITES & REVIEWS TWO-COLUMN LAYOUT */}
        <div className="dash-columns-grid">
          {/* COLUMN 1: FAVORITES */}
          <section className="dash-section" aria-label="Buku Favorit">
            <div className="dash-section__header">
              <div>
                <span className="section-eyebrow">
                  <span className="eyebrow-dot" aria-hidden="true" />
                  RAK PRIBADI
                </span>
                <h2 className="dash-section__title">Buku Favorit Saya</h2>
              </div>
              <span className="dash-count-pill">{favorites.length} / 4</span>
            </div>

            {favorites.length === 0 ? (
              <div className="dash-empty-box dash-empty-box--compact">
                <HeartIcon size={32} className="dash-empty-icon" />
                <h4>Belum Ada Buku Favorit</h4>
                <p>Klik ikon hati pada katalog untuk menyimpan hingga 4 buku favorit.</p>
              </div>
            ) : (
              <div className="dash-favorites-list">
                {favorites.map((fav) => {
                  const book = fav.book || {}
                  return (
                    <div key={fav.id} className="fav-item">
                      <div className="fav-item__cover">
                        {book.cover ? (
                          <img src={getStorageUrl(book.cover)} alt={book.judul} />
                        ) : (
                          <div className="fav-item__fallback">r.</div>
                        )}
                      </div>

                      <div className="fav-item__info">
                        <h4
                          className="fav-item__title"
                          onClick={() => onSelectBook && onSelectBook(book)}
                        >
                          {book.judul}
                        </h4>
                        <p className="fav-item__author">{book.penulis}</p>
                        <span className="fav-item__stok">
                          Stok: {book.stok > 0 ? `${book.stok} eks.` : 'Habis'}
                        </span>
                      </div>

                      <div className="fav-item__actions">
                        <button
                          type="button"
                          className="fav-remove-btn"
                          onClick={() => handleRemoveFavorite(book.id, book.judul)}
                          aria-label={`Hapus ${book.judul} dari favorit`}
                        >
                          <CloseIcon size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* COLUMN 2: REVIEWS */}
          <section className="dash-section" aria-label="Ulasan Terbaru Saya">
            <div className="dash-section__header">
              <div>
                <span className="section-eyebrow">
                  <span className="eyebrow-dot" aria-hidden="true" />
                  CATATAN APRESIASI
                </span>
                <h2 className="dash-section__title">Ulasan Saya</h2>
              </div>
              <span className="dash-count-pill">{reviews.length} Ulasan</span>
            </div>

            {reviews.length === 0 ? (
              <div className="dash-empty-box dash-empty-box--compact">
                <StarIcon size={32} className="dash-empty-icon" />
                <h4>Belum Ada Ulasan</h4>
                <p>Beri rating dan ulasan pada buku yang telah Anda baca melalui modal detail buku.</p>
              </div>
            ) : (
              <div className="dash-reviews-list">
                {reviews.map((rev) => {
                  const book = rev.book || {}
                  return (
                    <article key={rev.id} className="review-item">
                      <div className="review-item__header">
                        <div className="review-item__book-info">
                          <h4
                            className="review-item__title"
                            onClick={() => onSelectBook && onSelectBook(book)}
                          >
                            {book.judul}
                          </h4>
                          <span className="review-item__author">{book.penulis}</span>
                        </div>

                        <div className="review-item__stars" aria-label={`${rev.rating} dari 5 bintang`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              size={14}
                              filled={star <= rev.rating}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.ulasan ? (
                        <p className="review-item__text">&ldquo;{rev.ulasan}&rdquo;</p>
                      ) : (
                        <p className="review-item__text text-muted">
                          (Rating {rev.rating} bintang tanpa ulasan tertulis)
                        </p>
                      )}

                      <div className="review-item__footer">
                        <span className="review-item__date">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : ''}
                        </span>
                        <button
                          type="button"
                          className="review-delete-btn"
                          onClick={() => handleDeleteReview(rev.id, book.judul)}
                          title="Hapus ulasan ini"
                          aria-label={`Hapus ulasan untuk ${book.judul}`}
                        >
                          <TrashIcon size={13} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

