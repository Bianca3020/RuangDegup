import { useState, useEffect, useCallback, useRef } from 'react'
import {
  BookOpenIcon,
  TagIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  DownloadIcon,
  FileTextIcon,
  SearchIcon,
  CloseIcon,
  ImageIcon,
  CameraIcon,
  SparklesIcon,
} from '../common/Icons'
import { Button } from '../common/Button'
import {
  getAdminDashboard,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminBooks,
  createAdminBook,
  updateAdminBook,
  deleteAdminBook,
  getAdminMembers,
  createAdminMember,
  updateAdminMember,
  deleteAdminMember,
  getAdminBorrowings,
  createAdminBorrowing,
  returnAdminBorrowing,
  getBorrowingReports,
  downloadBorrowingReportPdf,
  getStorageUrl,
  getAdminFooterQuotes,
  createAdminFooterQuote,
  updateAdminFooterQuote,
  toggleAdminFooterQuote,
  deleteAdminFooterQuote,
} from '../../services/api'

// Jurusan SMKN 6 Surakarta
const SMKN6_JURUSAN = [
  { kode: 'AKL', nama: 'Akuntansi dan Keuangan Lembaga' },
  { kode: 'PM', nama: 'Pemasaran' },
  { kode: 'MPLB', nama: 'Manajemen Perkantoran dan Layanan Bisnis' },
  { kode: 'ULP', nama: 'Usaha Layanan Pariwisata' },
  { kode: 'DKV', nama: 'Desain Komunikasi Visual' },
  { kode: 'PPLG', nama: 'Pengembangan Perangkat Lunak dan Gim' },
  { kode: 'BP', nama: 'Broadcasting dan Perfilman' },
]

