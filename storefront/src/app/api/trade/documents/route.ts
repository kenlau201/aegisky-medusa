import { NextRequest, NextResponse } from 'next/server'
import { pool, getPO, generateDocNumber } from '@/lib/trade-engine/db'
import { TRADE_DOC_TYPES } from '@/lib/trade-engine/constants'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const { searchParams } = new URL(request.url)
    const poId = searchParams.get('po_id')

    let query = 'SELECT * FROM te_trade_documents WHERE tenant_id = $1'
    const params: any[] = [tenantId]
    if (poId) {
      params.push(poId)
      query += ` AND po_id = $${params.length}`
    }
    query += ' ORDER BY document_date DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ documents: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()
    const { po_id, doc_type } = body

    const po = await getPO(po_id)
    if (!po) return NextResponse.json({ error: 'PO not found' }, { status: 404 })

    const docNumber = generateDocNumber(doc_type)
    let content: any = {}

    switch (doc_type) {
      case 'CI': // Commercial Invoice
        content = generateCommercialInvoice(po, docNumber)
        break
      case 'PL': // Packing List
        content = generatePackingList(po, docNumber)
        break
      case 'CO': // Certificate of Origin
        content = generateCertificateOfOrigin(po, docNumber)
        break
      default:
        content = { po_number: po.po_number, doc_number: docNumber }
    }

    const result = await pool.query(
      `INSERT INTO te_trade_documents
       (tenant_id, po_id, doc_type, doc_number, document_date, content_json, status)
       VALUES ($1, $2, $3, $4, NOW(), $5, 'GENERATED')
       RETURNING *`,
      [tenantId, po_id, doc_type, docNumber, JSON.stringify(content)]
    )

    return NextResponse.json({ document: result.rows[0], content }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ==================== 单据生成器 ====================

function generateCommercialInvoice(po: any, docNumber: string) {
  const today = new Date().toISOString().split('T')[0]
  return {
    header: {
      title: 'COMMERCIAL INVOICE',
      invoice_number: docNumber,
      invoice_date: today,
      po_number: po.po_number,
      payment_terms: po.payment_terms,
      incoterm: po.incoterm,
      currency: po.currency,
    },
    shipper: {
      company: po.supplier_name,
      country: po.supplier_country,
    },
    consignee: {
      company: po.buyer_name,
      country: po.buyer_country,
    },
    shipping: {
      method: po.shipping_method,
      from: po.origin_port,
      to: po.destination_port,
      etd: po.expected_ship_date,
      eta: po.expected_delivery_date,
    },
    line_items: po.line_items.map((item: any) => ({
      description: item.product_name,
      hs_code: item.hs_code,
      eccn: item.eccn_code,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      amount: item.line_total,
      country_of_origin: po.supplier_country,
    })),
    totals: {
      subtotal: po.subtotal,
      shipping: po.shipping_cost,
      insurance: po.insurance_cost,
      tax: po.tax_amount,
      total: po.total_amount,
      deposit: po.deposit_amount,
      balance_due: po.total_amount - po.deposit_amount,
    },
    declaration: 'We hereby certify that the above mentioned goods are of Chinese Origin and that all particulars stated herein are true and correct.',
    bank_details: {
      note: 'Bank details will be provided upon confirmation',
    },
  }
}

function generatePackingList(po: any, docNumber: string) {
  const today = new Date().toISOString().split('T')[0]
  let totalPackages = 0
  let totalWeight = 0
  let totalVolume = 0

  const packages = po.line_items.map((item: any) => {
    // 估算包装
    const qty = item.quantity
    const unitsPerCarton = item.product_name?.toLowerCase().includes('motor') ? 20 :
                          item.product_name?.toLowerCase().includes('drone') ? 2 : 10
    const cartons = Math.ceil(qty / unitsPerCarton)
    const weightPerCarton = item.product_name?.toLowerCase().includes('drone') ? 8 : 2
    const totalCartonWeight = cartons * weightPerCarton
    const cbmPerCarton = 0.05
    const totalCbm = cartons * cbmPerCarton

    totalPackages += cartons
    totalWeight += totalCartonWeight
    totalVolume += totalCbm

    return {
      description: item.product_name,
      quantity: qty,
      packages: cartons,
      net_weight_kg: totalCartonWeight * 0.85,
      gross_weight_kg: totalCartonWeight,
      cbm: totalCbm,
      package_type: 'Carton',
      marks_and_numbers: `${po.po_number}\n${po.buyer_name}\nC/NO: 1-${cartons}\nMADE IN ${po.supplier_country}`,
    }
  })

  return {
    header: {
      title: 'PACKING LIST',
      document_number: docNumber,
      date: today,
      po_number: po.po_number,
    },
    shipper: { company: po.supplier_name, country: po.supplier_country },
    consignee: { company: po.buyer_name, country: po.buyer_country },
    packages,
    totals: {
      total_packages: totalPackages,
      total_net_weight_kg: Math.round(totalWeight * 0.85 * 100) / 100,
      total_gross_weight_kg: Math.round(totalWeight * 100) / 100,
      total_volume_cbm: Math.round(totalVolume * 1000) / 1000,
    },
    container_info: {
      note: 'Container details will be provided upon loading',
    },
  }
}

function generateCertificateOfOrigin(po: any, docNumber: string) {
  const today = new Date().toISOString().split('T')[0]
  return {
    header: {
      title: 'CERTIFICATE OF ORIGIN',
      certificate_number: docNumber,
      date: today,
    },
    exporter: {
      name: po.supplier_name,
      country: po.supplier_country,
    },
    importer: {
      name: po.buyer_name,
      country: po.buyer_country,
    },
    transport: {
      method: po.shipping_method,
      from: po.origin_port,
      to: po.destination_port,
    },
    goods: po.line_items.map((item: any) => ({
      description: item.product_name,
      hs_code: item.hs_code,
      quantity: item.quantity,
      criterion: 'WO', // Wholly obtained
      country_of_origin: po.supplier_country,
    })),
    declaration: 'The undersigned hereby declares that the above details and statements are correct; that all the goods were produced in the country shown as country of origin and that they comply with the origin requirements specified for these goods.',
    certification: 'It is hereby certified, on the basis of control carried out, that the declaration by the exporter is correct.',
  }
}
