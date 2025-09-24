import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Card = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

const CardHeader = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'px-6 py-4 border-b border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

const CardBody = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

CardBody.displayName = 'CardBody'

const CardFooter = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'px-6 py-4 border-t border-gray-100 bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardBody, CardFooter }