export function AdminPanel({ currentUser, onExitAdmin }) {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'books' | 'categories' | 'members' | 'borrowings' | 'reports'

  // Loading & Global notification
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState(null)

  // Resources Data
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [members, setMembers] = useState([])
  const [borrowings, setBorrowings] = useState([])
  const [reports, setReports] = useState([])
  const [reportFilter, setReportFilter] = useState('')
  const [quotes, setQuotes] = useState([])

  // Search & Filters in Tabs
  const [bookSearch, setBookSearch] = useState('')
  const [bookCategoryFilter, setBookCategoryFilter] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [quoteSearch, setQuoteSearch] = useState('')

  // Modals state
  const [modalType, setModalType] = useState(null) // 'book' | 'category' | 'member' | 'borrowing' | 'return' | 'quote' | null
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { type: 'book'|'category'|'member'|'quote', item: object, submitting: boolean } | null

  // Form states
  const [categoryForm, setCategoryForm] = useState({ nama_kategori: '' })
  const [quoteForm, setQuoteForm] = useState({
    quote: '',
    author: '',
    is_active: true,
  })
  const [bookForm, setBookForm] = useState({
    judul: '',
    category_id: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: '',
    isbn: '',
    stok: 1,
    deskripsi: '',
  })

  // Book Cover Upload states
  const [bookCoverFile, setBookCoverFile] = useState(null)
  const [bookCoverPreview, setBookCoverPreview] = useState(null)
  const [bookCoverExisting, setBookCoverExisting] = useState(null)
  const [bookCoverUrl, setBookCoverUrl] = useState('')
  const [coverInputMode, setCoverInputMode] = useState('file') // 'file' | 'url'
  const [bookModalError, setBookModalError] = useState('')
  const bookCoverInputRef = useRef(null)

  // Clean up cover preview object URL
  useEffect(() => {
    return () => {
      if (bookCoverPreview) URL.revokeObjectURL(bookCoverPreview)
    }
  }, [bookCoverPreview])

  const [memberForm, setMemberForm] = useState({
    nama: '',
    tingkat: 'X',
    jurusan: 'PPLG',
    alamat: '',
    no_hp: '',
    tanggal_daftar: new Date().toISOString().split('T')[0],
  })
  const [borrowingForm, setBorrowingForm] = useState({
    member_id: '',
    book_id: '',
    tanggal_pinjam: new Date().toISOString().split('T')[0],
  })
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0])

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (deleteConfirm && !deleteConfirm.submitting) {
          setDeleteConfirm(null)
        } else if (modalType) {
          setModalType(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalType, deleteConfirm])

  /* ==========================================================================
     DATA LOADERS
     ========================================================================== */

  const loadDashboardData = useCallback(async () => {
    try {
      const data = await getAdminDashboard()
      setDashboardStats(data)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat statistik dashboard.' })
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAdminCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat data kategori.' })
    }
  }, [])

  const loadBooks = useCallback(async () => {
    try {
      const data = await getAdminBooks()
      setBooks(Array.isArray(data) ? data : [])
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat data buku.' })
    }
  }, [])

  const loadMembers = useCallback(async () => {
    try {
      const data = await getAdminMembers()
      setMembers(Array.isArray(data) ? data : [])
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat data anggota.' })
    }
  }, [])

  const loadBorrowings = useCallback(async () => {
    try {
      const data = await getAdminBorrowings()
      setBorrowings(Array.isArray(data) ? data : [])
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat data peminjaman.' })
    }
  }, [])

  const loadReports = useCallback(async (status = '') => {
    try {
      const data = await getBorrowingReports(status)
      setReports(Array.isArray(data) ? data : [])
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat laporan peminjaman.' })
    }
  }, [])

  const loadQuotes = useCallback(async () => {
    try {
      const data = await getAdminFooterQuotes()
      setQuotes(Array.isArray(data) ? data : [])
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat kutipan footer.' })
    }
  }, [])

  // Load based on active tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardData()
    } else if (activeTab === 'books') {
      loadBooks()
      loadCategories()
    } else if (activeTab === 'categories') {
      loadCategories()
    } else if (activeTab === 'members') {
      loadMembers()
    } else if (activeTab === 'borrowings') {
      loadBorrowings()
      loadMembers()
      loadBooks()
    } else if (activeTab === 'reports') {
      loadReports(reportFilter)
    } else if (activeTab === 'quotes') {
      loadQuotes()
    }
  }, [activeTab, loadDashboardData, loadBooks, loadCategories, loadMembers, loadBorrowings, loadReports, loadQuotes, reportFilter])

  /* ==========================================================================
     CATEGORY ACTIONS
     ========================================================================== */

  function handleOpenCategoryModal(mode = 'create', category = null) {
    setModalType('category')
    setModalMode(mode)
    setSelectedItem(category)
    setCategoryForm({
      nama_kategori: category ? category.nama_kategori : '',
    })
  }

  async function handleSaveCategory(e) {
    e.preventDefault()
    setModalSubmitting(true)
    try {
      if (modalMode === 'create') {
        const res = await createAdminCategory(categoryForm)
        setFeedback({ type: 'success', message: res.message || 'Kategori berhasil ditambahkan.' })
      } else {
        const res = await updateAdminCategory(selectedItem.id, categoryForm)
        setFeedback({ type: 'success', message: res.message || 'Kategori berhasil diperbarui.' })
      }
      setModalType(null)
      loadCategories()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan kategori.' })
    } finally {
      setModalSubmitting(false)
    }
  }

  function handleDeleteCategory(category) {
    setDeleteConfirm({
      type: 'category',
      item: category,
      title: 'Hapus Kategori Koleksi',
      message: `Apakah Anda yakin ingin menghapus kategori "${category.nama_kategori}"? Kategori yang dihapus tidak dapat dipulihkan.`,
      submitting: false,
    })
  }

  async function handleConfirmDelete() {
    if (!deleteConfirm || !deleteConfirm.item) return
    setDeleteConfirm((prev) => ({ ...prev, submitting: true }))

    try {
      if (deleteConfirm.type === 'category') {
        const res = await deleteAdminCategory(deleteConfirm.item.id)
        setFeedback({ type: 'success', message: res.message || 'Kategori berhasil dihapus.' })
        setDeleteConfirm(null)
        loadCategories()
        loadDashboardData()
      } else if (deleteConfirm.type === 'book') {
        const res = await deleteAdminBook(deleteConfirm.item.id)
        setFeedback({ type: 'success', message: res.message || 'Buku berhasil dihapus.' })
        setDeleteConfirm(null)
        loadBooks()
        loadDashboardData()
      } else if (deleteConfirm.type === 'member') {
        const res = await deleteAdminMember(deleteConfirm.item.id)
        setFeedback({ type: 'success', message: res.message || 'Anggota berhasil dihapus.' })
        setDeleteConfirm(null)
        loadMembers()
        loadDashboardData()
      } else if (deleteConfirm.type === 'quote') {
        const res = await deleteAdminFooterQuote(deleteConfirm.item.id)
        setFeedback({ type: 'success', message: res.message || 'Kutipan footer berhasil dihapus.' })
        setDeleteConfirm(null)
        loadQuotes()
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menghapus data.' })
      setDeleteConfirm((prev) => ({ ...prev, submitting: false }))
    }
  }

  /* ==========================================================================
     BOOK ACTIONS
     ========================================================================== */

  function handleOpenBookModal(mode = 'create', book = null) {
    if (bookCoverPreview) {
      URL.revokeObjectURL(bookCoverPreview)
    }
    setModalType('book')
    setModalMode(mode)
    setSelectedItem(book)
    setBookModalError('')
    setBookCoverFile(null)
    setBookCoverPreview(null)
    setBookCoverExisting(book?.cover ? getStorageUrl(book.cover) : null)
    setBookCoverUrl(book?.cover && (book.cover.startsWith('http://') || book.cover.startsWith('https://')) ? book.cover : '')
    setCoverInputMode('file')

    setBookForm({
      judul: book ? book.judul : '',
      category_id: book ? (book.category_id || (book.category && book.category.id) || '') : (categories[0]?.id || ''),
      penulis: book ? book.penulis : '',
      penerbit: book ? (book.penerbit || '') : '',
      tahun_terbit: book ? (book.tahun_terbit || '') : '',
      isbn: book ? (book.isbn || '') : '',
      stok: book ? (book.stok ?? 1) : 1,
      deskripsi: book ? (book.deskripsi || '') : '',
    })
  }

  function handleCoverFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/jfif', 'image/gif']
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      setBookModalError('Format berkas sampul harus berupa gambar JPG, JPEG, PNG, WEBP, atau GIF.')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setBookModalError('Ukuran berkas sampul tidak boleh melebihi 5 MB.')
      e.target.value = ''
      return
    }

    setBookModalError('')
    setBookCoverFile(file)
    if (bookCoverPreview) {
      URL.revokeObjectURL(bookCoverPreview)
    }
    setBookCoverPreview(URL.createObjectURL(file))
    setFeedback({ type: '', message: '' })
  }

  function handleRemoveCoverSelection() {
    setBookModalError('')
    setBookCoverFile(null)
    if (bookCoverPreview) {
      URL.revokeObjectURL(bookCoverPreview)
      setBookCoverPreview(null)
    }
    if (bookCoverInputRef.current) {
      bookCoverInputRef.current.value = ''
    }
  }

  async function handleSaveBook(e) {
    e.preventDefault()
    setModalSubmitting(true)
    setBookModalError('')
    try {
      const formData = new FormData()
      formData.append('judul', bookForm.judul)
      formData.append('category_id', String(bookForm.category_id))
      formData.append('penulis', bookForm.penulis)
      if (bookForm.penerbit) formData.append('penerbit', bookForm.penerbit)
      if (bookForm.tahun_terbit) formData.append('tahun_terbit', String(bookForm.tahun_terbit))
      if (bookForm.isbn) formData.append('isbn', bookForm.isbn)
      formData.append('stok', String(Number(bookForm.stok)))
      if (bookForm.deskripsi) formData.append('deskripsi', bookForm.deskripsi)

      if (bookCoverFile) {
        formData.append('cover', bookCoverFile)
      } else if (bookCoverUrl.trim()) {
        formData.append('cover_url', bookCoverUrl.trim())
      }

      if (modalMode === 'create') {
        const res = await createAdminBook(formData)
        setFeedback({ type: 'success', message: res.message || 'Buku berhasil ditambahkan dengan sampul.' })
      } else {
        const res = await updateAdminBook(selectedItem.id, formData)
        setFeedback({ type: 'success', message: res.message || 'Buku berhasil diperbarui.' })
      }
      handleRemoveCoverSelection()
      setBookCoverUrl('')
      setModalType(null)
      loadBooks()
    } catch (err) {
      let msg = err.message || 'Gagal menyimpan data buku.'
      if (err.errors) {
        const list = Object.values(err.errors).flat()
        if (list.length > 0) msg = list.join(' ')
      }
      setBookModalError(msg)
      setFeedback({ type: 'error', message: msg })
    } finally {
      setModalSubmitting(false)
    }
  }

  function handleDeleteBook(book) {
    setDeleteConfirm({
      type: 'book',
      item: book,
      title: 'Hapus Koleksi Buku',
      message: `Apakah Anda yakin ingin menghapus buku "${book.judul}" (${book.penulis})? Berkas sampul dan data buku akan dihapus secara permanen.`,
      submitting: false,
    })
  }

  /* ==========================================================================
     MEMBER ACTIONS
     ========================================================================== */

  function handleOpenMemberModal(mode = 'create', member = null) {
    setModalType('member')
    setModalMode(mode)
    setSelectedItem(member)

    let tingkat = 'X'
    let jurusan = 'PPLG'
    if (member && member.kelas) {
      const parts = member.kelas.split(' ')
      if (parts[0]) tingkat = parts[0]
      if (parts[1]) jurusan = parts[1]
    }

    setMemberForm({
      nama: member ? member.nama : '',
      tingkat: tingkat,
      jurusan: jurusan,
      alamat: member ? (member.alamat || '') : '',
      no_hp: member ? (member.no_hp || '') : '',
      tanggal_daftar: member ? (member.tanggal_daftar ? member.tanggal_daftar.split('T')[0] : '') : new Date().toISOString().split('T')[0],
    })
  }

  async function handleSaveMember(e) {
    e.preventDefault()
    setModalSubmitting(true)
    try {
      const payload = {
        nama: memberForm.nama,
        kelas: `${memberForm.tingkat} ${memberForm.jurusan}`,
        alamat: memberForm.alamat || null,
        no_hp: memberForm.no_hp || null,
        tanggal_daftar: memberForm.tanggal_daftar || null,
      }

      if (modalMode === 'create') {
        const res = await createAdminMember(payload)
        setFeedback({ type: 'success', message: res.message || 'Anggota berhasil didaftarkan.' })
      } else {
        const res = await updateAdminMember(selectedItem.id, payload)
        setFeedback({ type: 'success', message: res.message || 'Data anggota berhasil diperbarui.' })
      }
      setModalType(null)
      loadMembers()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan data anggota.' })
    } finally {
      setModalSubmitting(false)
    }
  }

  function handleDeleteMember(member) {
    setDeleteConfirm({
      type: 'member',
      item: member,
      title: 'Hapus Data Anggota Siswa',
      message: `Apakah Anda yakin ingin menghapus anggota "${member.nama}" (${member.nomor_anggota || member.kelas || '-'})? Data siswa dan akun anggota terkait akan dihapus.`,
      submitting: false,
    })
  }

  /* ==========================================================================
     BORROWING & RETURN ACTIONS
     ========================================================================== */

  function handleOpenBorrowingModal() {
    setModalType('borrowing')
    setSelectedItem(null)
    setBorrowingForm({
      member_id: members[0]?.id || '',
      book_id: books.find((b) => b.stok > 0)?.id || books[0]?.id || '',
      tanggal_pinjam: new Date().toISOString().split('T')[0],
    })
  }

  async function handleSaveBorrowing(e) {
    e.preventDefault()
    setModalSubmitting(true)
    try {
      const res = await createAdminBorrowing({
        member_id: Number(borrowingForm.member_id),
        book_id: Number(borrowingForm.book_id),
        tanggal_pinjam: borrowingForm.tanggal_pinjam,
      })
      setFeedback({ type: 'success', message: res.message || 'Peminjaman berhasil dicatat.' })
      setModalType(null)
      loadBorrowings()
      loadBooks()
      loadDashboardData()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal mencatat peminjaman.' })
    } finally {
      setModalSubmitting(false)
    }
  }

  function handleOpenReturnModal(borrowing) {
    setModalType('return')
    setSelectedItem(borrowing)
    setReturnDate(new Date().toISOString().split('T')[0])
  }

  async function handleProcessReturn(e) {
    e.preventDefault()
    if (!selectedItem) return
    setModalSubmitting(true)
    try {
      const res = await returnAdminBorrowing(selectedItem.id, returnDate)
      setFeedback({ type: 'success', message: res.message || 'Pengembalian buku berhasil diproses.' })
      setModalType(null)
      loadBorrowings()
      loadBooks()
      loadDashboardData()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memproses pengembalian buku.' })
    } finally {
      setModalSubmitting(false)
    }
  }

  /* ==========================================================================
     PDF REPORT DOWNLOAD
     ========================================================================== */

  async function handleDownloadPdf() {
    try {
      setLoading(true)
      await downloadBorrowingReportPdf(reportFilter)
      setFeedback({ type: 'success', message: 'Laporan PDF berhasil diunduh.' })
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal mengunduh laporan PDF.' })
    } finally {
      setLoading(false)
    }
  }

  /* ==========================================================================
     FOOTER QUOTE ACTIONS
     ========================================================================== */

  function handleOpenQuoteModal(mode = 'create', quote = null) {
    setModalType('quote')
    setModalMode(mode)
    setSelectedItem(quote)
    setQuoteForm({
      quote: quote ? quote.quote : '',
      author: quote ? quote.author : '',
      is_active: quote ? Boolean(quote.is_active) : true,
    })
  }

  async function handleSaveQuote(e) {
    e.preventDefault()
    setModalSubmitting(true)
    try {
      if (modalMode === 'create') {
        const res = await createAdminFooterQuote(quoteForm)
        setFeedback({ type: 'success', message: res.message || 'Kutipan berhasil ditambahkan.' })
      } else {
        const res = await updateAdminFooterQuote(selectedItem.id, quoteForm)
        setFeedback({ type: 'success', message: res.message || 'Kutipan berhasil diperbarui.' })
      }
      setModalType(null)
      loadQuotes()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan kutipan.' })
    } finally {
      setModalSubmitting(false)
    }
  }

  async function handleToggleQuote(quote) {
    try {
      const res = await toggleAdminFooterQuote(quote.id)
      setFeedback({
        type: 'success',
        message: res.message || (res.data?.is_active ? 'Kutipan diaktifkan.' : 'Kutipan dinonaktifkan.'),
      })
      loadQuotes()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal mengubah status kutipan.' })
    }
  }

  function handleDeleteQuote(quote) {
    setDeleteConfirm({
      type: 'quote',
      item: quote,
      title: 'Hapus Kutipan Editorial',
      message: `Apakah Anda yakin ingin menghapus kutipan "${(quote.quote || '').substring(0, 50)}..." karya ${quote.author}?`,
      submitting: false,
    })
  }

  /* ==========================================================================
     FILTERED LISTS
     ========================================================================== */

  const filteredQuotes = quotes.filter((q) => {
    return (
      (q.quote && q.quote.toLowerCase().includes(quoteSearch.toLowerCase())) ||
      (q.author && q.author.toLowerCase().includes(quoteSearch.toLowerCase()))
    )
  })

  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.judul.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.penulis.toLowerCase().includes(bookSearch.toLowerCase()) ||
      (book.isbn && book.isbn.includes(bookSearch))
    const matchCategory =
      !bookCategoryFilter ||
      String(book.category_id || (book.category && book.category.id)) === String(bookCategoryFilter)
    return matchSearch && matchCategory
  })

  const filteredMembers = members.filter((m) => {
    return (
      m.nama.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.nomor_anggota && m.nomor_anggota.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (m.kelas && m.kelas.toLowerCase().includes(memberSearch.toLowerCase()))
    )
  })

  return (
    <div className="admin-shell" aria-label="Panel Administrasi Perpustakaan RuangDegup">
      {/* ADMIN TOP NAV */}
      <div className="admin-topbar">
        <div className="admin-topbar__inner">
          <div className="admin-topbar__left">
            <span className="brand-mark admin-brand-mark">r.</span>
            <div>
              <h1 className="admin-brand-title">Admin Panel Perpustakaan</h1>
              <p className="admin-brand-subtitle">SMKN 6 Surakarta &bull; RuangDegup</p>
            </div>
          </div>

          <div className="admin-topbar__right">
            <span className="admin-user-pill">
              Petugas: <strong>{currentUser?.name || 'Administrator'}</strong>
            </span>
            <button
              type="button"
              className="admin-exit-btn"
              onClick={onExitAdmin}
              aria-label="Kembali ke halaman beranda publik"
            >
              <span>Keluar ke Beranda</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback.message && (
        <div className="page-container admin-alert-container">
          <aside
            className={`admin-alert ${
              feedback.type === 'error' ? 'admin-alert--error' : 'admin-alert--success'
            }`}
            role="status"
          >
            <span className="admin-alert__icon">
              {feedback.type === 'error' ? (
                <AlertCircleIcon size={20} />
              ) : (
                <CheckCircleIcon size={20} />
              )}
            </span>
            <div className="admin-alert__content">
              <p>{feedback.message}</p>
            </div>
            <button
              type="button"
              className="admin-alert__close"
              onClick={() => setFeedback({ type: '', message: '' })}
              aria-label="Tutup pemberitahuan"
            >
              &times;
            </button>
          </aside>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="page-container admin-body">
        {/* TABS NAVIGATION */}
        <nav className="admin-nav-tabs" aria-label="Navigasi Menu Admin">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <ClockIcon size={16} />
            <span>Ringkasan</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'books' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <BookOpenIcon size={16} />
            <span>Koleksi Buku</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'categories' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <TagIcon size={16} />
            <span>Kategori</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'members' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <UsersIcon size={16} />
            <span>Anggota Siswa</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'borrowings' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('borrowings')}
          >
            <RefreshIcon size={16} />
            <span>Peminjaman</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'reports' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileTextIcon size={16} />
            <span>Laporan PDF</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'quotes' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            <SparklesIcon size={16} />
            <span>Kutipan Footer</span>
          </button>
        </nav>

        {/* TAB 1: DASHBOARD RINGKASAN */}
        {activeTab === 'dashboard' && (
          <section className="admin-view-section" aria-label="Ringkasan Statistik">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Ringkasan Sistem Perpustakaan</h2>
                <p className="admin-section-desc">
                  Statistik sirkulasi buku, ketersediaan stok, dan anggota aktif saat ini.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshIcon size={16} />}
                onClick={loadDashboardData}
              >
                Segarkan Data
              </Button>
            </div>

            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <span className="admin-metric-card__label">Total Koleksi Judul</span>
                <span className="admin-metric-card__value">
                  {dashboardStats?.total_buku ?? '-'}
                </span>
                <span className="admin-metric-card__sub">Judul buku terdaftar</span>
              </div>
              <div className="admin-metric-card">
                <span className="admin-metric-card__label">Total Stok Eksemplar</span>
                <span className="admin-metric-card__value">
                  {dashboardStats?.total_stok ?? '-'}
                </span>
                <span className="admin-metric-card__sub">Fisik buku di perpustakaan</span>
              </div>
              <div className="admin-metric-card">
                <span className="admin-metric-card__label">Kategori Koleksi</span>
                <span className="admin-metric-card__value">
                  {dashboardStats?.total_kategori ?? '-'}
                </span>
                <span className="admin-metric-card__sub">Klasifikasi rak buku</span>
              </div>
              <div className="admin-metric-card">
                <span className="admin-metric-card__label">Anggota Siswa</span>
                <span className="admin-metric-card__value">
                  {dashboardStats?.total_anggota ?? '-'}
                </span>
                <span className="admin-metric-card__sub">Siswa SMKN 6 Surakarta</span>
              </div>
              <div className="admin-metric-card">
                <span className="admin-metric-card__label">Sedang Dipinjam</span>
                <span className="admin-metric-card__value admin-metric-card__value--plum">
                  {dashboardStats?.sedang_dipinjam ?? '-'}
                </span>
                <span className="admin-metric-card__sub">Buku di tangan anggota</span>
              </div>
              <div className="admin-metric-card">
                <span className="admin-metric-card__label">Telah Dikembalikan</span>
                <span className="admin-metric-card__value admin-metric-card__value--green">
                  {dashboardStats?.sudah_dikembalikan ?? '-'}
                </span>
                <span className="admin-metric-card__sub">Riwayat selesai transaksi</span>
              </div>
              <div className="admin-metric-card admin-metric-card--alert">
                <span className="admin-metric-card__label">Peminjaman Terlambat</span>
                <span className="admin-metric-card__value admin-metric-card__value--red">
                  {dashboardStats?.terlambat ?? '-'}
                </span>
                <span className="admin-metric-card__sub">Melewati batas 7 hari</span>
              </div>
            </div>

            {/* QUICK ACTIONS BANNER */}
            <div className="admin-quick-actions">
              <h3 className="admin-quick-actions__title">Aksi Cepat Sirkulasi</h3>
              <div className="admin-quick-actions__grid">
                <button
                  type="button"
                  className="quick-action-card"
                  onClick={() => {
                    setActiveTab('borrowings')
                    handleOpenBorrowingModal()
                  }}
                >
                  <PlusIcon size={20} />
                  <span>Catat Peminjaman Baru</span>
                </button>
                <button
                  type="button"
                  className="quick-action-card"
                  onClick={() => {
                    setActiveTab('books')
                    handleOpenBookModal('create')
                  }}
                >
                  <BookOpenIcon size={20} />
                  <span>Tambah Buku Baru</span>
                </button>
                <button
                  type="button"
                  className="quick-action-card"
                  onClick={() => {
                    setActiveTab('members')
                    handleOpenMemberModal('create')
                  }}
                >
                  <UsersIcon size={20} />
                  <span>Daftarkan Siswa</span>
                </button>
                <button
                  type="button"
                  className="quick-action-card"
                  onClick={() => setActiveTab('reports')}
                >
                  <DownloadIcon size={20} />
                  <span>Cetak Laporan PDF</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: KOLEKSI BUKU (CRUD) */}
        {activeTab === 'books' && (
          <section className="admin-view-section" aria-label="Kelola Koleksi Buku">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Manajemen Koleksi Buku</h2>
                <p className="admin-section-desc">
                  Tambah, edit metadata judul, ISBN, kategori, serta perbarui stok buku.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon size={16} />}
                onClick={() => handleOpenBookModal('create')}
              >
                Tambah Buku Baru
              </Button>
            </div>

            {/* SEARCH & CATEGORY FILTER */}
            <div className="admin-filter-bar">
              <div className="admin-search-wrapper">
                <SearchIcon size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan judul, penulis, ISBN..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              <select
                className="admin-select"
                value={bookCategoryFilter}
                onChange={(e) => setBookCategoryFilter(e.target.value)}
              >
                <option value="">Semua Kategori ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            {/* BOOKS TABLE */}
            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Buku</th>
                    <th className="admin-th-category">Kategori</th>
                    <th>Penerbit & Tahun</th>
                    <th>ISBN</th>
                    <th>Stok</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-table-empty">
                        Tidak ada koleksi buku yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div className="admin-book-item">
                            {b.cover ? (
                              <img src={getStorageUrl(b.cover)} alt={b.judul} className="admin-book-item__thumb" />
                            ) : (
                              <div className="admin-book-item__placeholder">
                                <BookOpenIcon size={18} />
                              </div>
                            )}
                            <div>
                              <strong className="admin-book-item__title">{b.judul}</strong>
                              <span className="admin-book-item__author">{b.penulis}</span>
                            </div>
                          </div>
                        </td>
                        <td className="admin-td-category">
                          <span className="admin-badge admin-badge--category">
                            {b.category?.nama_kategori || 'Tanpa Kategori'}
                          </span>
                        </td>
                        <td>
                          <span className="admin-meta-text">
                            {b.penerbit || '-'} {b.tahun_terbit ? `(${b.tahun_terbit})` : ''}
                          </span>
                        </td>
                        <td>
                          <code className="admin-code">{b.isbn || '-'}</code>
                        </td>
                        <td>
                          <span
                            className={`admin-stock-badge ${
                              b.stok === 0 ? 'is-out' : b.stok < 3 ? 'is-low' : ''
                            }`}
                          >
                            {b.stok} buku
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-actions-group">
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--edit"
                              onClick={() => handleOpenBookModal('edit', b)}
                              title="Sunting data buku"
                            >
                              <EditIcon size={16} />
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={() => handleDeleteBook(b)}
                              title="Hapus buku"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: KATEGORI KOLEKSI (CRUD) */}
        {activeTab === 'categories' && (
          <section className="admin-view-section" aria-label="Kelola Kategori">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Kategori Buku</h2>
                <p className="admin-section-desc">
                  Kelola klasifikasi topik dan rak koleksi perpustakaan SMKN 6 Surakarta.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon size={16} />}
                onClick={() => handleOpenCategoryModal('create')}
              >
                Tambah Kategori Baru
              </Button>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Nama Kategori</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="admin-table-empty">
                        Belum ada kategori buku yang tersimpan.
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <span className="admin-meta-text">#{c.id}</span>
                        </td>
                        <td>
                          <strong className="admin-category-name">{c.nama_kategori}</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-actions-group">
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--edit"
                              onClick={() => handleOpenCategoryModal('edit', c)}
                              title="Sunting kategori"
                            >
                              <EditIcon size={16} />
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={() => handleDeleteCategory(c)}
                              title="Hapus kategori"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: DATA ANGGOTA (CRUD) */}
        {activeTab === 'members' && (
          <section className="admin-view-section" aria-label="Kelola Anggota Siswa">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Data Anggota Perpustakaan</h2>
                <p className="admin-section-desc">
                  Daftar siswa SMKN 6 Surakarta yang memiliki hak akses sirkulasi pinjam buku.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon size={16} />}
                onClick={() => handleOpenMemberModal('create')}
              >
                Tambah Anggota Baru
              </Button>
            </div>

            <div className="admin-filter-bar">
              <div className="admin-search-wrapper">
                <SearchIcon size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, nomor anggota, kelas..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No. Anggota</th>
                    <th>Nama Lengkap</th>
                    <th>Tingkat & Jurusan</th>
                    <th>Kontak (HP)</th>
                    <th>Alamat</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-table-empty">
                        Tidak ada data anggota yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <span className="admin-badge admin-badge--id">
                            {m.nomor_anggota || `A${String(m.id).padStart(4, '0')}`}
                          </span>
                        </td>
                        <td>
                          <strong className="admin-member-name">{m.nama}</strong>
                        </td>
                        <td>
                          <span className="admin-badge admin-badge--kelas">
                            {m.kelas || '-'}
                          </span>
                        </td>
                        <td>
                          <span className="admin-meta-text">{m.no_hp || '-'}</span>
                        </td>
                        <td>
                          <span className="admin-meta-text">{m.alamat || '-'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-actions-group">
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--edit"
                              onClick={() => handleOpenMemberModal('edit', m)}
                              title="Sunting data anggota"
                            >
                              <EditIcon size={16} />
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={() => handleDeleteMember(m)}
                              title="Hapus anggota"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 5: PEMINJAMAN & PENGEMBALIAN */}
        {activeTab === 'borrowings' && (
          <section className="admin-view-section" aria-label="Kelola Transaksi Peminjaman">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Sirkulasi & Peminjaman Buku</h2>
                <p className="admin-section-desc">
                  Catat transaksi manual peminjaman dan proses pengembalian buku siswa.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon size={16} />}
                onClick={handleOpenBorrowingModal}
              >
                Catat Peminjaman Baru
              </Button>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Peminjam</th>
                    <th>Judul Buku</th>
                    <th>Tanggal Pinjam</th>
                    <th>Jatuh Tempo</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-table-empty">
                        Belum ada riwayat transaksi peminjaman.
                      </td>
                    </tr>
                  ) : (
                    borrowings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong className="admin-member-name">{b.member?.nama || '-'}</strong>
                          <span className="admin-subtext">
                            {b.member?.nomor_anggota} &bull; {b.member?.kelas}
                          </span>
                        </td>
                        <td>
                          <strong className="admin-book-item__title">{b.book?.judul || '-'}</strong>
                          <span className="admin-subtext">{b.book?.penulis}</span>
                        </td>
                        <td>
                          <span className="admin-meta-text">
                            {b.tanggal_pinjam ? String(b.tanggal_pinjam).split('T')[0] : '-'}
                          </span>
                        </td>
                        <td>
                          <span className="admin-meta-text">
                            {b.jatuh_tempo ? String(b.jatuh_tempo).split('T')[0] : '-'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-status-badge ${
                              b.status === 'dipinjam' ? 'is-borrowed' : 'is-returned'
                            }`}
                          >
                            {b.status === 'dipinjam' ? 'Sedang Dipinjam' : 'Dikembalikan'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {b.status === 'dipinjam' ? (
                            <Button
                              variant="sage"
                              size="sm"
                              onClick={() => handleOpenReturnModal(b)}
                            >
                              Kembalikan
                            </Button>
                          ) : (
                            <span className="admin-meta-text is-muted">
                              Kembali: {b.tanggal_kembali ? String(b.tanggal_kembali).split('T')[0] : '-'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 6: LAPORAN PEMINJAMAN & CETAK PDF */}
        {activeTab === 'reports' && (
          <section className="admin-view-section" aria-label="Laporan Transaksi & Cetak PDF">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Laporan Peminjaman Koleksi</h2>
                <p className="admin-section-desc">
                  Rekapitulasi sirkulasi dan unduh berkas resmi PDF berformat A4 Landscape.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={<DownloadIcon size={16} />}
                disabled={loading}
                onClick={handleDownloadPdf}
              >
                {loading ? 'Mengunduh...' : 'Unduh Laporan PDF'}
              </Button>
            </div>

            {/* FILTER STATUS */}
            <div className="admin-filter-bar">
              <div className="admin-tab-group">
                <button
                  type="button"
                  className={`admin-pill-btn ${reportFilter === '' ? 'is-active' : ''}`}
                  onClick={() => setReportFilter('')}
                >
                  Semua Riwayat
                </button>
                <button
                  type="button"
                  className={`admin-pill-btn ${reportFilter === 'dipinjam' ? 'is-active' : ''}`}
                  onClick={() => setReportFilter('dipinjam')}
                >
                  Sedang Dipinjam
                </button>
                <button
                  type="button"
                  className={`admin-pill-btn ${reportFilter === 'dikembalikan' ? 'is-active' : ''}`}
                  onClick={() => setReportFilter('dikembalikan')}
                >
                  Telah Dikembalikan
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Peminjam & NIS</th>
                    <th>Judul Buku</th>
                    <th>Tgl Pinjam</th>
                    <th>Jatuh Tempo</th>
                    <th>Status Tampilan</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-table-empty">
                        Tidak ada catatan laporan pada kategori filter ini.
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.member?.nama || '-'}</strong>
                          <span className="admin-subtext">{r.member?.nomor_anggota}</span>
                        </td>
                        <td>
                          <strong>{r.book?.judul || '-'}</strong>
                          <span className="admin-subtext">{r.book?.penulis}</span>
                        </td>
                        <td>
                          <span className="admin-meta-text">
                            {r.tanggal_pinjam ? String(r.tanggal_pinjam).split('T')[0] : '-'}
                          </span>
                        </td>
                        <td>
                          <span className="admin-meta-text">
                            {r.jatuh_tempo ? String(r.jatuh_tempo).split('T')[0] : '-'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-status-badge ${
                              r.status_tampilan === 'Terlambat'
                                ? 'is-overdue'
                                : r.status_tampilan === 'Jatuh Tempo'
                                ? 'is-due'
                                : r.status_tampilan === 'Dipinjam'
                                ? 'is-borrowed'
                                : 'is-returned'
                            }`}
                          >
                            {r.status_tampilan || r.status}
                          </span>
                        </td>
                        <td>
                          {r.terlambat_hari > 0 ? (
                            <span className="admin-badge admin-badge--overdue">
                              Terlambat {r.terlambat_hari} hari
                            </span>
                          ) : (
                            <span className="admin-meta-text">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 7: KUTIPAN FOOTER DYNAMIC */}
        {activeTab === 'quotes' && (
          <section className="admin-view-section" aria-label="Manajemen Kutipan Footer">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Manajemen Kutipan Footer</h2>
                <p className="admin-section-desc">
                  Kelola kutipan sastra &amp; editorial yang tampil secara dinamis pada footer website publik.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon size={16} />}
                onClick={() => handleOpenQuoteModal('create')}
              >
                Tambah Kutipan Baru
              </Button>
            </div>

            <div className="admin-filter-bar">
              <div className="admin-search-wrapper">
                <SearchIcon size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Cari kutipan atau nama penulis..."
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '48px' }}>No</th>
                    <th>Isi Kutipan</th>
                    <th style={{ width: '180px' }}>Penulis / Sumber</th>
                    <th style={{ width: '140px' }}>Status</th>
                    <th style={{ width: '120px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="admin-table-empty">
                        Belum ada kutipan editorial yang tersimpan.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotes.map((q, idx) => (
                      <tr key={q.id}>
                        <td>{idx + 1}</td>
                        <td className="quote-text-cell">
                          <p className="quote-cell-content">&ldquo;{q.quote}&rdquo;</p>
                        </td>
                        <td>
                          <strong>{q.author}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`status-toggle-btn ${q.is_active ? 'is-active' : 'is-inactive'}`}
                            onClick={() => handleToggleQuote(q)}
                            title="Klik untuk mengubah status aktif"
                          >
                            <span className="status-dot"></span>
                            {q.is_active ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td>
                          <div className="admin-action-btns">
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--edit"
                              onClick={() => handleOpenQuoteModal('edit', q)}
                              title="Edit Kutipan"
                            >
                              <EditIcon size={15} />
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={() => handleDeleteQuote(q)}
                              title="Hapus Kutipan"
                            >
                              <TrashIcon size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* ==========================================================================
          MODALS
          ========================================================================== */}

      {/* MODAL KATEGORI */}
      {modalType === 'category' && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === 'create' ? 'Tambah Kategori Baru' : 'Sunting Kategori'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalType(null)}
                aria-label="Tutup modal"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">
                  Nama Kategori <span className="req">*</span>
                </label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  placeholder="Contoh: Rekayasa Perangkat Lunak, Fiksi, dsb"
                  className="form-input"
                  value={categoryForm.nama_kategori}
                  onChange={(e) => setCategoryForm({ nama_kategori: e.target.value })}
                  disabled={modalSubmitting}
                />
              </div>

              <div className="admin-modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalType(null)}
                  disabled={modalSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BUKU */}
      {modalType === 'book' && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card admin-modal-card--lg">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === 'create' ? 'Tambah Koleksi Buku' : 'Sunting Data Buku'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  handleRemoveCoverSelection()
                  setModalType(null)
                }}
                aria-label="Tutup modal"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="book-title">
                  Judul Buku <span className="req">*</span>
                </label>
                <input
                  id="book-title"
                  type="text"
                  required
                  placeholder="Masukkan judul buku..."
                  className="form-input"
                  value={bookForm.judul}
                  onChange={(e) => setBookForm({ ...bookForm, judul: e.target.value })}
                  disabled={modalSubmitting}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="book-cat">
                    Kategori Koleksi <span className="req">*</span>
                  </label>
                  <select
                    id="book-cat"
                    required
                    className="form-select"
                    value={bookForm.category_id}
                    onChange={(e) => setBookForm({ ...bookForm, category_id: e.target.value })}
                    disabled={modalSubmitting}
                  >
                    <option value="" disabled>
                      Pilih Kategori
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="book-author">
                    Penulis / Pengarang <span className="req">*</span>
                  </label>
                  <input
                    id="book-author"
                    type="text"
                    required
                    placeholder="Nama penulis..."
                    className="form-input"
                    value={bookForm.penulis}
                    onChange={(e) => setBookForm({ ...bookForm, penulis: e.target.value })}
                    disabled={modalSubmitting}
                  />
                </div>
              </div>

              <div className="form-row form-row--3">
                <div className="form-group">
                  <label className="form-label" htmlFor="book-publisher">
                    Penerbit
                  </label>
                  <input
                    id="book-publisher"
                    type="text"
                    placeholder="Nama penerbit..."
                    className="form-input"
                    value={bookForm.penerbit}
                    onChange={(e) => setBookForm({ ...bookForm, penerbit: e.target.value })}
                    disabled={modalSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="book-year">
                    Tahun Terbit
                  </label>
                  <input
                    id="book-year"
                    type="number"
                    min={1000}
                    max={new Date().getFullYear()}
                    placeholder="YYYY"
                    className="form-input"
                    value={bookForm.tahun_terbit}
                    onChange={(e) => setBookForm({ ...bookForm, tahun_terbit: e.target.value })}
                    disabled={modalSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="book-isbn">
                    ISBN
                  </label>
                  <input
                    id="book-isbn"
                    type="text"
                    placeholder="978-..."
                    className="form-input"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    disabled={modalSubmitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="book-stock">
                    Jumlah Stok Fisik <span className="req">*</span>
                  </label>
                  <input
                    id="book-stock"
                    type="number"
                    min={0}
                    required
                    className="form-input"
                    value={bookForm.stok}
                    onChange={(e) => setBookForm({ ...bookForm, stok: e.target.value })}
                    disabled={modalSubmitting}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Sampul Buku (Berkas Foto atau Tautan URL)
                    </label>
                    <div className="admin-cover-mode-pills">
                      <button
                        type="button"
                        className={`admin-cover-tab ${coverInputMode === 'file' ? 'is-active' : ''}`}
                        onClick={() => setCoverInputMode('file')}
                      >
                        Unggah Berkas (5MB)
                      </button>
                      <button
                        type="button"
                        className={`admin-cover-tab ${coverInputMode === 'url' ? 'is-active' : ''}`}
                        onClick={() => setCoverInputMode('url')}
                      >
                        Tautan / URL Gambar
                      </button>
                    </div>
                  </div>

                  {coverInputMode === 'url' ? (
                    <div className="admin-cover-url-wrapper">
                      <input
                        type="url"
                        placeholder="https://... tempel tautan gambar sampul buku"
                        className="form-input"
                        value={bookCoverUrl}
                        onChange={(e) => setBookCoverUrl(e.target.value)}
                        disabled={modalSubmitting}
                      />
                      {bookCoverUrl && (
                        <div className="admin-cover-preview-card is-new" style={{ marginTop: '10px' }}>
                          <img
                            src={bookCoverUrl}
                            alt="Pratinjau Sampul URL"
                            className="admin-cover-preview-thumb"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <div className="admin-cover-preview-info">
                            <span className="admin-cover-pill admin-cover-pill--new">Tautan Gambar Digunakan</span>
                            <span className="admin-cover-meta" style={{ wordBreak: 'break-all', fontSize: '11px' }}>{bookCoverUrl}</span>
                            <div className="admin-cover-btn-group">
                              <button
                                type="button"
                                className="admin-cover-action-btn admin-cover-action-btn--danger"
                                onClick={() => setBookCoverUrl('')}
                                disabled={modalSubmitting}
                              >
                                <CloseIcon size={14} /> Hapus Tautan
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <input
                        ref={bookCoverInputRef}
                        id="book-cover-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        style={{ display: 'none' }}
                        onChange={handleCoverFileChange}
                        disabled={modalSubmitting}
                      />

                      {bookCoverPreview ? (
                        <div className="admin-cover-preview-card is-new">
                          <img src={bookCoverPreview} alt="Pratinjau Sampul Baru" className="admin-cover-preview-thumb" />
                          <div className="admin-cover-preview-info">
                            <span className="admin-cover-pill admin-cover-pill--new">Berkas Baru Dipilih</span>
                            <strong className="admin-cover-name">{bookCoverFile?.name}</strong>
                            <span className="admin-cover-meta">
                              {bookCoverFile ? (bookCoverFile.size / 1024).toFixed(1) : 0} KB
                            </span>
                            <div className="admin-cover-btn-group">
                              <button
                                type="button"
                                className="admin-cover-action-btn"
                                onClick={() => bookCoverInputRef.current?.click()}
                                disabled={modalSubmitting}
                              >
                                <CameraIcon size={14} /> Ganti Gambar
                              </button>
                              <button
                                type="button"
                                className="admin-cover-action-btn admin-cover-action-btn--danger"
                                onClick={handleRemoveCoverSelection}
                                disabled={modalSubmitting}
                              >
                                <CloseIcon size={14} /> Batalkan Pilihan
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : bookCoverExisting ? (
                        <div className="admin-cover-preview-card">
                          <img src={bookCoverExisting} alt="Sampul Saat Ini" className="admin-cover-preview-thumb" />
                          <div className="admin-cover-preview-info">
                            <span className="admin-cover-pill">Sampul Saat Ini</span>
                            <span className="admin-cover-hint">
                              Sampul ini tetap digunakan jika Anda tidak memilih pengganti.
                            </span>
                            <div className="admin-cover-btn-group">
                              <button
                                type="button"
                                className="admin-cover-action-btn"
                                onClick={() => bookCoverInputRef.current?.click()}
                                disabled={modalSubmitting}
                              >
                                <CameraIcon size={14} /> Ganti dengan Gambar Baru
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="admin-cover-dropzone"
                          onClick={() => bookCoverInputRef.current?.click()}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              bookCoverInputRef.current?.click()
                            }
                          }}
                        >
                          <ImageIcon size={26} className="admin-cover-dropzone__icon" />
                          <div className="admin-cover-dropzone__body">
                            <strong>Pilih Berkas Sampul</strong>
                            <span>Klik untuk memilih berkas dari perangkat Anda (Maks. 5MB)</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="book-desc">
                  Sinopsis / Deskripsi
                </label>
                <textarea
                  id="book-desc"
                  rows={3}
                  placeholder="Ringkasan isi buku..."
                  className="form-textarea"
                  value={bookForm.deskripsi}
                  onChange={(e) => setBookForm({ ...bookForm, deskripsi: e.target.value })}
                  disabled={modalSubmitting}
                />
              </div>

              {bookModalError && (
                <div className="confirm-modal-error-banner" role="alert" style={{ marginBottom: '16px' }}>
                  <AlertCircleIcon size={16} />
                  <span>{bookModalError}</span>
                </div>
              )}

              <div className="admin-modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    handleRemoveCoverSelection()
                    setModalType(null)
                  }}
                  disabled={modalSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Menyimpan...' : 'Simpan Data Buku'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ANGGOTA */}
      {modalType === 'member' && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === 'create' ? 'Tambah Anggota Siswa' : 'Sunting Data Anggota'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalType(null)}
                aria-label="Tutup modal"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="member-name">
                  Nama Lengkap Siswa <span className="req">*</span>
                </label>
                <input
                  id="member-name"
                  type="text"
                  required
                  placeholder="Nama siswa..."
                  className="form-input"
                  value={memberForm.nama}
                  onChange={(e) => setMemberForm({ ...memberForm, nama: e.target.value })}
                  disabled={modalSubmitting}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="member-tingkat">
                    Tingkat Kelas <span className="req">*</span>
                  </label>
                  <select
                    id="member-tingkat"
                    required
                    className="form-select"
                    value={memberForm.tingkat}
                    onChange={(e) => setMemberForm({ ...memberForm, tingkat: e.target.value })}
                    disabled={modalSubmitting}
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="member-jurusan">
                    Jurusan SMKN 6 Surakarta <span className="req">*</span>
                  </label>
                  <select
                    id="member-jurusan"
                    required
                    className="form-select"
                    value={memberForm.jurusan}
                    onChange={(e) => setMemberForm({ ...memberForm, jurusan: e.target.value })}
                    disabled={modalSubmitting}
                  >
                    {SMKN6_JURUSAN.map((j) => (
                      <option key={j.kode} value={j.kode}>
                        {j.kode} — {j.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="member-phone">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    id="member-phone"
                    type="tel"
                    placeholder="08..."
                    className="form-input"
                    value={memberForm.no_hp}
                    onChange={(e) => setMemberForm({ ...memberForm, no_hp: e.target.value })}
                    disabled={modalSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="member-reg-date">
                    Tanggal Terdaftar
                  </label>
                  <input
                    id="member-reg-date"
                    type="date"
                    className="form-input"
                    value={memberForm.tanggal_daftar}
                    onChange={(e) => setMemberForm({ ...memberForm, tanggal_daftar: e.target.value })}
                    disabled={modalSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="member-addr">
                  Alamat Rumah
                </label>
                <textarea
                  id="member-addr"
                  rows={2}
                  placeholder="Alamat domisili..."
                  className="form-textarea"
                  value={memberForm.alamat}
                  onChange={(e) => setMemberForm({ ...memberForm, alamat: e.target.value })}
                  disabled={modalSubmitting}
                />
              </div>

              <div className="admin-modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalType(null)}
                  disabled={modalSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Menyimpan...' : 'Simpan Anggota'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PEMINJAMAN MANUAL */}
      {modalType === 'borrowing' && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Catat Transaksi Peminjaman</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalType(null)}
                aria-label="Tutup modal"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBorrowing} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="borrow-member">
                  Pilih Anggota Siswa <span className="req">*</span>
                </label>
                <select
                  id="borrow-member"
                  required
                  className="form-select"
                  value={borrowingForm.member_id}
                  onChange={(e) => setBorrowingForm({ ...borrowingForm, member_id: e.target.value })}
                  disabled={modalSubmitting}
                >
                  <option value="" disabled>
                    Pilih Siswa Peminjam
                  </option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} ({m.nomor_anggota || `ID #${m.id}`} - {m.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="borrow-book">
                  Pilih Buku Yang Dipinjam <span className="req">*</span>
                </label>
                <select
                  id="borrow-book"
                  required
                  className="form-select"
                  value={borrowingForm.book_id}
                  onChange={(e) => setBorrowingForm({ ...borrowingForm, book_id: e.target.value })}
                  disabled={modalSubmitting}
                >
                  <option value="" disabled>
                    Pilih Buku
                  </option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.stok <= 0}>
                      {b.judul} {b.stok <= 0 ? '(Stok Habis)' : `(Tersedia: ${b.stok})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="borrow-date">
                  Tanggal Pinjam <span className="req">*</span>
                </label>
                <input
                  id="borrow-date"
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="form-input"
                  value={borrowingForm.tanggal_pinjam}
                  onChange={(e) => setBorrowingForm({ ...borrowingForm, tanggal_pinjam: e.target.value })}
                  disabled={modalSubmitting}
                />
                <span className="form-helper-text">
                  Batas waktu pengembalian adalah 7 hari sejak tanggal pinjam.
                </span>
              </div>

              <div className="admin-modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalType(null)}
                  disabled={modalSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Memproses...' : 'Proses Peminjaman'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGEMBALIAN BUKU */}
      {modalType === 'return' && selectedItem && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Proses Pengembalian Buku</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalType(null)}
                aria-label="Tutup modal"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="admin-modal-form">
              <div className="admin-return-summary">
                <p>
                  Siswa: <strong>{selectedItem.member?.nama}</strong>
                </p>
                <p>
                  Buku: <strong>{selectedItem.book?.judul}</strong>
                </p>
                <p>
                  Tanggal Pinjam: <strong>{String(selectedItem.tanggal_pinjam).split('T')[0]}</strong>
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="return-date">
                  Tanggal Pengembalian Fisik <span className="req">*</span>
                </label>
                <input
                  id="return-date"
                  type="date"
                  required
                  min={String(selectedItem.tanggal_pinjam).split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  className="form-input"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  disabled={modalSubmitting}
                />
                <span className="form-helper-text">
                  Stok buku di perpustakaan akan bertambah kembali secara otomatis.
                </span>
              </div>

              <div className="admin-modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalType(null)}
                  disabled={modalSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Memproses...' : 'Konfirmasi Pengembalian'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KUTIPAN FOOTER */}
      {modalType === 'quote' && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title" id="quote-modal-title">
                {modalMode === 'create' ? 'Tambah Kutipan Editorial Baru' : 'Edit Kutipan Editorial'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalType(null)}
                aria-label="Tutup Modal"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveQuote} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="quote-text">
                  Isi Kutipan Puitis <span className="req">*</span>
                </label>
                <textarea
                  id="quote-text"
                  required
                  rows="4"
                  className="form-input form-textarea"
                  placeholder="Tuliskan kalimat kutipan editorial yang menginspirasi..."
                  value={quoteForm.quote}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quote: e.target.value })}
                  disabled={modalSubmitting}
                />
                <span className="form-helper-text">
                  Kutipan ini akan dimuat secara dinamis dan bergantian di bagian footer publik website.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quote-author">
                  Penulis / Sumber Kutipan <span className="req">*</span>
                </label>
                <input
                  id="quote-author"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Ruang Degup, Pramoedya Ananta Toer, Andrea Hirata, dll."
                  value={quoteForm.author}
                  onChange={(e) => setQuoteForm({ ...quoteForm, author: e.target.value })}
                  disabled={modalSubmitting}
                />
              </div>

              <div className="form-group">
                <label className="form-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--plum)' }}>
                  <input
                    type="checkbox"
                    checked={quoteForm.is_active}
                    onChange={(e) => setQuoteForm({ ...quoteForm, is_active: e.target.checked })}
                    disabled={modalSubmitting}
                  />
                  <span>Kutipan Aktif (Boleh ditampilkan bergantian di footer publik)</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalType(null)}
                  disabled={modalSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Menyimpan...' : modalMode === 'create' ? 'Tambah Kutipan' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="admin-modal-card admin-confirm-dialog">
            <div className="admin-confirm-header">
              <span className="admin-confirm-icon" aria-hidden="true">
                <AlertCircleIcon size={24} />
              </span>
              <div>
                <h3 className="admin-confirm-title" id="delete-dialog-title">
                  {deleteConfirm.title}
                </h3>
                <p className="admin-confirm-sub">Konfirmasi Tindakan Admin</p>
              </div>
            </div>

            <div className="admin-confirm-body">
              <p>{deleteConfirm.message}</p>
            </div>

            <div className="admin-confirm-actions">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteConfirm.submitting}
              >
                Batalkan
              </Button>
              <button
                type="button"
                className="admin-confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={deleteConfirm.submitting}
              >
                {deleteConfirm.submitting ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
