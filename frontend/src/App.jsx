import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HeroCarousel } from './components/home/HeroCarousel'
import { SearchBanner } from './components/home/SearchBanner'
import { CategorySection } from './components/home/CategorySection'
import { FeaturedSection } from './components/home/FeaturedSection'
import { AboutSection } from './components/home/AboutSection'
import { CtaBanner } from './components/home/CtaBanner'
import { CatalogView } from './components/books/CatalogView'
import { BookDetailModal } from './components/books/BookDetailModal'
import { AuthModal } from './components/auth/AuthModal'
import { MemberDashboard } from './components/member/MemberDashboard'
import {
  getStoredUser,
  logoutUser,
  getMemberFavorites,
  addFavorite,
  removeFavorite,
  borrowBook,
} from './services/api'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [notice, setNotice] = useState('')
  const [currentView, setCurrentView] = useState('home') // 'home' | 'member-dashboard'

  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login') // 'login' | 'register'

  // Catalog search and filter synchronization
  const [catalogSearch, setCatalogSearch] = useState('')
  const [catalogCategory, setCatalogCategory] = useState(null)

  // Book Detail Modal state
  const [selectedBook, setSelectedBook] = useState(null)
  const [borrowLoading, setBorrowLoading] = useState(false)

  // Member favorites list
  const [favoritesList, setFavoritesList] = useState([])

  // Load user from storage on mount
  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  // Load member favorites when logged in
  useEffect(() => {
    let isMounted = true
    if (currentUser && currentUser.role === 'member') {
      getMemberFavorites()
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setFavoritesList(data)
          }
        })
        .catch(() => {
          // Ignore if error or not authenticated
        })
    } else {
      setFavoritesList([])
    }
    return () => {
      isMounted = false
    }
  }, [currentUser])

  function handleLogout() {
    logoutUser()
    setCurrentUser(null)
    setFavoritesList([])
    setCurrentView('home')
    setNotice('Anda telah berhasil keluar dari akun.')
  }

  function handleLoginClick() {
    setAuthModalMode('login')
    setAuthModalOpen(true)
  }

  function handleRegisterClick() {
    setAuthModalMode('register')
    setAuthModalOpen(true)
  }

  function handleAuthSuccess(user, token, message) {
    setCurrentUser(user)
    setNotice(message || `Selamat datang, ${user.name}!`)
    if (user.role === 'member') {
      setCurrentView('member-dashboard')
      getMemberFavorites()
        .then((data) => {
          if (Array.isArray(data)) setFavoritesList(data)
        })
        .catch(() => {})
    }
  }

  function handleRequireLogin(actionDesc = 'melakukan aksi ini') {
    setNotice(`Silakan masuk ke akun anggota RuangDegup terlebih dahulu untuk ${actionDesc}.`)
    handleLoginClick()
  }

  // Smooth scroll helper
  function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleExploreClick() {
    if (currentView !== 'home') {
      setCurrentView('home')
      setTimeout(() => scrollToSection('katalog-koleksi'), 50)
    } else {
      scrollToSection('katalog-koleksi')
    }
  }

  function handleAboutClick() {
    if (currentView !== 'home') {
      setCurrentView('home')
      setTimeout(() => scrollToSection('tentang'), 50)
    } else {
      scrollToSection('tentang')
    }
  }

  // When search is submitted from the SearchBanner
  function handleSearchFromBanner(keyword) {
    setCatalogSearch(keyword)
    scrollToSection('katalog-koleksi')
  }

  // When category is clicked from CategorySection
  function handleSelectCategoryFromSection(catName) {
    setCatalogCategory(catName)
    scrollToSection('katalog-koleksi')
  }

  // Open Book Detail Modal
  function handleSelectBook(book) {
    setSelectedBook(book)
  }

  function handleCloseModal() {
    setSelectedBook(null)
  }

  // Borrow book handler
  async function handleBorrow(book) {
    if (!currentUser) {
      handleRequireLogin(`meminjam buku "${book.judul}"`)
      return
    }

    setBorrowLoading(true)
    try {
      const res = await borrowBook(book.id)
      setNotice(
        res.message || `Buku "${book.judul}" berhasil dipinjam! Silakan periksa di dashboard anggota Anda.`
      )
      // If modal is open for this book, decrement local stock count
      if (selectedBook && selectedBook.id === book.id) {
        setSelectedBook((prev) => ({
          ...prev,
          stok: Math.max(0, Number(prev.stok) - 1),
        }))
      }
    } catch (err) {
      setNotice(err.message || 'Gagal memproses peminjaman buku.')
    } finally {
      setBorrowLoading(false)
    }
  }

  // Toggle favorite handler
  async function handleToggleFavorite(book) {
    if (!currentUser) {
      handleRequireLogin('menyimpan buku favorit')
      return
    }

    const isFav = favoritesList.some(
      (f) => Number(f.book_id || f.id) === Number(book.id)
    )

    try {
      if (isFav) {
        await removeFavorite(book.id)
        setFavoritesList((prev) =>
          prev.filter((f) => Number(f.book_id || f.id) !== Number(book.id))
        )
        setNotice(`Buku "${book.judul}" dihapus dari favorit.`)
      } else {
        const res = await addFavorite(book.id)
        setFavoritesList((prev) => [...prev, res.data || { book_id: book.id, book }])
        setNotice(`Buku "${book.judul}" ditambahkan ke favorit.`)
      }
    } catch (err) {
      setNotice(err.message || 'Gagal memperbarui status favorit.')
    }
  }

  function handleNavigate(target) {
    if (target === 'member-dashboard') {
      if (currentUser && currentUser.role === 'member') {
        setCurrentView('member-dashboard')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        handleRequireLogin('mengakses Ruang Anggota')
      }
      return
    }

    if (target === 'admin-dashboard') {
      setNotice('Halaman Admin Dashboard akan diintegrasikan pada Fase 8.')
      return
    }

    if (currentView !== 'home') {
      setCurrentView('home')
      setTimeout(() => {
        const targetMap = {
          home: 'beranda',
          explore: 'jelajahi',
          catalog: 'katalog-koleksi',
          about: 'tentang',
        }
        const sectionId = targetMap[target] || target
        scrollToSection(sectionId)
      }, 50)
    } else {
      const targetMap = {
        home: 'beranda',
        explore: 'jelajahi',
        catalog: 'katalog-koleksi',
        about: 'tentang',
      }
      const sectionId = targetMap[target] || target
      scrollToSection(sectionId)
    }
  }

  const isSelectedBookFavorite = selectedBook
    ? favoritesList.some(
        (f) => Number(f.book_id || f.id) === Number(selectedBook.id)
      )
    : false

  return (
    <div className="site-shell">
      {/* NOTIFICATION BAR */}
      {notice && (
        <aside className="notice-bar" role="status" aria-live="polite">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Tutup pemberitahuan"
          >
            &times;
          </button>
        </aside>
      )}

      {/* NAVBAR */}
      <Navbar
        currentUser={currentUser}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {/* MAIN CONTENT */}
      <main id="main-content">
        {currentView === 'member-dashboard' ? (
          <MemberDashboard
            currentUser={currentUser}
            onSelectBook={handleSelectBook}
            onExploreBooks={handleExploreClick}
            onNavigateToProfile={() => {
              setNotice('Pengelolaan Profil Lengkap dan Upload Berkas akan diaktifkan pada Fase 6.')
            }}
          />
        ) : (
          <div className="page-container">
            {/* SECTION 1: HERO CAROUSEL */}
            <HeroCarousel
              onExploreClick={handleExploreClick}
              onAboutClick={handleAboutClick}
            />

            {/* SECTION 2: SEARCH BANNER */}
            <SearchBanner onSearch={handleSearchFromBanner} />

            {/* SECTION 3: KATEGORI BUKU */}
            <CategorySection onSelectCategory={handleSelectCategoryFromSection} />

            {/* SECTION 4: FEATURED BOOKS (KURASI REDAKSI) */}
            <FeaturedSection
              onSelectBook={handleSelectBook}
              onBorrow={handleBorrow}
              onGoToCatalog={handleExploreClick}
            />

            {/* SECTION 5: KATALOG LENGKAP & PENCARIAN & PAGINATION */}
            <div id="katalog-koleksi">
              <CatalogView
                onSelectBook={handleSelectBook}
                onBorrow={handleBorrow}
                onToggleFavorite={handleToggleFavorite}
                favoritesList={favoritesList}
                initialSearch={catalogSearch}
                initialCategory={catalogCategory}
              />
            </div>

            {/* SECTION 6: TENTANG RUANGDEGUP */}
            <AboutSection />

            {/* SECTION 7: CTA KE KATALOG */}
            <CtaBanner
              currentUser={currentUser}
              onExploreClick={handleExploreClick}
              onRegisterClick={handleRegisterClick}
            />
          </div>
        )}
      </main>

      {/* SECTION 8: FOOTER */}
      <Footer onNavigate={handleNavigate} />

      {/* BOOK DETAIL MODAL */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={handleCloseModal}
          currentUser={currentUser}
          onBorrow={handleBorrow}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isSelectedBookFavorite}
          onRequireLogin={handleRequireLogin}
          borrowLoading={borrowLoading}
        />
      )}

      {/* AUTHENTICATION MODAL (LOGIN & REGISTER) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App
