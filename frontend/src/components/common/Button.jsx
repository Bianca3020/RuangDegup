import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  className = '',
  href,
  onClick,
  type = 'button',
  ...props
}) {
  const classes = [
    'rd-btn',
    `rd-btn--${variant}`,
    `rd-btn--${size}`,
    loading ? 'rd-btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {loading && <span className="rd-btn__spinner" aria-hidden="true" />}
      {icon && iconPosition === 'left' && (
        <span className="rd-btn__icon rd-btn__icon--left">{icon}</span>
      )}
      {children && <span className="rd-btn__text">{children}</span>}
      {icon && iconPosition === 'right' && (
        <span className="rd-btn__icon rd-btn__icon--right">{icon}</span>
      )}
    </>
  )

  if (href && !disabled && !loading) {
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  )
}
