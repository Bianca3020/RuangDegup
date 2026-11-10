import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, SparklesIcon } from '../common/Icons'
import { Button } from '../common/Button'
import heroFallback from '../../assets/hero.png'

const slides = [
  {
    id: 1,
    eyebrow: 'SELAMAT DATANG DI RUANGDEGUP',
    title: 'Temukan cerita,',
    accent: 'temukan duniamu.',
    description:
      'Setiap buku punya denyut cerita yang hidup. Jelajahi ribuan koleksi kurasi sastra, pemikiran, dan pengetahuan yang menemanimu bertumbuh.',
    image:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=85',
    alt: 'Rak buku kayu klasik di perpustakaan dengan pencahayaan hangat',
    noteTitle: 'Temukan bacaanmu',
    noteSubtitle: 'Koleksi kurasi terbaru setiap pekan',
  },
  {
    id: 2,
    eyebrow: 'BUKA HALAMAN BARU',
    title: 'Satu buku,',
    accent: 'banyak kemungkinan.',
    description:
      'Jelajahi bacaan baru dari berbagai cakrawala, temukan sudut pandang berbeda, dan biarkan rasa ingin tahu membawamu melangkah lebih jauh.',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=85',
    alt: 'Tumpukan buku bacaan berkualitas di atas meja kayu',
    noteTitle: 'Koleksi Kurasi',
    noteSubtitle: 'Fiksi, filosofi, sains, dan seni',
  },
  {
    id: 3,
    eyebrow: 'CERITAMU DIMULAI DI SINI',
    title: 'Baca, rasakan,',
    accent: 'dan ceritakan.',
    description:
      'Simpan buku favoritmu ke dalam rak pribadi, nikmati kenyamanan peminjaman digital, dan bagikan ulasan bermakna bersama pembaca lainnya.',
    image:
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=85',
    alt: 'Suasana tenang membaca di sudut perpustakaan',
    noteTitle: 'Ruang untuk Rasa',
    noteSubtitle: 'Katalog terhubung dengan sistem aktif',
  },
]

export function HeroCarousel({ onExploreClick, onAboutClick }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [imgErrors, setImgErrors] = useState({})
  const carouselRef = useRef(null)

  const currentSlide = slides[activeSlide]

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  const goToSlide = useCallback((index) => {
    setActiveSlide(index)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return undefined

    if (paused) return undefined

    const timer = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(timer)
  }, [paused, nextSlide])

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevSlide()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextSlide()
    }
  }

  function handleImageError(id) {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <section
      ref={carouselRef}
      className="hero"
      id="beranda"
      aria-roledescription="carousel"
      aria-label="Cerita dan Koleksi Pilihan RuangDegup"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >

      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          <span>{currentSlide.eyebrow}</span>
        </div>

        <h1
          key={`title-${activeSlide}`}
          className="hero-title"
          aria-live="polite"
        >
          <span>{currentSlide.title}</span>
          <span className="hero-title-accent">{currentSlide.accent}</span>
        </h1>

        <p key={`desc-${activeSlide}`} className="hero-description">
          {currentSlide.description}
        </p>

        <div className="hero-actions">
          <Button
            variant="sage"
            size="md"
            icon={<ArrowUpRight size={16} />}
            iconPosition="right"
            onClick={onExploreClick}
            href="#koleksi"
            className="hero-primary-btn"
          >
            Jelajahi koleksi
          </Button>

          <a
            href="#tentang"
            className="text-link hero-secondary-link"
            onClick={(e) => {
              if (onAboutClick) {
                e.preventDefault()
                onAboutClick()
              }
            }}
          >
            <span>Kenali RuangDegup</span>
            <span className="text-link-icon" aria-hidden="true">
              <ArrowRight size={14} />
            </span>
          </a>
        </div>

        <div className="hero-bottom">
          <div className="carousel-dots" role="tablist" aria-label="Pilih slide">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                className={`carousel-dot ${index === activeSlide ? 'is-active' : ''}`}
                aria-label={`Tampilkan slide ${index + 1}: ${slide.title}`}
                aria-selected={index === activeSlide}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          <div className="carousel-controls">
            <span className="carousel-count" aria-hidden="true">
              0{activeSlide + 1}
              <span className="carousel-count-total"> / 0{slides.length}</span>
            </span>

            <button
              type="button"
              className="carousel-arrow carousel-arrow--prev"
              aria-label="Slide sebelumnya"
              onClick={prevSlide}
            >
              <ChevronLeft size={18} strokeWidth={2.4} />
            </button>

            <button
              type="button"
              className="carousel-arrow carousel-arrow--next"
              aria-label="Slide berikutnya"
              onClick={nextSlide}
            >
              <ChevronRight size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <img
          key={`img-${activeSlide}`}
          className="hero-image"
          src={imgErrors[currentSlide.id] ? heroFallback : currentSlide.image}
          alt={currentSlide.alt}
          onError={() => handleImageError(currentSlide.id)}
          loading="eager"
        />

        <div className="hero-image-shade" />

        <div className="floating-note">
          <span className="floating-note-icon">
            <SparklesIcon size={18} />
          </span>
          <span className="floating-note-text">
            <strong>{currentSlide.noteTitle}</strong>
            <small>{currentSlide.noteSubtitle}</small>
          </span>
        </div>

        <div className="hero-image-caption">
          TEMPAT KECIL UNTUK CERITA BESAR
        </div>
      </div>
    </section>
  )
}
