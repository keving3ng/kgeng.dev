import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

// Common units and their variations
const UNITS = [
  'cups?', 'c\\.?',
  'tablespoons?', 'tbsps?\\.?', 'tbl\\.?', 'T',
  'teaspoons?', 'tsps?\\.?', 't',
  'ounces?', 'oz\\.?',
  'pounds?', 'lbs?\\.?',
  'grams?', 'g\\.?',
  'kilograms?', 'kg\\.?',
  'milligrams?', 'mg\\.?',
  'milliliters?', 'ml\\.?',
  'liters?', 'l\\.?',
  'pints?', 'pt\\.?',
  'quarts?', 'qt\\.?',
  'gallons?', 'gal\\.?',
  'pinch(?:es)?',
  'dash(?:es)?',
  'cloves?',
  'cans?',
  'bunche?s?',
  'heads?',
  'stalks?',
  'slices?',
  'pieces?',
  'sprigs?',
  'strips?',
  'packages?', 'pkgs?\\.?',
  'sticks?',
]

const UNIT_PATTERN = UNITS.join('|')

// Abbreviation map for display
const UNIT_ABBREV: Record<string, string> = {
  cup: 'cup', cups: 'cups',
  tablespoon: 'tbsp', tablespoons: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp',
  ounce: 'oz', ounces: 'oz',
  pound: 'lb', pounds: 'lb',
  gram: 'g', grams: 'g',
  kilogram: 'kg', kilograms: 'kg',
  milligram: 'mg', milligrams: 'mg',
  milliliter: 'ml', milliliters: 'ml',
  liter: 'L', liters: 'L',
  pint: 'pt', pints: 'pt',
  quart: 'qt', quarts: 'qt',
  gallon: 'gal', gallons: 'gal',
  package: 'pkg', packages: 'pkg',
}

function abbreviateUnit(unit: string): string {
  const lower = unit.toLowerCase().replace(/\.$/, '')
  return UNIT_ABBREV[lower] || unit
}

// Words to never annotate (common cooking terms that appear in ingredient names)
const STOPWORDS = new Set([
  'brown',      // "brown the butter"
  'baking',     // "baking sheet"
  'large',      // size descriptor
  'medium',     // size descriptor
  'small',      // size descriptor
  'fresh',      // prep descriptor
  'dried',      // prep descriptor
  'chopped',    // prep descriptor
  'minced',     // prep descriptor
  'diced',      // prep descriptor
  'whole',      // descriptor
  'warm',       // temperature
  'cold',       // temperature
  'hot',        // temperature
  'room',       // "room temperature"
  'melted',     // prep state
  'softened',   // prep state
  'beaten',     // prep state
])

// Unicode fractions
const UNICODE_FRACTIONS = '[½⅓⅔¼¾⅛⅜⅝⅞]'

// Match quantities: numbers, fractions (unicode and slash), ranges, mixed numbers (e.g., "1 ½")
const QUANTITY_PATTERN = `(?:\\d+\\s*[-–—to]+\\s*)?(?:\\d+\\s+${UNICODE_FRACTIONS}|${UNICODE_FRACTIONS}|\\d+\\/\\d+|\\d+\\.\\d+|\\d+)(?:\\s*[-–—]\\s*(?:\\d+\\s+${UNICODE_FRACTIONS}|${UNICODE_FRACTIONS}|\\d+\\/\\d+|\\d+\\.\\d+|\\d+))?`

// Full ingredient line pattern
const INGREDIENT_REGEX = new RegExp(
  `^\\s*(${QUANTITY_PATTERN})\\s*(${UNIT_PATTERN})?\\s*\\.?\\s*(.+?)\\s*$`,
  'i'
)

interface ParsedIngredient {
  original: string
  quantity: string
  unit: string
  name: string
  normalizedName: string
}

