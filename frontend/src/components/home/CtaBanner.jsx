import React from 'react'
import { ArrowUpRight, BookOpenIcon } from '../common/Icons'
import { Button } from '../common/Button'

export function CtaBanner({ onExploreClick, onRegisterClick, currentUser }) {
  return (
    <section className="cta-banner" aria-label="Ajak Membaca">
      <div className="cta-banner__card">
        <div className="cta-banner__content">
          <span className="cta-banner__eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            MARI MEMULAI PERJALANAN
          </span>
          <h2 className="cta-banner__title">
            Buku Mana yang Akan Menemanimu Hari Ini?
          </h2>
          <p className="cta-banner__subtitle">
            Daftarkan dirimu menjadi anggota perpustakaan RuangDegup untuk mulai meminjam buku, menyimpan daftar bacaan favorit, dan berbagi ulasan.
          </p>

          <div className="cta-banner__actions">
            <Button
              variant="sage"
              size="lg"
              icon={<ArrowUpRight size={16} />}
              iconPosition="right"
              onClick={onExploreClick}
              href="#koleksi"
            >
              Jelajahi Semua Koleksi
            </Button>

            {!currentUser && (
              <Button
                variant="outline-light"
                size="lg"
                onClick={onRegisterClick}
              >
                Daftar Jadi Anggota
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
