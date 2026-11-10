import React, { useState, useEffect } from 'react'
import { BookCard } from '../books/BookCard'
import { ArrowRight } from '../common/Icons'
import { fetchCatalog } from '../../services/api'

export function FeaturedSection({
  onSelectBook,
  onBorrow,
  onGoToCatalog,
  searchQuery = '',
  categoryId = null,
  categoryName = '',
  onClearFilters,
}) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)

  const hasFilter =
    searchQuery.trim() !== '' || categoryId != null

  useEffect(() => {
    let isMounted = true

    async function loadBooks() {
      setLoading(true)
      setLoadError(false)

      try {
        const response = await fetchCatalog({
          page: 1,
          search: searchQuery.trim(),
          kategori: categoryId,
        })

        if (!Array.isArray(response?.data)) {
          throw new Error('Respons katalog tidak valid.')
        }

        if (isMounted) {
          setBooks(
            hasFilter
              ? response.data
              : response.data.slice(0, 4)
          )
        }
      } catch {
        if (isMounted) {
          setBooks([])
          setLoadError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadBooks()

    return () => {
      isMounted = false
    }
  }, [searchQuery, categoryId, hasFilter, retry])

  return (
    <section
      className="featured-section"
      id="koleksi"
      aria-label="Koleksi Buku"
    >
      <div className="section-header">
        <div>
          <span className="section-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            KATALOG PERPUSTAKAAN
          </span>

          <h2 className="section-title">
            {searchQuery.trim()
              ? 'Hasil Pencarian'
              : categoryId != null
                ? categoryName || 'Buku Berdasarkan Kategori'
                : 'Koleksi Buku'}
          </h2>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={onGoToCatalog}
        >
          <span>Lihat Koleksi</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {hasFilter && !loading && !loadError && (
        <div className="catalog-filter-summary">
          {searchQuery.trim() && (
            <span>
              Pencarian: <strong>{searchQuery.trim()}</strong>
            </span>
          )}

          {categoryId != null && (
            <span>
              Kategori: <strong>{categoryName}</strong>
            </span>
          )}

          <button
            type="button"
            onClick={onClearFilters}
          >
            Hapus filter
          </button>
        </div>
      )}

      {loading ? (
        <div
          className="book-grid skeleton-grid"
          aria-busy="true"
          aria-label="Memuat katalog"
        >
          {[1, 2, 3, 4].map((number) => (
            <div
              key={number}
              className="book-card-skeleton"
              aria-hidden="true"
            >
              <div className="skeleton skeleton-cover" />
              <div className="skeleton skeleton-line skeleton-line--title" />
              <div className="skeleton skeleton-line skeleton-line--author" />
              <div className="skeleton skeleton-line skeleton-line--desc" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="featured-state" role="alert">
          <p>
            Katalog belum dapat dimuat. Periksa apakah server Laravel
            sedang berjalan.
          </p>

          <button
            type="button"
            className="featured-state__button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Coba Lagi
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="featured-state" role="status">
          <p>
            {hasFilter
              ? 'Tidak ada buku yang cocok dengan pencarian atau kategori ini.'
              : 'Belum ada buku dalam katalog.'}
          </p>

          {hasFilter && (
            <button
              type="button"
              className="featured-state__button"
              onClick={onClearFilters}
            >
              Tampilkan Semua Buku
            </button>
          )}
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelectBook={onSelectBook}
              onBorrow={onBorrow}
            />
          ))}
        </div>
      )}
    </section>
  )
}