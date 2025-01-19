import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import './styles/cards.css'
import { AuthProvider } from '../contexts/AuthContext'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains'
})

export const metadata = {
  title: 'Kairos | Turn Brainfog into Action',
  description: 'Reduce overwhelm and make consistent progress with automated task planning. Built for the ADHD brain.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable}`}>
      <head>
        <style>
          {`
            * {
              font-family: var(--font-jetbrains ), sans-serif;
            }
          `}
        </style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

