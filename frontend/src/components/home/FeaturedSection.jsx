import React, { useState, useEffect } from 'react'
import { BookCard } from '../books/BookCard'
import { ArrowRight, SparklesIcon } from '../common/Icons'
import { fetchCatalog } from '../../services/api'

// Curated fallback books used when backend is offline or before seed
const fallbackFeatured = [
  {
    id: 1,
    judul: 'Bumi Manusia',
    penulis: 'Pramoedya Ananta Toer',
    penerbit: 'Hasta Mitra / Lentera Dipantara',
    tahun_terbit: 1980,
    isbn: '9789799731234',
    stok: 3,
    deskripsi: 'Kisah perjuangan Minke, seorang priyayi muda yang berhadapan dengan kolonialisme dan cinta tulusnya pada Annelies Mellema.',
    category: { nama_kategori: 'Sastra Indonesia' },
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    judul: 'Dunia Sophie',
    penulis: 'Jostein Gaarder',
    penerbit: 'Mizan',
    tahun_terbit: 1991,
    isbn: '9789794335432',
    stok: 5,
    deskripsi: 'Sebuah novel filsafat yang membawa pembaca menyusuri sejarah pemikiran manusia dari masa pra-Socrates hingga era kontemporer.',
    category: { nama_kategori: 'Filosofi' },
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    judul: 'Cosmos',
    penulis: 'Carl Sagan',
    penerbit: 'Kepustakaan Populer Gramedia',
    tahun_terbit: 1980,
    isbn: '9786024241238',
    stok: 2,
    deskripsi: 'Sebuah perjalanan mengagumkan melintasi 15 miliar tahun evolusi kosmik dan perkembangan ilmu pengetahuan manusia.',
    category: { nama_kategori: 'Sains Populer' },
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    judul: 'Hujan Bulan Juni',
    penulis: 'Sapardi Djoko Damono',
    penerbit: 'Gramedia Pustaka Utama',
    tahun_terbit: 1994,
    isbn: '9786020301239',
    stok: 4,
    deskripsi: 'Kumpulan sajak legendaris tentang ketabahan, kearifan, dan kerinduan yang tak sempat terucapkan.',
    category: { nama_kategori: 'Puisi' },
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
  },
]

export function FeaturedSection({ onSelectBook, onBorrow, onGoToCatalog }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUsingApi, setIsUsingApi] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadBooks() {
      setLoading(true)
      try {
        const response = await fetchCatalog({ page: 1 })
        if (isMounted) {
          if (response && response.data && response.data.length > 0) {
            setBooks(response.data.slice(0, 4))
            setIsUsingApi(true)
          } else {
            setBooks(fallbackFeatured)
          }
        }
      } catch (err) {
        if (isMounted) {
          // Graceful fallback to editorial curated list
          setBooks(fallbackFeatured)
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
  }, [])

  return (
    <section className="featured-section" id="koleksi" aria-label="Buku Pilihan Redaksi">
      <div className="section-header">
        <div>
          <span className="section-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            KURASI REDAKSI
          </span>
          <h2 className="section-title">Buku Pilihan Pekan Ini</h2>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={onGoToCatalog}
        >
          <span>Lihat Semua Koleksi</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="book-grid skeleton-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="book-card-skeleton" aria-hidden="true">
              <div className="skeleton skeleton-cover" />
              <div className="skeleton skeleton-line skeleton-line--title" />
              <div className="skeleton skeleton-line skeleton-line--author" />
              <div className="skeleton skeleton-line skeleton-line--desc" />
            </div>
          ))}
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
