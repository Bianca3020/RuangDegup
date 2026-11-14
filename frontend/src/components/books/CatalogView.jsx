import { useState, useEffect, useCallback, useMemo } from 'react'
import { BookCard } from './BookCard'
import {
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  RefreshIcon,
  BookOpenIcon,
  CloseIcon,
} from '../common/Icons'
import { Button } from '../common/Button'
import { fetchCatalog } from '../../services/api'

// Curated fallback books used when Laravel API is offline / database is being prepared
const fallbackCatalog = [
  {
    id: 1,
    category_id: 1,
    judul: 'Bumi Manusia',
    penulis: 'Pramoedya Ananta Toer',
    penerbit: 'Lentera Dipantara',
    tahun_terbit: 1980,
    isbn: '9789799731234',
    stok: 3,
    deskripsi: 'Roman pertama Tetralogi Buru yang mengisahkan pergulatan batin dan pemikiran Minke di masa awal kebangkitan nasional.',
    category: { id: 1, nama_kategori: 'Sastra Indonesia' },
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    category_id: 2,
    judul: 'Dunia Sophie',
    penulis: 'Jostein Gaarder',
    penerbit: 'Mizan',
    tahun_terbit: 1991,
    isbn: '9789794335432',
    stok: 5,
    deskripsi: 'Sebuah novel filsafat yang menyusuri sejarah pemikiran manusia dari mitos Yunani kuno hingga era sains modern.',
    category: { id: 2, nama_kategori: 'Filosofi' },
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    category_id: 3,
    judul: 'Cosmos',
    penulis: 'Carl Sagan',
    penerbit: 'Kepustakaan Populer Gramedia',
    tahun_terbit: 1980,
    isbn: '9786024241238',
    stok: 2,
    deskripsi: 'Penjelajahan kosmik yang mengagumkan tentang alam semesta, asal-usul materi, dan masa depan kecerdasan manusia.',
    category: { id: 3, nama_kategori: 'Sains Populer' },
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    category_id: 4,
    judul: 'Hujan Bulan Juni',
    penulis: 'Sapardi Djoko Damono',
    penerbit: 'Gramedia Pustaka Utama',
    tahun_terbit: 1994,
    isbn: '9786020301239',
    stok: 4,
    deskripsi: 'Kumpulan puisi liris legendaris tentang ketabahan, kearifan cinta, dan rindu yang sunyi.',
    category: { id: 4, nama_kategori: 'Puisi' },
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    category_id: 1,
    judul: 'Anak Semua Bangsa',
    penulis: 'Pramoedya Ananta Toer',
    penerbit: 'Lentera Dipantara',
    tahun_terbit: 1981,
    isbn: '9789799731241',
    stok: 2,
    deskripsi: 'Buku kedua Tetralogi Buru yang memperdalam proses kesadaran nasional Minke dan persahabatannya dengan Jean Marais.',
    category: { id: 1, nama_kategori: 'Sastra Indonesia' },
    cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    category_id: 5,
    judul: 'Sapiens: Riwayat Singkat Umat Manusia',
    penulis: 'Yuval Noah Harari',
    penerbit: 'KPG',
    tahun_terbit: 2014,
    isbn: '9786024244161',
    stok: 4,
    deskripsi: 'Eksplorasi berani tentang bagaimana spesies manusia yang tidak mencolok bisa menaklukkan seluruh planet Bumi.',
    category: { id: 5, nama_kategori: 'Sejarah & Humaniora' },
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    category_id: 2,
    judul: 'Madilog: Materialisme, Dialektika, Logika',
    penulis: 'Tan Malaka',
    penerbit: 'Pusat Data Indikator',
    tahun_terbit: 1943,
    isbn: '9789799731999',
    stok: 3,
    deskripsi: 'Karya pemikiran monumental Tan Malaka yang mengajak bangsa Indonesia keluar dari belenggu mistisisme menuju cara berpikir ilmiah.',
    category: { id: 2, nama_kategori: 'Filosofi' },
    cover: null,
  },
  {
    id: 8,
    category_id: 4,
    judul: 'Melihat Api Bekerja',
    penulis: 'Maan Mansyur',
    penerbit: 'Gramedia Pustaka Utama',
    tahun_terbit: 2015,
    isbn: '9786020315236',
    stok: 1,
    deskripsi: 'Buku puisi yang mengeksplorasi hubungan manusia dengan kesunyian, malam hari, dan percakapan rahasia dengan diri sendiri.',
    category: { id: 4, nama_kategori: 'Puisi' },
    cover: null,
  },
]