function parseIngredientLine(line: string): ParsedIngredient | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length < 2) return null

  // Skip section headers (lines ending with ":" that don't start with a number)
  if (/^[^0-9½⅓⅔¼¾⅛⅜⅝⅞].*:$/.test(trimmed)) return null

  const match = trimmed.match(INGREDIENT_REGEX)
  if (match) {
    const [, quantity, unit, name] = match
    return {
      original: trimmed,
      quantity: quantity?.trim() || '',
      unit: unit?.trim() || '',
      name: name?.trim() || '',
      normalizedName: normalizeIngredientName(name?.trim() || ''),
    }
  }

  // Fallback: treat whole line as ingredient name (no quantity detected)
  return {
    original: trimmed,
    quantity: '',
    unit: '',
    name: trimmed,
    normalizedName: normalizeIngredientName(trimmed),
  }
}

function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/,.*$/, '') // Remove everything after comma (prep instructions)
    .replace(/\(.*?\)/g, '') // Remove parentheticals
    .replace(/\s+/g, ' ')
    .trim()
}

// Get searchable variants of an ingredient name
function getIngredientVariants(name: string): string[] {
  const normalized = normalizeIngredientName(name)
  const variants = [normalized]

  // Add singular/plural variants
  if (normalized.endsWith('es')) {
    variants.push(normalized.slice(0, -2))
  } else if (normalized.endsWith('s')) {
    variants.push(normalized.slice(0, -1))
  } else {
    variants.push(normalized + 's')
  }

  // Split compound ingredients and add parts (but filter out stopwords)
  const words = normalized.split(' ')
  if (words.length > 1) {
    words.forEach(word => {
      if (word.length > 3 && !STOPWORDS.has(word)) {
        variants.push(word)
      }
    })
  }

  // Filter out stopwords from all variants
  return [...new Set(variants)].filter(v => !STOPWORDS.has(v))
}

