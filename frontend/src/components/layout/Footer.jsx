import React, { useState, useEffect } from 'react'
import { BookOpenIcon, ClockIcon } from '../common/Icons'
import { fetchRandomQuote } from '../../services/api'

const LAST_QUOTE_KEY = 'ruangdegup_last_quote_id'
const CACHED_QUOTE_KEY = 'ruangdegup_cached_quote'

const DEFAULT_FALLBACK_QUOTE = {
  quote: 'Sebuah buku adalah gerbang sunyi menuju ribuan semesta baru. Di RuangDegup, kami merawat kecintaan membaca dengan tenang dan hangat.',
  author: 'Ruang Degup',
}

export function Footer({ onNavigate }) {
  const [quoteData, setQuoteData] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHED_QUOTE_KEY)
      return cached ? JSON.parse(cached) : DEFAULT_FALLBACK_QUOTE
    } catch {
      return DEFAULT_FALLBACK_QUOTE
    }
  })

  useEffect(() => {
    let isMounted = true
    let lastId = null
    try {
      lastId = localStorage.getItem(LAST_QUOTE_KEY)
    } catch {}

    fetchRandomQuote(lastId)
      .then((res) => {
        if (!isMounted) return
        const quote = res?.data
        if (quote && quote.quote) {
          setQuoteData(quote)
          try {
            localStorage.setItem(LAST_QUOTE_KEY, String(quote.id))
            localStorage.setItem(CACHED_QUOTE_KEY, JSON.stringify(quote))
          } catch {}
        }
      })
      .catch(() => {
        // Keep initial fallback or cached quote gracefully
      })

    return () => {
      isMounted = false
    }
  }, [])

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

          {/* BRAND & DYNAMIC QUOTE SECTION */}
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

            <p className="site-footer__desc">
              Perpustakaan kurasi editorial dengan koleksi pilihan untuk merawat kebiasaan membaca yang tenang dan bermakna.
            </p>

            <div className="site-footer__quote-box">
              <blockquote className="site-footer__quote">
                &ldquo;{quoteData.quote}&rdquo;
              </blockquote>
              <cite className="site-footer__quote-author">
                &mdash; {quoteData.author || 'Ruang Degup'}
              </cite>
            </div>

            <a
              href="https://substack.com/@ruangdegup"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__substack-link"
              aria-label="Kunjungi publikasi RuangDegup di Substack (membuka di tab baru)"
            >
              Baca tulisan di Substack &#x2197;
            </a>
          </div>

          {/* JELAJAHI */}
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

          {/* JAM LAYANAN */}
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

          {/* RUANG BACA */}
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

        {/* BOTTOM FOOTER */}
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
