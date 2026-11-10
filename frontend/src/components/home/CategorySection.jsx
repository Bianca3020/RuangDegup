import React, { useEffect, useState } from 'react'
import { ChevronRight } from '../common/Icons'
import { fetchCatalog } from '../../services/api'

export function CategorySection({
  onSelectCategory,
  selectedCategoryId,
}) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      setLoading(true)
      setLoadError(false)

      try {
        const firstPage = await fetchCatalog({ page: 1 })

        if (!Array.isArray(firstPage?.data)) {
          throw new Error('Respons katalog tidak valid.')
        }

        const allBooks = [...firstPage.data]
        const lastPage = Math.max(
          1,
          Number(firstPage.last_page) || 1
        )

        if (lastPage > 1) {
          const otherPages = await Promise.all(
            Array.from(
              { length: lastPage - 1 },
              (_, index) => fetchCatalog({ page: index + 2 })
            )
          )

          otherPages.forEach((page) => {
            if (Array.isArray(page?.data)) {
              allBooks.push(...page.data)
            }
          })
        }

        const categoryMap = new Map()

        allBooks.forEach((book) => {
          const category = book.category

          if (
            !category ||
            category.id == null ||
            !category.nama_kategori
          ) {
            return
          }

          const key = String(category.id)
          const existing = categoryMap.get(key)

          if (existing) {
            existing.count += 1
          } else {
            categoryMap.set(key, {
              id: category.id,
              name: category.nama_kategori,
              count: 1,
            })
          }
        })

        const result = Array.from(categoryMap.values()).sort(
          (a, b) => a.name.localeCompare(b.name, 'id')
        )

        if (isMounted) {
          setCategories(result)
        }
      } catch {
        if (isMounted) {
          setCategories([])
          setLoadError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [retry])

  return (
    <section
      className="category-section"
      id="kategori"
      aria-label="Kategori Buku"
    >
      <div className="section-header">
        <div>
          <span className="section-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            RAK & KATEGORI
          </span>

          <h2 className="section-title">
            Telusuri Menurut Kategori
          </h2>
        </div>

        <p className="section-lead">
          Temukan bacaan berdasarkan kategori yang tersedia
          dalam koleksi RuangDegup.
        </p>
      </div>

      <div className="category-grid">
        {loading ? (
          <p className="category-state" role="status">
            Memuat kategori dari katalog...
          </p>
        ) : loadError ? (
          <div className="category-state" role="alert">
            <p>Kategori belum dapat dimuat dari server.</p>

            <button
              type="button"
              className="category-state__button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Coba Lagi
            </button>
          </div>
        ) : categories.length === 0 ? (
          <p className="category-state" role="status">
            Belum ada buku berkategori dalam katalog.
          </p>
        ) : (
          categories.map((category) => {
            const isSelected =
              String(selectedCategoryId ?? '') ===
              String(category.id)

            return (
              <button
                key={category.id}
                type="button"
                className={`category-card ${
                  isSelected ? 'category-card--active' : ''
                }`}
                aria-pressed={isSelected}
                onClick={() =>
                  onSelectCategory?.(category.name, category.id)
                }
              >
                <div className="category-card__header">
                  <span className="category-card__badge">
                    {category.count} buku
                  </span>

                  <span
                    className="category-card__icon"
                    aria-hidden="true"
                  >
                    <ChevronRight size={18} />
                  </span>
                </div>

                <h3 className="category-card__name">
                  {category.name}
                </h3>

                <p className="category-card__desc">
                  Jelajahi buku yang terdaftar dalam kategori ini.
                </p>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}