export function CatalogView({
  onSelectBook,
  onBorrow,
  onToggleFavorite,
  favoritesList = [],
  initialSearch = '',
  initialCategory = null,
  onFilterChange,
}) {
  const [books, setBooks] = useState([])
  const [allCategoriesList, setAllCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search & Filter state
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [activeSearch, setActiveSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState('judul-asc') // 'judul-asc', 'judul-desc', 'stok-desc', 'tersedia'

  // Pagination state from Laravel response
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  })

  // Synchronize when initial props change
  useEffect(() => {
    setSearchInput(initialSearch || '')
    setActiveSearch(initialSearch || '')
  }, [initialSearch])

  useEffect(() => {
    setSelectedCategory(initialCategory || null)
  }, [initialCategory])

  // Load all available categories from entire catalog or fallback
  useEffect(() => {
    let isMounted = true
    async function fetchAllCategories() {
      try {
        const firstPage = await fetchCatalog({ page: 1 })
        if (Array.isArray(firstPage?.data)) {
          const catMap = new Map()
          firstPage.data.forEach((b) => {
            if (b.category?.id && b.category?.nama_kategori) {
              catMap.set(String(b.category.id), {
                id: b.category.id,
                name: b.category.nama_kategori,
              })
            }
          })

          const lastPage = Math.max(1, Number(firstPage.last_page) || 1)
          if (lastPage > 1) {
            const pages = await Promise.all(
              Array.from({ length: Math.min(lastPage - 1, 4) }, (_, i) =>
                fetchCatalog({ page: i + 2 })
              )
            )
            pages.forEach((p) => {
              if (Array.isArray(p?.data)) {
                p.data.forEach((b) => {
                  if (b.category?.id && b.category?.nama_kategori) {
                    catMap.set(String(b.category.id), {
                      id: b.category.id,
                      name: b.category.nama_kategori,
                    })
                  }
                })
              }
            })
          }

          if (isMounted && catMap.size > 0) {
            setAllCategoriesList(Array.from(catMap.values()))
          }
        }
      } catch {
        // Handled silently, fallback will be used
      }
    }
    fetchAllCategories()
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch catalog from Laravel API
  const loadCatalog = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true)
      setError(null)

      try {
        const params = { page: pageToLoad }
        if (activeSearch) params.search = activeSearch
        if (selectedCategory) params.kategori = selectedCategory

        const response = await fetchCatalog(params)

        if (response && Array.isArray(response.data)) {
          setBooks(response.data)
          setPagination({
            currentPage: response.current_page || pageToLoad,
            lastPage: response.last_page || 1,
            total: response.total || response.data.length,
            from: response.from || (response.data.length > 0 ? 1 : 0),
            to: response.to || response.data.length,
          })
        } else {
          setBooks([])
          setPagination({ currentPage: 1, lastPage: 1, total: 0, from: 0, to: 0 })
        }
      } catch (err) {
        let filtered = [...fallbackCatalog]
        if (activeSearch) {
          const q = activeSearch.toLowerCase()
          filtered = filtered.filter(
            (b) =>
              b.judul.toLowerCase().includes(q) ||
              b.penulis.toLowerCase().includes(q)
          )
        }
        if (selectedCategory) {
          filtered = filtered.filter(
            (b) =>
              String(b.category_id) === String(selectedCategory) ||
              b.category?.nama_kategori?.toLowerCase() === String(selectedCategory).toLowerCase()
          )
        }

        setBooks(filtered)
        setPagination({
          currentPage: 1,
          lastPage: 1,
          total: filtered.length,
          from: filtered.length > 0 ? 1 : 0,
          to: filtered.length,
        })

        if (!err.isNetworkError) {
          setError(err.message || 'Terjadi kendala saat memuat katalog buku.')
        }
      } finally {
        setLoading(false)
      }
    },
    [activeSearch, selectedCategory]
  )

  useEffect(() => {
    loadCatalog(1)
  }, [loadCatalog])

  // Extract available categories dynamically (merge fetched categories with fallbacks)
  const availableCategories = useMemo(() => {
    const map = new Map()
    fallbackCatalog.forEach((b) => {
      if (b.category?.id) {
        map.set(String(b.category.id), { id: b.category.id, name: b.category.nama_kategori })
      }
    })
    allCategoriesList.forEach((c) => {
      map.set(String(c.id), c)
    })
    books.forEach((b) => {
      if (b.category?.id) {
        map.set(String(b.category.id), { id: b.category.id, name: b.category.nama_kategori })
      }
    })
    return Array.from(map.values())
  }, [books, allCategoriesList])

  // Local sorting
  const sortedBooks = useMemo(() => {
    const list = [...books]
    if (sortBy === 'judul-asc') {
      list.sort((a, b) => a.judul.localeCompare(b.judul))
    } else if (sortBy === 'judul-desc') {
      list.sort((a, b) => b.judul.localeCompare(a.judul))
    } else if (sortBy === 'stok-desc') {
      list.sort((a, b) => Number(b.stok) - Number(a.stok))
    } else if (sortBy === 'tersedia') {
      return list.filter((b) => Number(b.stok) > 0)
    }
    return list
  }, [books, sortBy])

  function handleSearchSubmit(e) {
    e.preventDefault()
    const trimmed = searchInput.trim()
    setActiveSearch(trimmed)
    if (onFilterChange) onFilterChange(trimmed, selectedCategory)
  }

  function handleCategoryClick(catId) {
    const nextCat = String(selectedCategory) === String(catId) ? null : catId
    setSelectedCategory(nextCat)
    if (onFilterChange) onFilterChange(activeSearch, nextCat)
  }

  function handleClearSearch(e) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setSearchInput('')
    setActiveSearch('')
    if (onFilterChange) onFilterChange('', selectedCategory)
  }

  function handleResetFilters() {
    setSearchInput('')
    setActiveSearch('')
    setSelectedCategory(null)
    setSortBy('judul-asc')
    if (onFilterChange) onFilterChange('', null)
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadCatalog(newPage)
      const el = document.getElementById('katalog-header')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="catalog-view" id="katalog-header" aria-label="Katalog Buku Lengkap">
      {/* CATALOG HEADER */}
      <div className="catalog-header">
        <div className="catalog-header__copy">
          <span className="section-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            KATALOG RESMI RUANGDEGUP
          </span>
          <h1 className="catalog-title">Jelajahi Koleksi Buku</h1>
          <p className="catalog-subtitle">
            Koleksi pustaka lengkap yang terhubung dengan sistem sirkulasi peminjaman. Cari berdasarkan judul, penulis, atau topik bacaan favoritmu.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="catalog-toolbar">
        {/* SEARCH & FILTER BAR */}
        <form className="catalog-search-form" onSubmit={handleSearchSubmit} role="search">
          <div className="catalog-search-input-box">
            <SearchIcon size={18} className="catalog-search-icon" />
            <input
              type="search"
              className="catalog-search-input"
              placeholder="Cari judul buku atau penulis..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Cari buku dalam katalog"
            />
            {searchInput && (
              <button
                type="button"
                className="catalog-search-clear"
                onClick={handleClearSearch}
                aria-label="Hapus kata kunci pencarian"
              >
                <CloseIcon size={16} />
              </button>
            )}

            {/* INTEGRATED SORT DROPDOWN INSIDE SEARCH BAR */}
            <div className="catalog-inline-sort">
              <span className="catalog-inline-divider" aria-hidden="true" />
              <select
                id="catalog-sort"
                className="catalog-inline-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Urutkan koleksi buku"
              >
                <option value="judul-asc">A–Z</option>
                <option value="judul-desc">Z–A</option>
                <option value="stok-desc">Stok ↓</option>
                <option value="tersedia">Tersedia</option>
              </select>
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" className="catalog-search-submit-btn">
            Cari
          </Button>
        </form>
      </div>

      {/* CATEGORY CHIPS BAR */}
      <div className="catalog-categories-bar" role="toolbar" aria-label="Filter Kategori">
        <span className="catalog-category-label">
          <FilterIcon size={14} />
          <span>Kategori:</span>
        </span>

        <button
          type="button"
          className={`category-pill ${!selectedCategory ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedCategory(null)
            if (onFilterChange) onFilterChange(activeSearch, null)
          }}
        >
          Semua Koleksi
        </button>

        {availableCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-pill ${
              String(selectedCategory) === String(cat.id) ||
              String(selectedCategory).toLowerCase() === cat.name.toLowerCase()
                ? 'is-active'
                : ''
            }`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ACTIVE FILTER SUMMARY & RESET */}
      {(activeSearch || selectedCategory) && (
        <div className="catalog-active-filters">
          <span className="active-filters-text">
            Menampilkan hasil untuk
            {activeSearch && <strong> &ldquo;{activeSearch}&rdquo;</strong>}
            {selectedCategory && (
              <span> dalam kategori <strong>
                {availableCategories.find((c) => String(c.id) === String(selectedCategory))?.name || selectedCategory}
              </strong></span>
            )}
          </span>
          <button
            type="button"
            className="reset-filters-btn"
            onClick={handleResetFilters}
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* ERROR NOTICE (IF RETRY AVAILABLE) */}
      {error && (
        <div className="catalog-error-card" role="alert">
          <div className="catalog-error-content">
            <h4>Kendala Sinkronisasi Server</h4>
            <p>{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshIcon size={14} />}
            onClick={() => loadCatalog(pagination.currentPage)}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* BOOK GRID / SKELETON / EMPTY STATE */}
      {loading ? (
        <div className="book-grid skeleton-grid" aria-busy="true" aria-label="Memuat buku...">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="book-card-skeleton" aria-hidden="true">
              <div className="skeleton skeleton-cover" />
              <div className="skeleton skeleton-line skeleton-line--title" />
              <div className="skeleton skeleton-line skeleton-line--author" />
              <div className="skeleton skeleton-line skeleton-line--desc" />
            </div>
          ))}
        </div>
      ) : sortedBooks.length === 0 ? (
        <div className="catalog-empty-state" role="status">
          <div className="empty-state-icon">
            <BookOpenIcon size={36} />
          </div>
          <h3 className="empty-state-title">Tidak Ada Buku yang Cocok</h3>
          <p className="empty-state-desc">
            {activeSearch
              ? `Tidak ditemukan buku dengan kata kunci "${activeSearch}". Coba periksa ejaan atau gunakan kata kunci lain.`
              : 'Belum ada buku pada kategori yang dipilih.'}
          </p>
          <Button variant="sage" size="md" onClick={handleResetFilters}>
            Tampilkan Semua Buku
          </Button>
        </div>
      ) : (
        <>
          <div className="catalog-results-counter">
            <span>
              Menampilkan {sortedBooks.length} dari {pagination.total} buku
            </span>
          </div>

          <div className="book-grid">
            {sortedBooks.map((book) => {
              const isFav = favoritesList.some(
                (f) => Number(f.book_id || f.id) === Number(book.id)
              )
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

          {/* PAGINATION CONTROLS */}
          {pagination.lastPage > 1 && (
            <div className="catalog-pagination" role="navigation" aria-label="Navigasi Halaman Katalog">
              <Button
                variant="outline"
                size="md"
                disabled={pagination.currentPage <= 1}
                icon={<ChevronLeft size={16} />}
                iconPosition="left"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Sebelumnya
              </Button>

              <span className="pagination-info">
                Halaman <strong>{pagination.currentPage}</strong> dari <strong>{pagination.lastPage}</strong>
              </span>

              <Button
                variant="outline"
                size="md"
                disabled={pagination.currentPage >= pagination.lastPage}
                icon={<ChevronRight size={16} />}
                iconPosition="right"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

