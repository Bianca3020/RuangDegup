import { useState, useEffect } from 'react'
import {
  CloseIcon,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  CheckIcon,
  InfoIcon,
} from '../common/Icons'
import { Button } from '../common/Button'
import { ConfirmModal } from '../common/ConfirmModal'
import { createReview, getStorageUrl } from '../../services/api'

export function BookDetailModal({
  book,
  onClose,
  currentUser,
  onBorrow,
  onToggleFavorite,
  isFavorite = false,
  onRequireLogin,
  borrowLoading = false,
}) {
  const [imgError, setImgError] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [ulasan, setUlasan] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [borrowSuccess, setBorrowSuccess] = useState('')
  const [borrowError, setBorrowError] = useState('')
  const [showBorrowConfirm, setShowBorrowConfirm] = useState(false)

  async function handleInternalBorrow() {
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin(`meminjam buku "${book.judul}"`)
      return
    }
    setBorrowError('')
    setBorrowSuccess('')
    try {
      if (onBorrow) {
        const res = await onBorrow(book)
        setBorrowSuccess(res?.message || `Buku "${book.judul}" berhasil dipinjam! Silakan periksa di Ruang Anggota.`)
      }
    } catch (err) {
      setBorrowError(err.message || 'Gagal memproses peminjaman buku.')
    }
  }

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    // Prevent background scroll
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  if (!book) return null

  const isAvailable = Number(book.stok) > 0
  const categoryName = book.category?.nama_kategori || book.kategori || 'Sastra'
  const hasCover = book.cover && !imgError

  async function handleReviewSubmit(e) {
    e.preventDefault()
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin('memberikan ulasan')
      return
    }

    setReviewLoading(true)
    setReviewError('')
    setReviewSuccess('')

    try {
      await createReview({
        book_id: book.id,
        rating: Number(rating),
        ulasan: ulasan.trim() || null,
      })
      setReviewSuccess('Ulasan Anda berhasil dikirimkan. Terima kasih atas apresiasinya!')
      setUlasan('')
    } catch (err) {
      setReviewError(
        err.message || 'Gagal mengirimkan review. Pastikan Anda belum pernah mereview buku ini.'
      )
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-modal-title"
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Tutup detail buku"
        >
          <CloseIcon size={20} />
        </button>

        <div className="modal-content-grid">
          {/* LEFT: COVER & STATS */}
          <div className="modal-cover-col">
            <div className="modal-cover-wrapper">
              {hasCover ? (
                <img
                  src={getStorageUrl(book.cover)}
                  alt={`Sampul buku ${book.judul}`}
                  className="modal-cover-img"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="book-card__fallback-cover modal-fallback-cover">
                  <div className="fallback-cover__pattern" />
                  <span className="fallback-cover__cat">{categoryName}</span>
                  <h3 className="fallback-cover__title">{book.judul}</h3>
                  <span className="fallback-cover__author">{book.penulis}</span>
                  <div className="fallback-cover__brand">r.</div>
                </div>
              )}

              {/* FLOATING STOCK BADGE */}
              <div className="modal-cover-badges">
                <span
                  className={`stock-badge ${isAvailable ? 'stock-badge--available' : 'stock-badge--empty'}`}
                >
                  {isAvailable ? `Tersedia: ${book.stok} Eks.` : 'Stok Habis / Dipinjam'}
                </span>
              </div>
            </div>

            {/* QUICK ACTIONS UNDER COVER */}
            <div className="modal-quick-actions">
              {onToggleFavorite && (
                <button
                  type="button"
                  className={`modal-favorite-toggle ${isFavorite ? 'is-active' : ''}`}
                  onClick={() => {
                    if (!currentUser && onRequireLogin) {
                      onRequireLogin('menyimpan buku favorit')
                    } else {
                      onToggleFavorite(book)
                    }
                  }}
                >
                  <HeartIcon size={18} filled={isFavorite} />
                  <span>{isFavorite ? 'Tersimpan di Favorit' : 'Simpan ke Favorit'}</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS & BORROWING */}
          <div className="modal-info-col">
            <div className="modal-header-meta">
              <span className="modal-category-chip">{categoryName}</span>
              {book.tahun_terbit && (
                <span className="modal-meta-item">
                  <CalendarIcon size={14} />
                  <span>Tahun {book.tahun_terbit}</span>
                </span>
              )}
            </div>

            <h2 id="book-modal-title" className="modal-book-title">
              {book.judul}
            </h2>

            <p className="modal-book-author">
              Ditulis oleh <strong>{book.penulis}</strong>
            </p>

            {/* METADATA PILLS */}
            <div className="modal-metadata-grid">
              {book.penerbit && (
                <div className="meta-pill">
                  <span className="meta-pill__label">Penerbit</span>
                  <span className="meta-pill__value">{book.penerbit}</span>
                </div>
              )}
              {book.isbn && (
                <div className="meta-pill">
                  <span className="meta-pill__label">ISBN</span>
                  <span className="meta-pill__value">{book.isbn}</span>
                </div>
              )}
              <div className="meta-pill">
                <span className="meta-pill__label">Status Fisik</span>
                <span className="meta-pill__value">
                  {isAvailable ? `${book.stok} eksemplar di rak` : 'Sedang dipinjam'}
                </span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="modal-description-box">
              <h4 className="modal-section-heading">Sinopsis & Catatan Buku</h4>
              <p className="modal-description-text">
                {book.deskripsi || 'Belum ada deskripsi naratif untuk buku ini.'}
              </p>
            </div>

            {/* BORROW CTA ACTION */}
            <div className="modal-borrow-section">
              {borrowSuccess && (
                <div className="alert-message alert-message--success" style={{ marginBottom: '14px' }}>
                  <CheckIcon size={16} />
                  <span>{borrowSuccess}</span>
                </div>
              )}

              {borrowError && (
                <div className="alert-message alert-message--error" style={{ marginBottom: '14px' }}>
                  <InfoIcon size={16} />
                  <span>{borrowError}</span>
                </div>
              )}

              {currentUser ? (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!isAvailable || !!borrowSuccess}
                  loading={borrowLoading}
                  onClick={() => setShowBorrowConfirm(true)}
                  className="modal-borrow-btn"
                >
                  {borrowSuccess
                    ? '✓ Berhasil Dipinjam'
                    : isAvailable
                    ? 'Pinjam Buku Ini Sekarang'
                    : 'Stok Buku Sedang Kosong'}
                </Button>
              ) : (
                <div className="modal-guest-prompt">
                  <div className="guest-prompt-text">
                    <InfoIcon size={18} />
                    <span>Masuk sebagai anggota untuk meminjam buku ini secara langsung.</span>
                  </div>
                  <Button
                    variant="sage"
                    size="md"
                    onClick={() => onRequireLogin && onRequireLogin('meminjam buku')}
                  >
                    Masuk Akun
                  </Button>
                </div>
              )}
            </div>

            {/* REVIEW SECTION */}
            <div className="modal-review-section">
              <h4 className="modal-section-heading">Beri Ulasan Pembaca</h4>

              {reviewSuccess && (
                <div className="alert-message alert-message--success">
                  <CheckIcon size={16} />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              {reviewError && (
                <div className="alert-message alert-message--error">
                  <InfoIcon size={16} />
                  <span>{reviewError}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="modal-review-form">
                <div className="star-rating-picker" role="radiogroup" aria-label="Pilih rating bintang">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-pick-btn ${
                        (hoverRating || rating) >= star ? 'is-selected' : ''
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} bintang`}
                    >
                      <StarIcon size={22} filled={(hoverRating || rating) >= star} />
                    </button>
                  ))}
                  <span className="star-rating-label">{rating} dari 5 bintang</span>
                </div>

                <textarea
                  className="modal-review-textarea"
                  rows={3}
                  placeholder="Tuliskan kesan atau catatan bacaan Anda tentang buku ini (opsional)..."
                  value={ulasan}
                  onChange={(e) => setUlasan(e.target.value)}
                />

                <div className="review-form-footer">
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    loading={reviewLoading}
                  >
                    Kirim Ulasan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showBorrowConfirm}
        onClose={() => !borrowLoading && setShowBorrowConfirm(false)}
        onConfirm={async () => {
          setShowBorrowConfirm(false)
          await handleInternalBorrow()
        }}
        title="Pinjam Buku"
        subtitle="Sirkulasi Pustaka"
        message={`Apakah Anda yakin ingin meminjam buku "${book.judul}" karya ${book.penulis}? Buku dapat dipinjam selama 7 hari kalender.`}
        confirmText="Ya, Pinjam Buku"
        cancelText="Batalkan"
        variant="primary"
        loading={borrowLoading}
      />
    </div>
  )
}