function annotateInstructions(
  instructions: string,
  ingredients: ParsedIngredient[]
): string {
  let result = instructions

  // Sort ingredients by name length (longest first) to avoid partial matches
  const sortedIngredients = [...ingredients]
    .filter(ing => ing.name && ing.quantity)
    .sort((a, b) => b.normalizedName.length - a.normalizedName.length)

  // Track what we've already annotated to avoid duplicates
  const annotated = new Set<string>()

  for (const ingredient of sortedIngredients) {
    const variants = getIngredientVariants(ingredient.name)

    for (const variant of variants) {
      if (variant.length < 3 || annotated.has(variant)) continue

      // Create regex that matches the variant as a whole word
      const regex = new RegExp(`\\b(${escapeRegex(variant)})\\b`, 'gi')

      result = result.replace(regex, (match) => {
        // Wrap ingredient name in << >> markers and quantity in [ ]
        const annotation = `<<${match}>> [${ingredient.quantity}${ingredient.unit ? ' ' + abbreviateUnit(ingredient.unit) : ''}]`
        annotated.add(variant)
        return annotation
      })
    }
  }

  return result
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function Recipeer() {
  const [recipeText, setRecipeText] = useState('')
  const [ingredientsSection, setIngredientsSection] = useState('')
  const [instructionsSection, setInstructionsSection] = useState('')
  const [mode, setMode] = useState<'paste' | 'manual'>('paste')

  // Auto-detect and split recipe sections
  const autoSplit = useMemo(() => {
    if (!recipeText.trim()) return { ingredients: '', instructions: '' }

    const text = recipeText.trim()
    const lines = text.split('\n')

    // Look for section headers
    const ingredientHeaderIndex = lines.findIndex(line =>
      /^(ingredients?:?|what you.ll need:?)$/i.test(line.trim())
    )
    const instructionHeaderIndex = lines.findIndex(line =>
      /^(instructions?:?|directions?:?|method:?|steps?:?|preparation:?)$/i.test(line.trim())
    )

    if (ingredientHeaderIndex !== -1 && instructionHeaderIndex !== -1) {
      const ingredientLines = lines.slice(
        ingredientHeaderIndex + 1,
        instructionHeaderIndex
      )
      const instructionLines = lines.slice(instructionHeaderIndex + 1)

      return {
        ingredients: ingredientLines.join('\n').trim(),
        instructions: instructionLines.join('\n').trim(),
      }
    }

    // Heuristic: lines starting with numbers/fractions are likely ingredients
    let lastIngredientIndex = -1
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (/^[\d½⅓⅔¼¾⅛⅜⅝⅞]/.test(line) || /^\d+\/\d+/.test(line)) {
        lastIngredientIndex = i
      }
    }

    if (lastIngredientIndex > 0) {
      return {
        ingredients: lines.slice(0, lastIngredientIndex + 1).join('\n').trim(),
        instructions: lines.slice(lastIngredientIndex + 1).join('\n').trim(),
      }
    }

    return { ingredients: '', instructions: text }
  }, [recipeText])

  const effectiveIngredients = mode === 'paste' ? autoSplit.ingredients : ingredientsSection
  const effectiveInstructions = mode === 'paste' ? autoSplit.instructions : instructionsSection

  const parsedIngredients = useMemo(() => {
    return effectiveIngredients
      .split('\n')
      .map(parseIngredientLine)
      .filter((ing): ing is ParsedIngredient => ing !== null && ing.name.length > 0)
  }, [effectiveIngredients])

  const annotatedInstructions = useMemo(() => {
    if (!effectiveInstructions || parsedIngredients.length === 0) {
      return effectiveInstructions
    }
    return annotateInstructions(effectiveInstructions, parsedIngredients)
  }, [effectiveInstructions, parsedIngredients])

  const clearAll = () => {
    setRecipeText('')
    setIngredientsSection('')
    setInstructionsSection('')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          ← back
        </Link>

        <h1 className="text-2xl font-medium mb-2 text-gray-900 dark:text-gray-100">
          recipeer
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          paste a recipe and see quantities next to ingredients in the instructions.
        </p>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="radio"
              checked={mode === 'paste'}
              onChange={() => setMode('paste')}
              className="accent-gray-600"
            />
            paste full recipe
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="radio"
              checked={mode === 'manual'}
              onChange={() => setMode('manual')}
              className="accent-gray-600"
            />
            separate sections
          </label>
        </div>

        {/* Input Section */}
        {mode === 'paste' ? (
          <section className="mb-8">
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              paste recipe
            </label>
            <textarea
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Paste your full recipe here..."
              className="w-full h-64 text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-y font-mono"
            />
          </section>
        ) : (
          <section className="mb-8 space-y-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                ingredients (one per line)
              </label>
              <textarea
                value={ingredientsSection}
                onChange={(e) => setIngredientsSection(e.target.value)}
                placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs"
                className="w-full h-40 text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-y font-mono"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                instructions
              </label>
              <textarea
                value={instructionsSection}
                onChange={(e) => setInstructionsSection(e.target.value)}
                placeholder="Mix the flour and salt together..."
                className="w-full h-40 text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-y font-mono"
              />
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 my-6" />

        {/* Parsed Ingredients */}
        {parsedIngredients.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              parsed ingredients ({parsedIngredients.length})
            </h2>
            <div className="space-y-1">
              {parsedIngredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 text-sm py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <span className="text-gray-400 dark:text-gray-500 w-20 text-right shrink-0">
                    {ing.quantity} {abbreviateUnit(ing.unit)}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {ing.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Divider */}
        {annotatedInstructions && (
          <div className="border-t border-gray-200 dark:border-gray-800 my-6" />
        )}

        {/* Annotated Instructions */}
        {annotatedInstructions && (
          <section className="mb-8">
            <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              annotated instructions
            </h2>
            <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed space-y-4">
              {annotatedInstructions.split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                <p key={lineIdx}>
                  {line.split(/(<<[^>]+>>|\[[^\]]+\])/g).map((part, idx) => {
                    if (part.startsWith('<<') && part.endsWith('>>')) {
                      // Ingredient name - amber/orange color
                      return (
                        <span
                          key={idx}
                          className="text-amber-600 dark:text-amber-400 font-medium"
                        >
                          {part.slice(2, -2)}
                        </span>
                      )
                    } else if (part.startsWith('[') && part.endsWith(']')) {
                      // Quantity - blue color
                      return (
                        <span
                          key={idx}
                          className="text-blue-600 dark:text-blue-400 text-xs"
                        >
                          {part}
                        </span>
                      )
                    }
                    return <span key={idx}>{part}</span>
                  })}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Clear button */}
        <button
          onClick={clearAll}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          clear all
        </button>
      </div>
    </div>
  )
}

export default Recipeer
