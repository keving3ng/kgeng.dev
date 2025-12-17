import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'

const PEOPLE = ['A', 'B', 'C', 'D', 'E']

interface Item {
  id: number
  description: string
  cost: string
  selectedPeople: string[]
}

function Splits() {
  const [items, setItems] = useState<Item[]>([
    { id: 0, description: '', cost: '', selectedPeople: PEOPLE.slice(0, 5) }
  ])
  const [nextId, setNextId] = useState(1)
  const [defaultPeopleCount, setDefaultPeopleCount] = useState(5)
  const [taxAmount, setTaxAmount] = useState('')
  const [taxPercent, setTaxPercent] = useState('')
  const [tipAmount, setTipAmount] = useState('')
  const [tipPercent, setTipPercent] = useState('')
  const [taxMode, setTaxMode] = useState<'percent' | 'amount'>('percent')
  const [tipMode, setTipMode] = useState<'percent' | 'amount'>('percent')
  const [splitMethod, setSplitMethod] = useState<'proportional' | 'even'>('proportional')

  const activePeople = PEOPLE.slice(0, defaultPeopleCount)

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => {
      const cost = parseFloat(item.cost) || 0
      return sum + cost
    }, 0)
  }, [items])

  const updateTaxFromPercent = useCallback((percent: string, subtotal: number) => {
    const p = parseFloat(percent) || 0
    const amount = subtotal * p / 100
    setTaxPercent(percent)
    setTaxAmount(amount > 0 ? amount.toFixed(2) : '')
  }, [])

  const updateTaxFromAmount = useCallback((amount: string, subtotal: number) => {
    const a = parseFloat(amount) || 0
    setTaxAmount(amount)
    if (subtotal > 0) {
      const percent = a / subtotal * 100
      setTaxPercent(percent > 0 ? percent.toFixed(1) : '')
    }
  }, [])

  const updateTipFromPercent = useCallback((percent: string, subtotal: number) => {
    const p = parseFloat(percent) || 0
    const amount = subtotal * p / 100
    setTipPercent(percent)
    setTipAmount(amount > 0 ? amount.toFixed(2) : '')
  }, [])

  const updateTipFromAmount = useCallback((amount: string, subtotal: number) => {
    const a = parseFloat(amount) || 0
    setTipAmount(amount)
    if (subtotal > 0) {
      const percent = a / subtotal * 100
      setTipPercent(percent > 0 ? percent.toFixed(1) : '')
    }
  }, [])

  const handleTaxPercentChange = (value: string) => {
    setTaxMode('percent')
    updateTaxFromPercent(value, getSubtotal())
  }

  const handleTaxAmountChange = (value: string) => {
    setTaxMode('amount')
    updateTaxFromAmount(value, getSubtotal())
  }

  const handleTipPercentChange = (value: string) => {
    setTipMode('percent')
    updateTipFromPercent(value, getSubtotal())
  }

  const handleTipAmountChange = (value: string) => {
    setTipMode('amount')
    updateTipFromAmount(value, getSubtotal())
  }

  const recalculateTaxTip = useCallback((newItems: Item[]) => {
    const subtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0)

    if (taxMode === 'percent' && taxPercent) {
      const p = parseFloat(taxPercent) || 0
      const amount = subtotal * p / 100
      setTaxAmount(amount > 0 ? amount.toFixed(2) : '')
    }

    if (tipMode === 'percent' && tipPercent) {
      const p = parseFloat(tipPercent) || 0
      const amount = subtotal * p / 100
      setTipAmount(amount > 0 ? amount.toFixed(2) : '')
    }
  }, [taxMode, taxPercent, tipMode, tipPercent])

  const addItem = () => {
    const newItem: Item = {
      id: nextId,
      description: '',
      cost: '',
      selectedPeople: activePeople.slice()
    }
    setItems([...items, newItem])
    setNextId(nextId + 1)
  }

  const removeItem = (id: number) => {
    const newItems = items.filter(item => item.id !== id)
    setItems(newItems)
    recalculateTaxTip(newItems)
  }

  const updateItem = (id: number, field: keyof Item, value: string | string[]) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    setItems(newItems)
    if (field === 'cost') {
      recalculateTaxTip(newItems)
    }
  }

  const togglePerson = (itemId: number, person: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const newSelected = item.selectedPeople.includes(person)
      ? item.selectedPeople.filter(p => p !== person)
      : [...item.selectedPeople, person]

    updateItem(itemId, 'selectedPeople', newSelected)
  }

  const handleDefaultPeopleChange = (count: number) => {
    setDefaultPeopleCount(count)
    const newActivePeople = PEOPLE.slice(0, count)

    setItems(items.map(item => ({
      ...item,
      selectedPeople: item.selectedPeople.filter(p => newActivePeople.includes(p))
    })))
  }

  const clearAll = () => {
    setItems([{ id: 0, description: '', cost: '', selectedPeople: activePeople.slice() }])
    setNextId(1)
    setTaxAmount('')
    setTaxPercent('')
    setTipAmount('')
    setTipPercent('')
  }

  // Calculate summary
  const subtotal = getSubtotal()
  const tax = parseFloat(taxAmount) || 0
  const tip = parseFloat(tipAmount) || 0
  const grandTotal = subtotal + tax + tip

  const validItems = items.filter(item => {
    const cost = parseFloat(item.cost) || 0
    return (item.description || cost > 0) && item.selectedPeople.length > 0
  })

  const personTotals: Record<string, number> = {}
  const personItems: Record<string, { description: string; share: number; sharedWith: number }[]> = {}

  PEOPLE.forEach(p => {
    personTotals[p] = 0
    personItems[p] = []
  })

  validItems.forEach(item => {
    const cost = parseFloat(item.cost) || 0
    const costPerPerson = cost / item.selectedPeople.length

    item.selectedPeople.forEach(p => {
      personTotals[p] += costPerPerson
      personItems[p].push({
        description: item.description || 'Unnamed item',
        share: costPerPerson,
        sharedWith: item.selectedPeople.length
      })
    })
  })

  const activePeopleWithItems = PEOPLE.filter(p => personItems[p].length > 0)

  const personExtras: Record<string, { tax: number; tip: number }> = {}

  if (splitMethod === 'proportional') {
    activePeopleWithItems.forEach(p => {
      const proportion = subtotal > 0 ? personTotals[p] / subtotal : 0
      personExtras[p] = {
        tax: tax * proportion,
        tip: tip * proportion
      }
    })
  } else {
    const evenTax = activePeopleWithItems.length > 0 ? tax / activePeopleWithItems.length : 0
    const evenTip = activePeopleWithItems.length > 0 ? tip / activePeopleWithItems.length : 0
    activePeopleWithItems.forEach(p => {
      personExtras[p] = { tax: evenTax, tip: evenTip }
    })
  }

  const personColors: Record<string, string> = {
    A: 'border-l-blue-500',
    B: 'border-l-green-500',
    C: 'border-l-yellow-500',
    D: 'border-l-red-500',
    E: 'border-l-purple-500'
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="splits"
          subtitle="i made this for my own use, so it's intentionally rigid. let me know if you'd like to request improvements."
        />

        {/* Items Section */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm text-content-muted">
              default split:
            </label>
            <select
              value={defaultPeopleCount}
              onChange={(e) => handleDefaultPeopleChange(parseInt(e.target.value))}
              className="text-sm px-2 py-1 border border-border rounded bg-surface text-content"
            >
              <option value={1}>1 person</option>
              <option value={2}>2 people (A, B)</option>
              <option value={3}>3 people (A, B, C)</option>
              <option value={4}>4 people (A, B, C, D)</option>
              <option value={5}>5 people (A, B, C, D, E)</option>
            </select>
          </div>

          <button
            onClick={addItem}
            className="text-sm text-content-muted hover:text-content-secondary mb-4 transition-colors"
          >
            + add item
          </button>

          {/* Header */}
          <div className="hidden md:grid grid-cols-[1fr_80px_140px_32px] gap-3 text-xs text-content-muted mb-2 px-1">
            <span>description</span>
            <span>cost</span>
            <span>split</span>
            <span></span>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_80px_140px_32px] gap-2 md:gap-3 items-center p-2 md:p-0"
              >
                <input
                  type="text"
                  placeholder="item"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="w-full text-sm px-2 py-1.5 border border-border rounded bg-surface text-content placeholder-content-muted"
                />
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={item.cost}
                  onChange={(e) => updateItem(item.id, 'cost', e.target.value)}
                  className="w-full text-sm px-2 py-1.5 border border-border rounded bg-surface text-content placeholder-content-muted"
                />
                <div className="flex gap-1 flex-wrap">
                  {activePeople.map((person) => (
                    <button
                      key={person}
                      onClick={() => togglePerson(item.id, person)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        item.selectedPeople.includes(person)
                          ? 'bg-border text-content'
                          : 'bg-surface-secondary text-content-muted'
                      }`}
                    >
                      {person}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-content-muted hover:text-content-secondary transition-colors text-lg justify-self-center md:justify-self-start"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Tax & Tip Section */}
        <section className="mb-8">
          <h2 className="text-sm text-content-muted mb-4">tax & tip</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-content-muted mb-1">tax</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={taxAmount}
                  onChange={(e) => handleTaxAmountChange(e.target.value)}
                  className="w-20 text-sm px-2 py-1.5 border border-border rounded bg-surface text-content placeholder-content-muted"
                />
                <span className="text-content-muted text-sm">or</span>
                <input
                  type="number"
                  placeholder="%"
                  step="0.1"
                  value={taxPercent}
                  onChange={(e) => handleTaxPercentChange(e.target.value)}
                  className="w-16 text-sm px-2 py-1.5 border border-border rounded bg-surface text-content placeholder-content-muted"
                />
                <span className="text-content-muted text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-content-muted mb-1">tip</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={tipAmount}
                  onChange={(e) => handleTipAmountChange(e.target.value)}
                  className="w-20 text-sm px-2 py-1.5 border border-border rounded bg-surface text-content placeholder-content-muted"
                />
                <span className="text-content-muted text-sm">or</span>
                <input
                  type="number"
                  placeholder="%"
                  step="0.1"
                  value={tipPercent}
                  onChange={(e) => handleTipPercentChange(e.target.value)}
                  className="w-16 text-sm px-2 py-1.5 border border-border rounded bg-surface text-content placeholder-content-muted"
                />
                <span className="text-content-muted text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs text-content-muted mb-2">
              split method for tax & tip
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-content-secondary cursor-pointer">
                <input
                  type="radio"
                  checked={splitMethod === 'proportional'}
                  onChange={() => setSplitMethod('proportional')}
                  className="accent-content-secondary"
                />
                proportional
              </label>
              <label className="flex items-center gap-2 text-sm text-content-secondary cursor-pointer">
                <input
                  type="radio"
                  checked={splitMethod === 'even'}
                  onChange={() => setSplitMethod('even')}
                  className="accent-content-secondary"
                />
                even
              </label>
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-content-muted">subtotal</span>
              <span className="ml-2 text-content">{subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-content-muted">tax</span>
              <span className="ml-2 text-content">{tax.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-content-muted">tip</span>
              <span className="ml-2 text-content">{tip.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-content-muted">total</span>
              <span className="ml-2 font-medium text-content">{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Summary Section */}
        <section className="mb-8">
          <h2 className="text-sm text-content-muted mb-4">summary</h2>

          {activePeopleWithItems.length === 0 ? (
            <p className="text-sm text-content-muted">
              add items above to see the split
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePeopleWithItems.map((person) => {
                const itemsTotal = personTotals[person]
                const extras = personExtras[person]
                const personTotal = itemsTotal + extras.tax + extras.tip

                return (
                  <div
                    key={person}
                    className={`p-4 bg-surface-secondary rounded border-l-4 ${personColors[person]}`}
                  >
                    <h3 className="font-medium text-content mb-3">
                      person {person}
                    </h3>

                    <div className="space-y-1 mb-3 text-xs">
                      {personItems[person].map((item, idx) => (
                        <div key={idx} className="flex justify-between text-content-muted">
                          <span>
                            {item.description}
                            {item.sharedWith > 1 && ` (÷${item.sharedWith})`}
                          </span>
                          <span>{item.share.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 text-xs text-content-muted border-t border-border pt-2">
                      <div className="flex justify-between">
                        <span>items</span>
                        <span>{itemsTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>tax</span>
                        <span>{extras.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>tip</span>
                        <span>{extras.tip.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between font-medium text-content border-t border-border pt-2 mt-2">
                      <span>total</span>
                      <span>{personTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Clear button */}
        <button
          onClick={clearAll}
          className="text-sm text-content-muted hover:text-content-secondary transition-colors"
        >
          clear all
        </button>
      </div>
    </div>
  )
}

export default Splits
