'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print fixed top-5 right-5 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
    >
      🖨️ Save as PDF / Print
    </button>
  )
}
