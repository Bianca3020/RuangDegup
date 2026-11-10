import React, { useState, useEffect } from 'react'
import { ArrowUpRight, MenuIcon, CloseIcon, UserIcon } from '../common/Icons'
import { Button } from '../common/Button'

export function Navbar({ currentUser, onLoginClick, onRegisterClick, onLogout, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  function handleNavClick(e, target) {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(target)
    }
    setMenuOpen(false)
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header__inner">

        <a
          href="#beranda"
          className="brand"
          aria-label="RuangDegup, beranda"
          onClick={(e) => handleNavClick(e, 'home')}
        >
          <span className="brand-mark">r.</span>
          <span className="brand-wording">
            <span className="brand-name">
              Ruang<span>Degup</span>
            </span>
            <span className="brand-tagline">RUANG CERITA, RUANG RASA</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Navigasi utama">
          <a href="#beranda" onClick={(e) => handleNavClick(e, 'home')}>
            Beranda
          </a>
          <a href="#jelajahi" onClick={(e) => handleNavClick(e, 'explore')}>
            Jelajahi
          </a>
          <a href="#koleksi" onClick={(e) => handleNavClick(e, 'catalog')}>
            Koleksi Buku
          </a>
          <a href="#tentang" onClick={(e) => handleNavClick(e, 'about')}>
            Tentang
          </a>
          {currentUser && currentUser.role === 'member' && (
            <a
              href="#dashboard-member"
              onClick={(e) => handleNavClick(e, 'member-dashboard')}
              className="nav-link--highlight"
            >
              Ruang Anggota
            </a>
          )}
          {currentUser && currentUser.role === 'admin' && (
            <a
              href="#dashboard-admin"
              onClick={(e) => handleNavClick(e, 'admin-dashboard')}
              className="nav-link--highlight"
            >
              Admin Panel
            </a>
          )}
        </nav>

        <div className="header-actions">
          {currentUser ? (
            <div className="user-nav-badge">
              <button
                type="button"
                className="user-nav-profile-btn"
                onClick={(e) =>
                  handleNavClick(
                    e,
                    currentUser.role === 'admin' ? 'admin-dashboard' : 'member-dashboard'
                  )
                }
                title="Buka Dashboard"
              >
                <span className="user-nav-avatar">
                  <UserIcon size={16} />
                </span>
                <span className="user-nav-name">{currentUser.name || 'Member'}</span>
              </button>
              <span className="user-nav-role">{currentUser.role === 'admin' ? 'Admin' : 'Member'}</span>
              <button
                type="button"
                className="user-nav-logout"
                onClick={onLogout}
                aria-label="Keluar dari akun"
              >
                Keluar
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="login-button"
                onClick={onLoginClick}
              >
                Masuk
              </button>
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowUpRight size={14} />}
                iconPosition="right"
                onClick={onRegisterClick}
                className="signup-button"
              >
                Daftar
              </Button>
            </>
          )}

          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      <div
        className={`mobile-drawer ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-nav" aria-label="Navigasi seluler">
          <a href="#beranda" onClick={(e) => handleNavClick(e, 'home')}>
            Beranda
          </a>
          <a href="#jelajahi" onClick={(e) => handleNavClick(e, 'explore')}>
            Jelajahi
          </a>
          <a href="#koleksi" onClick={(e) => handleNavClick(e, 'catalog')}>
            Koleksi Buku
          </a>
          <a href="#tentang" onClick={(e) => handleNavClick(e, 'about')}>
            Tentang
          </a>
          {currentUser && currentUser.role === 'member' && (
            <a
              href="#dashboard-member"
              onClick={(e) => handleNavClick(e, 'member-dashboard')}
              style={{ color: 'var(--plum)', fontWeight: 700 }}
            >
              Ruang Anggota
            </a>
          )}
          {currentUser && currentUser.role === 'admin' && (
            <a
              href="#dashboard-admin"
              onClick={(e) => handleNavClick(e, 'admin-dashboard')}
              style={{ color: 'var(--plum)', fontWeight: 700 }}
            >
              Admin Panel
            </a>
          )}
        </nav>

        <div className="mobile-drawer-actions">
          {currentUser ? (
            <div className="mobile-user-info">
              <p>Masuk sebagai <strong>{currentUser.name}</strong> ({currentUser.role})</p>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Keluar
              </Button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Button variant="outline" size="md" onClick={() => { setMenuOpen(false); onLoginClick(); }}>
                Masuk
              </Button>
              <Button variant="primary" size="md" icon={<ArrowUpRight size={15} />} onClick={() => { setMenuOpen(false); onRegisterClick(); }}>
                Daftar Akun
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
