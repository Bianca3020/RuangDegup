import React from 'react'
import { BookOpenIcon, ChevronRight, SparklesIcon, TagIcon } from '../common/Icons'

const curatedCategories = [
  {
    id: 'sastra',
    name: 'Sastra & Fiksi',
    count: 'Koleksi Inti',
    description: 'Novel kanon, fiksi kontemporer, dan cerita realisme magis dunia.',
  },
  {
    id: 'filosofi',
    name: 'Filosofi & Pemikiran',
    count: 'Refleksi Diri',
    description: 'Eksplorasi etika, eksistensialisme, dan gagasan pemikir lintas zaman.',
  },
  {
    id: 'sejarah',
    name: 'Sejarah & Peradaban',
    count: 'Lensa Waktu',
    description: 'Dokumentasi peristiwa masa lalu, biografi, dan dinamika sosial.',
  },
  {
    id: 'sains',
    name: 'Sains & Teknologi Populer',
    count: 'Rasa Ingin Tahu',
    description: 'Penjelasan alam semesta, teknologi, biologi, dan psikologi modern.',
  },
  {
    id: 'seni',
    name: 'Seni, Arsitektur & Desain',
    count: 'Eksplorasi Visual',
    description: 'Karya visual, estetika tata ruang, tipografi, dan inspirasi artistik.',
  },
  {
    id: 'puisi',
    name: 'Puisi & Esai Personal',
    count: 'Resonansi Jiwa',
    description: 'Untaian bait kata, antologi puisi, dan refleksi intim penulis.',
  },
]

export function CategorySection({ onSelectCategory }) {
  return (
    <section className="category-section" id="kategori" aria-label="Kategori Buku">
      <div className="section-header">
        <div>
          <span className="section-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            RAK & GENDER
          </span>
          <h2 className="section-title">Telusuri Menurut Kategori</h2>
        </div>
        <p className="section-lead">
          Setiap rak dirancang untuk memudahkanmu menemukan bacaan yang sesuai dengan suasana hatimu.
        </p>
      </div>

      <div className="category-grid">
        {curatedCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="category-card"
            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
          >
            <div className="category-card__header">
              <span className="category-card__badge">{cat.count}</span>
              <span className="category-card__icon" aria-hidden="true">
                <ChevronRight size={18} />
              </span>
            </div>
            <h3 className="category-card__name">{cat.name}</h3>
            <p className="category-card__desc">{cat.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
