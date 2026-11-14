import React, { useState } from 'react'
import { SearchIcon, ArrowRight, CloseIcon } from '../common/Icons'

const popularKeywords = [
  'Sastra Indonesia',
  'Filosofi',
  'Sains Populer',
  'Pramoedya',
  'Sejarah',
  'Puisi',
]

export function SearchBanner({ onSearch }) {
  const [keyword, setKeyword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (onSearch) {
      onSearch(keyword.trim())
    }
  }

  function handleTagClick(tag) {
    setKeyword(tag)
    if (onSearch) {
      onSearch(tag)
    }
  }

  return (
    <section className="search-banner" id="jelajahi" aria-label="Pencarian Buku">
      <div className="search-banner__card">
        <div className="search-banner__header">
          <span className="section-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            KATALOG & KOLEKSI
          </span>
          <h2 className="search-banner__title">Cari judul, penulis, atau topik bacaan</h2>
          <p className="search-banner__subtitle">
            Akses langsung ke koleksi buku yang tersedia di perpustakaan RuangDegup.
          </p>
        </div>

        <form className="search-banner__form" onSubmit={handleSubmit} role="search">
          <div className="search-banner__input-wrapper">
            <span className="search-banner__icon" aria-hidden="true">
              <SearchIcon size={19} />
            </span>
            <input
              type="search"
              className="search-banner__input"
              placeholder="Cari judul, penulis, atau topik..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="Cari buku atau penulis"
            />
            {keyword && (
              <button
                type="button"
                className="search-banner__clear"
                onClick={() => setKeyword('')}
                aria-label="Hapus kata kunci pencarian"
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="search-banner__btn" aria-label="Cari Buku">
            <span className="search-banner__btn-text-desktop">Cari Buku</span>
            <span className="search-banner__btn-text-mobile">Cari</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="search-banner__tags">
          <span className="search-banner__tags-label">Pencarian populer:</span>
          <div className="search-banner__tags-list">
            {popularKeywords.map((tag) => (
              <button
                key={tag}
                type="button"
                className="search-tag-chip"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
