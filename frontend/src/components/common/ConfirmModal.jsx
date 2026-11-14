import React, { useEffect } from 'react'
import { CloseIcon, AlertCircleIcon, TrashIcon, BookOpenIcon, CheckCircleIcon } from './Icons'

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  subtitle = 'Konfirmasi Tindakan',
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batalkan',
  variant = 'primary', // 'primary' | 'danger' | 'sage'
  icon = null,
  loading = false,
  error = '',
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  // Default icon based on variant if not provided
  let defaultIcon = <AlertCircleIcon size={24} />
  if (variant === 'danger') {
    defaultIcon = <TrashIcon size={22} />
  } else if (variant === 'sage') {
    defaultIcon = <BookOpenIcon size={22} />
  }

  return (
    <div
      className="confirm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <div className="confirm-modal-card">
        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="confirm-modal-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Tutup dialog"
        >
          <CloseIcon size={18} />
        </button>

        {/* HEADER */}
        <div className="confirm-modal-header">
          <div className={`confirm-modal-icon-badge confirm-modal-icon-badge--${variant}`}>
            {icon || defaultIcon}
          </div>
          <div className="confirm-modal-header-text">
            {subtitle && <span className="confirm-modal-subtitle">{subtitle}</span>}
            <h3 id="confirm-modal-title" className="confirm-modal-title">
              {title}
            </h3>
          </div>
        </div>

        {/* BODY */}
        <div className="confirm-modal-body">
          {error && (
            <div className="confirm-modal-error-banner" role="alert">
              <AlertCircleIcon size={16} />
              <span>{error}</span>
            </div>
          )}
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        {/* ACTIONS */}
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-modal-btn confirm-modal-btn--${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="confirm-modal-btn-loading">
                <span className="confirm-modal-spinner" />
                <span>Memproses...</span>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
