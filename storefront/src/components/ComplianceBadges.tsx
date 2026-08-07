'use client'

import { ShieldCheck, AlertTriangle, FileCheck, Globe, Lock, Info } from 'lucide-react'
import { useState } from 'react'

interface ComplianceInfo {
  hsCode?: string
  eccn?: string
  certifications?: string[]
  restrictedCountries?: string[]
  originCountry?: string
}

// Certification display info
const CERT_INFO: Record<string, { label: string; color: string; desc: string }> = {
  FCC: { label: 'FCC', color: 'bg-blue-100 text-blue-700 border-blue-200', desc: 'Federal Communications Commission (USA)' },
  CE: { label: 'CE', color: 'bg-green-100 text-green-700 border-green-200', desc: 'Conformité Européenne (EU)' },
  UL: { label: 'UL', color: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Underwriters Laboratories' },
  RoHS: { label: 'RoHS', color: 'bg-teal-100 text-teal-700 border-teal-200', desc: 'Restriction of Hazardous Substances' },
  KC: { label: 'KC', color: 'bg-red-100 text-red-700 border-red-200', desc: 'Korea Certification' },
  MIC: { label: 'MIC', color: 'bg-orange-100 text-orange-700 border-orange-200', desc: 'Ministry of Internal Affairs (Japan)' },
  CCC: { label: 'CCC', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', desc: 'China Compulsory Certification' },
  ISO9001: { label: 'ISO 9001', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', desc: 'Quality Management System' },
}

// ECCN descriptions
const ECCN_INFO: Record<string, { category: string; reason: string; desc: string }> = {
  '7A994': { category: 'Electronics', reason: 'Civil', desc: 'Commercial drone electronics - no license required for most destinations' },
  '9A991': { category: 'Aircraft', reason: 'Civil', desc: 'Civilian aircraft/drones - no license required for most destinations' },
  '9A012': { category: 'Aircraft/Military', reason: 'Dual-use', desc: 'Drones with autonomous capability - license required for certain destinations' },
  '9A610': { category: 'Military UAV', reason: 'Military', desc: 'Military UAVs - strict export controls, license required' },
  'EAR99': { category: 'General', reason: 'Civil', desc: 'General commercial items - no license required for most destinations' },
  '8A992': { category: 'Avionics', reason: 'Civil', desc: 'Civilian avionics - no license required for most destinations' },
}

export default function ComplianceBadges({ info }: { info: ComplianceInfo }) {
  const [showDetails, setShowDetails] = useState(false)
  const certs = info.certifications || []

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-green-600" />
          <span className="font-semibold text-gray-900">Compliance & Export Info</span>
        </div>
        <div className="flex items-center gap-2">
          {certs.slice(0, 3).map(cert => (
            <span key={cert} className={`px-2 py-0.5 rounded text-xs font-bold border ${CERT_INFO[cert]?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {CERT_INFO[cert]?.label || cert}
            </span>
          ))}
          {info.eccn && (
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
              info.eccn === '9A610' ? 'bg-red-100 text-red-700 border-red-200' :
              info.eccn === '9A012' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              'bg-green-100 text-green-700 border-green-200'
            }`}>
              ECCN: {info.eccn}
            </span>
          )}
        </div>
      </button>

      {showDetails && (
        <div className="p-4 space-y-4 bg-white">
          {/* HS Code */}
          {info.hsCode && (
            <div className="flex items-start gap-3">
              <FileCheck size={18} className="text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">HS Code: {info.hsCode}</div>
                <div className="text-xs text-gray-500">Harmonized System code for customs declaration</div>
              </div>
            </div>
          )}

          {/* ECCN */}
          {info.eccn && ECCN_INFO[info.eccn] && (
            <div className="flex items-start gap-3">
              <Lock size={18} className={info.eccn === '9A610' ? 'text-red-600' : info.eccn === '9A012' ? 'text-orange-600' : 'text-green-600'} />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  ECCN: {info.eccn} - {ECCN_INFO[info.eccn].category}
                </div>
                <div className="text-xs text-gray-500">{ECCN_INFO[info.eccn].desc}</div>
                {(info.eccn === '9A012' || info.eccn === '9A610') && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-orange-600">
                    <AlertTriangle size={12} />
                    Export license may be required for certain destinations
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">Certifications</div>
              <div className="flex flex-wrap gap-2">
                {certs.map(cert => (
                  <div
                    key={cert}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${CERT_INFO[cert]?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                    title={CERT_INFO[cert]?.desc}
                  >
                    {CERT_INFO[cert]?.label || cert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Origin */}
          {info.originCountry && (
            <div className="flex items-start gap-3">
              <Globe size={18} className="text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Country of Origin: {info.originCountry}</div>
                <div className="text-xs text-gray-500">Manufactured in {info.originCountry}</div>
              </div>
            </div>
          )}

          {/* Compliance note */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Info size={16} className="text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700">
              It is the buyer's responsibility to ensure compliance with import regulations, licensing requirements, and applicable laws in their country. Aegisky provides compliance documentation with all orders.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to infer compliance info from product data
export function inferCompliance(product: {
  name: string
  category?: string
  attributes?: Record<string, string>
  brand?: string
}): ComplianceInfo {
  const name = String(product.name || '').toLowerCase()
  const category = String(product.category || '').toLowerCase()
  const attrs = product.attributes || {}

  // Determine HS code
  let hsCode = '8806.10' // Default: drones
  if (name.includes('motor') || name.includes('esc')) hsCode = '8501.31'
  else if (name.includes('battery') || name.includes('lipo')) hsCode = '8507.60'
  else if (name.includes('propeller') || name.includes('blade')) hsCode = '8806.90'
  else if (name.includes('camera') || name.includes('fpv camera')) hsCode = '8525.80'
  else if (name.includes('vtx') || name.includes('video transmit')) hsCode = '8525.60'
  else if (name.includes('flight controller') || name.includes('fc')) hsCode = '8542.31'
  else if (name.includes('receiver') || name.includes('transmitter') || name.includes('radio')) hsCode = '8526.92'
  else if (name.includes('gps')) hsCode = '8526.91'
  else if (name.includes('frame') || name.includes('arm')) hsCode = '8806.90'
  else if (name.includes('goggle') || name.includes('monitor')) hsCode = '8528.59'
  else if (name.includes('charger')) hsCode = '8504.40'
  else if (name.includes('gimbal')) hsCode = '8525.80'
  else if (name.includes('lidar') || name.includes('thermal')) hsCode = '9031.80'

  // Determine ECCN
  let eccn = 'EAR99'
  if (name.includes('industrial') || name.includes('mapping') || name.includes('inspection')) eccn = '9A012'
  else if (name.includes('military') || name.includes('defense') || name.includes('weapon')) eccn = '9A610'
  else if (name.includes('drone') || name.includes('quadcopter') || name.includes('uav')) eccn = '9A991'
  else if (name.includes('flight controller') || name.includes('autopilot')) eccn = '7A994'

  // Certifications - based on product type
  const certifications: string[] = []
  if (name.includes('drone') || name.includes('quadcopter') || name.includes('uav') || name.includes('camera')) {
    certifications.push('FCC', 'CE', 'RoHS')
  }
  if (name.includes('battery') || name.includes('charger') || name.includes('power')) {
    certifications.push('CE', 'UL', 'RoHS')
  }
  if (name.includes('radio') || name.includes('transmitter') || name.includes('receiver') || name.includes('vtx')) {
    certifications.push('FCC', 'CE')
  }
  if (name.includes('motor') || name.includes('esc')) {
    certifications.push('CE', 'RoHS')
  }
  if (certifications.length === 0) {
    certifications.push('CE', 'RoHS')
  }

  return {
    hsCode,
    eccn,
    certifications,
    originCountry: 'China',
  }
}
