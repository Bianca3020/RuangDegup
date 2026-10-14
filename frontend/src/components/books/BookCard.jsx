import React, { useState } from 'react'
import { BookOpenIcon, HeartIcon, ArrowUpRight } from '../common/Icons'

export function BookCard({ book, onSelectBook, onBorrow, onToggleFavorite, isFavorite = false }) {
  const [imgError, setImgError] = useState(false)

  const hasCover = book.cover && !imgError
  const isAvailable = Number(book.stok) > 0
  const categoryName = book.category?.nama_kategori || book.kategori || 'Sastra'

  return (
    <article className="book-card" aria-label={`Buku: ${book.judul}`}>
      {/* COVER WRAPPER */}
      <div className="book-card__cover-wrapper">
        {hasCover ? (
          <img
            src={book.cover}
            alt={`Cover buku ${book.judul}`}
            className="book-card__image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="book-card__fallback-cover">
            <div className="fallback-cover__pattern" />
            <span className="fallback-cover__cat">{categoryName}</span>
            <h4 className="fallback-cover__title">{book.judul}</h4>
            <span className="fallback-cover__author">{book.penulis}</span>
            <div className="fallback-cover__brand">r.</div>
          </div>
        )}

        {/* AVAILABILITY BADGE */}
        <div className="book-card__badge-row">
          <span
            className={`stock-badge ${isAvailable ? 'stock-badge--available' : 'stock-badge--empty'}`}
          >
            {isAvailable ? `Tersedia (${book.stok})` : 'Dipinjam'}
          </span>

          {onToggleFavorite && (
            <button
              type="button"
              className={`book-favorite-btn ${isFavorite ? 'is-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(book)
              }}
              aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            >
              <HeartIcon size={16} filled={isFavorite} />
            </button>
          )}
        </div>
      </div>

      {/* CARD BODY */}
      <div className="book-card__body">
        <div className="book-card__meta">
          <span className="book-card__category">{categoryName}</span>
          {book.tahun_terbit && (
            <span className="book-card__year">&bull; {book.tahun_terbit}</span>
          )}
        </div>

        <h3 className="book-card__title">
          <button
            type="button"
            className="book-card__title-btn"
            onClick={() => onSelectBook && onSelectBook(book)}
          >
            {book.judul}
          </button>
        </h3>

        <p className="book-card__author">Oleh <span>{book.penulis}</span></p>

        {book.deskripsi && (
          <p className="book-card__excerpt">
            {book.deskripsi.length > 95
              ? `${book.deskripsi.substring(0, 95)}...`
              : book.deskripsi}
          </p>
        )}

        <div className="book-card__footer">
          <button
            type="button"
            className="book-card__detail-btn"
            onClick={() => onSelectBook && onSelectBook(book)}
          >
            <span>Detail</span>
            <ArrowUpRight size={14} />
          </button>

          {isAvailable && onBorrow && (
            <button
              type="button"
              className="book-card__borrow-btn"
              onClick={() => onBorrow(book)}
            >
              Pinjam
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
