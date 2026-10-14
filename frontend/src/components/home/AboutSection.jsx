import React from 'react'
import { BookOpenIcon, ClockIcon, SparklesIcon, CheckIcon } from '../common/Icons'

export function AboutSection() {
  return (
    <section className="about-section" id="tentang" aria-label="Tentang RuangDegup">
      <div className="about-card">
        <div className="about-card__content">
          <span className="section-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            CERITA DI BALIK RUANG
          </span>
          <h2 className="about-card__title">
            Sebuah Suaka Tenang untuk Jiwa yang Gemar Membaca
          </h2>
          <p className="about-card__lead">
            RuangDegup lahir dari kerinduan sederhana: menghadirkan kembali ruang baca yang intim, hangat, dan jauh dari kebisingan dunia digital yang serbacepat.
          </p>
          <p className="about-card__text">
            Kami percaya bahwa setiap halaman yang kita buka menyimpan denyut kehidupan baru. Di sini, buku bukan sekadar tumpukan kertas berjilid, melainkan jembatan dialog antarpikiran, tempat berteduh saat penat, dan kompas dalam mencari makna.
          </p>

          <div className="about-card__pillars">
            <div className="pillar-item">
              <span className="pillar-icon">
                <SparklesIcon size={18} />
              </span>
              <div>
                <h4 className="pillar-title">Kurasi Terpilih</h4>
                <p className="pillar-desc">
                  Koleksi sastra kanon, pemikiran filsafat, sejarah, dan ilmu pengetahuan yang dipilih dengan teliti.
                </p>
              </div>
            </div>

            <div className="pillar-item">
              <span className="pillar-icon">
                <BookOpenIcon size={18} />
              </span>
              <div>
                <h4 className="pillar-title">Sistem Peminjaman Nyata</h4>
                <p className="pillar-desc">
                  Terintegrasi penuh dengan sistem sirkulasi buku, proteksi stok, dan pencatatan riwayat peminjaman.
                </p>
              </div>
            </div>

            <div className="pillar-item">
              <span className="pillar-icon">
                <ClockIcon size={18} />
              </span>
              <div>
                <h4 className="pillar-title">Kenyamanan Berkunjung</h4>
                <p className="pillar-desc">
                  Ruang baca tenang dengan pencahayaan hangat yang mendukung konsentrasi dan perenungan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-card__visual">
          <div className="about-visual__frame">
            <img
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
              alt="Suasana tenang sudut perpustakaan RuangDegup"
              className="about-visual__image"
              loading="lazy"
            />
            <div className="about-visual__overlay">
              <div className="about-visual__badge">
                <span className="about-badge__mark">r.</span>
                <div>
                  <strong>Ruang Cerita, Ruang Rasa</strong>
                  <small>Berdiri untuk merawat literasi bermakna</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
