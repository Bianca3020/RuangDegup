import React, { useState, useEffect } from 'react'
import { BookCard } from '../books/BookCard'
import { ArrowRight, BookOpenIcon } from '../common/Icons'
import { fetchNewArrivals } from '../../services/api'

export function NewArrivalsSection({
  onSelectBook,
  onBorrow,
  onToggleFavorite,
  favoritesList = [],
  onGoToCatalog,
}) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadNewArrivals() {
      setLoading(true)
      setLoadError(false)
      try {
        const data = await fetchNewArrivals()
        if (isMounted) {
          if (Array.isArray(data)) {
            setBooks(data.slice(0, 6))
          } else if (Array.isArray(data?.data)) {
            setBooks(data.data.slice(0, 6))
          } else {
            setBooks([])
          }
        }
      } catch {
        if (isMounted) {
          setLoadError(true)
          setBooks([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadNewArrivals()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      className="new-arrivals-section"
      id="baru-menghiasi-rak"
      aria-label="Baru Menghiasi Rak"
    >
      <div className="section-header">
        <div>
          <span className="section-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            KOLEKSI TERBARU
          </span>

          <h2 className="section-title">Baru Menghiasi Rak</h2>
          <p className="section-subtitle">
            Temukan cerita dan pengetahuan baru dari koleksi terbaru kami.
          </p>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={onGoToCatalog}
        >
          <span>Jelajahi Semua Buku</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="books-grid" aria-busy="true">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="book-card-skeleton" />
          ))}
        </div>
      ) : loadError ? (
        <div className="new-arrivals-error">
          <p>Koleksi terbaru sedang disiapkan oleh pustakawan.</p>
        </div>
      ) : books.length === 0 ? (
        <div className="new-arrivals-empty">
          <BookOpenIcon size={36} className="empty-icon" />
          <h3 className="empty-title">Belum Ada Koleksi Terbaru</h3>
          <p className="empty-desc">
            Buku-buku baru akan segera ditambahkan ke dalam katalog perpustakaan.
          </p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => {
            const isFav = favoritesList.some((f) => f.book_id === book.id || f.id === book.id)
            return (
              <BookCard
                key={book.id}
                book={book}
                onSelectBook={onSelectBook}
                onBorrow={onBorrow}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFav}
              />
            )
          })}
        </div>
      )}

      <div className="new-arrivals-footer-btn">
        <button
          type="button"
          className="btn-explore-all"
          onClick={onGoToCatalog}
        >
          <span>Jelajahi Semua Buku</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  )
}
