import React from 'react'
import { BookOpenIcon, ClockIcon } from '../common/Icons'

export function Footer({ onNavigate }) {
  function handleLink(e, target) {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(target)
    }
  }

  return (
    <footer className="site-footer">
      <div className="page-container">
        <div className="site-footer__grid">
          {/* BRAND COLUMN */}
          <div className="site-footer__brand-col">
            <a href="#beranda" className="brand" onClick={(e) => handleLink(e, 'home')}>
              <span className="brand-mark">r.</span>
              <span className="brand-wording">
                <span className="brand-name">
                  Ruang<span>Degup</span>
                </span>
                <span className="brand-tagline">RUANG CERITA, RUANG RASA</span>
              </span>
            </a>
            <p className="site-footer__quote">
              "Sebuah buku adalah gerbang sunyi menuju ribuan semesta baru. Di RuangDegup, kami merawat kecintaan membaca dengan tenang dan hangat."
            </p>
          </div>

          {/* EXPLORE COLUMN */}
          <div className="site-footer__col">
            <h4 className="site-footer__title">Jelajahi</h4>
            <ul className="site-footer__links">
              <li>
                <a href="#koleksi" onClick={(e) => handleLink(e, 'catalog')}>Katalog Buku</a>
              </li>
              <li>
                <a href="#kategori" onClick={(e) => handleLink(e, 'catalog')}>Rak & Kategori</a>
              </li>
              <li>
                <a href="#tentang" onClick={(e) => handleLink(e, 'about')}>Tentang Kami</a>
              </li>
              <li>
                <a href="#panduan" onClick={(e) => handleLink(e, 'about')}>Panduan Peminjaman</a>
              </li>
            </ul>
          </div>

          {/* OPERATIONAL HOURS */}
          <div className="site-footer__col">
            <h4 className="site-footer__title">
              <ClockIcon size={14} className="inline-icon" /> Jam Layanan
            </h4>
            <div className="site-footer__schedule">
              <div>
                <strong>Senin – Jumat</strong>
                <span>08.00 – 16.30 WIB</span>
              </div>
              <div>
                <strong>Sabtu</strong>
                <span>09.00 – 14.00 WIB</span>
              </div>
              <div>
                <strong className="text-muted">Minggu / Libur Nasional</strong>
                <span className="text-muted">Tutup</span>
              </div>
            </div>
          </div>

          {/* EDITORIAL NOTE */}
          <div className="site-footer__col">
            <h4 className="site-footer__title">
              <BookOpenIcon size={14} className="inline-icon" /> Ruang Baca
            </h4>
            <p className="site-footer__text">
              Perpustakaan kurasi independen yang memadukan kehangatan buku fisik dengan kenyamanan teknologi modern.
            </p>
            <div className="site-footer__badge">
              <span>Akses Terbuka &middot; Berbasis Laravel REST API</span>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>&copy; {new Date().getFullYear()} RuangDegup. Hak cipta dilindungi undang-undang.</p>
          <div className="site-footer__legal">
            <span>Dirancang dengan kehangatan editorial</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
