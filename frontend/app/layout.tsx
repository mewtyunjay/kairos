import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import './styles/cards.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains'
})

export const metadata = {
  title: 'Task Buddy',
  description: 'A simple task management app',
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
      <body>{children}</body>
    </html>
  )
}

