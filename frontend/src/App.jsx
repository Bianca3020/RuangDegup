import React, { useState, useEffect } from 'react'
import './App.css'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HeroCarousel } from './components/home/HeroCarousel'
import { SearchBanner } from './components/home/SearchBanner'
import { CategorySection } from './components/home/CategorySection'
import { FeaturedSection } from './components/home/FeaturedSection'
import { AboutSection } from './components/home/AboutSection'
import { CtaBanner } from './components/home/CtaBanner'
import { getStoredUser, logoutUser } from './services/api'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    // Check initial user session from localStorage
    const user = getStoredUser()
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  function handleLogout() {
    logoutUser()
    setCurrentUser(null)
    setNotice('Anda telah berhasil keluar dari akun.')
  }

  function handleLoginClick() {
    setNotice('Fitur autentikasi Login & Registrasi lengkap akan diintegrasikan pada Fase 4.')
  }

  function handleRegisterClick() {
    setNotice('Pendaftaran anggota baru akan diintegrasikan pada Fase 4.')
  }

  function handleExploreClick() {
    const el = document.getElementById('koleksi')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleAboutClick() {
    const el = document.getElementById('tentang')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleSearch(keyword) {
    if (!keyword) return
    setNotice(`Mencari buku dengan kata kunci: "${keyword}". Modul katalog pencarian lengkap siap pada Fase 3.`)
    const el = document.getElementById('koleksi')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleSelectCategory(catName) {
    setNotice(`Kategori dipilih: "${catName}". Filter dinamis katalog akan aktif pada Fase 3.`)
    const el = document.getElementById('koleksi')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function handleSelectBook(book) {
    setNotice(`Membuka buku "${book.judul}" oleh ${book.penulis}. Detail modal lengkap akan dibuka pada Fase 3.`)
  }

  function handleBorrow(book) {
    if (!currentUser) {
      setNotice(`Untuk meminjam "${book.judul}", silakan masuk ke akun anggota terlebih dahulu.`)
    } else {
      setNotice(`Permintaan peminjaman "${book.judul}" akan diproses.`)
    }
  }

  function handleNavigate(target) {
    const targetMap = {
      home: 'beranda',
      explore: 'jelajahi',
      catalog: 'koleksi',
      about: 'tentang',
    }
    const sectionId = targetMap[target] || target
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
        <div className="page-container">
          {/* SECTION 1: HERO CAROUSEL */}
          <HeroCarousel
            onExploreClick={handleExploreClick}
            onAboutClick={handleAboutClick}
          />

          {/* SECTION 2: SEARCH BANNER */}
          <SearchBanner onSearch={handleSearch} />

          {/* SECTION 3: KATEGORI BUKU */}
          <CategorySection onSelectCategory={handleSelectCategory} />

          {/* SECTION 4 & 5: FEATURED BOOKS & RECENT PICKS */}
          <FeaturedSection
            onSelectBook={handleSelectBook}
            onBorrow={handleBorrow}
            onGoToCatalog={handleExploreClick}
          />

          {/* SECTION 6: TENTANG RUANGDEGUP */}
          <AboutSection />

          {/* SECTION 7: CTA KE KATALOG */}
          <CtaBanner
            currentUser={currentUser}
            onExploreClick={handleExploreClick}
            onRegisterClick={handleRegisterClick}
          />
        </div>
      </main>

      {/* SECTION 8: FOOTER */}
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}

export default App