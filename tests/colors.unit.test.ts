import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contrastAPCA } from 'colorjs.io/fn'
import {
  COLOR_THEME,
  COLOR_THEMES,
  getBarGradient,
  getBadgeAppearance,
  getScalePreview,
  getColorName,
  getColorTheme,
  getUnusedColorTheme,
  getContrastText,
  getBadgeTextColor,
  getColorSurface,
  storedColorSchema,
} from '../lib/colors'
import { dimensionInput } from '../lib/editor-schemas'
import { quizDetailsSchema } from '../lib/quiz-details'

test('color storage canonicalizes opaque hex and rejects names, alpha and invalid input', () => {
  for (const schema of [
    storedColorSchema,
    quizDetailsSchema.shape.color,
    dimensionInput.shape.color,
  ]) {
    assert.equal(schema.parse('#AbC'), '#aabbcc')
    assert.equal(schema.parse('#ABCDEF'), '#abcdef')
    assert.equal(schema.parse(null), null)
    assert.equal(schema.parse(undefined), undefined)
    for (const invalid of [
      'purple',
      '#1234',
      '#12345678',
      'transparent',
      'rgb(0,0,0)',
      '#xyz',
      '#12345',
    ])
      assert.equal(schema.safeParse(invalid).success, false, invalid)
  }
})
test('friendly names stay in the UI and custom colors retain their actual values', () => {
  assert.equal(getColorName('#8B5CF6'), 'Purple')
  assert.equal(getColorName('#123456'), '#123456')
  assert.equal(getColorTheme('#123456').hex, '#123456')
  assert.equal(getColorTheme(null).hex, COLOR_THEME[0].hex)
  assert.equal(getUnusedColorTheme(['#3B82F6']).hex, COLOR_THEME[1].hex)
})
test('perceptual contrast chooses light text for saturated midtones and dark text for bright colors', () => {
  assert.equal(getContrastText('#ffffff'), '#000000')
  assert.equal(getContrastText('#000000'), '#ffffff')
  for (const color of ['#3b82f6', '#8b5cf6', '#ec4899'])
    assert.equal(getContrastText(color), '#ffffff')
  for (const color of ['#14b8a6', '#22c55e', '#f59e42'])
    assert.equal(getContrastText(color), '#000000')
  for (const background of [
    ...COLOR_THEME.map((color) => color.hex),
    '#123456',
    '#ffff00',
    '#777777',
  ]) {
    const ink = getContrastText(background)
    assert.ok(
      Math.abs(contrastAPCA(background, ink)) >=
        Math.abs(
          contrastAPCA(background, ink === '#000000' ? '#ffffff' : '#000000'),
        ),
    )
  }
  assert.equal(getBadgeTextColor('#000000'), '#ffffff')
  assert.equal(getBadgeTextColor('#ffffff'), '#000000')
})

test('surface shading stays subtle, preserves hue endpoints and checks all contrast stops', () => {
  for (const hex of [
    ...COLOR_THEME.map((color) => color.hex),
    '#123456',
    '#ffffff',
    '#000000',
  ]) {
    const surface = getColorSurface(hex)
    assert.match(surface.background, /^linear-gradient\(135deg,/)
    assert.equal(surface.stops[1], hex)
    assert.equal(getColorTheme(hex).hex, hex)
    assert.equal(surface.textColor, getContrastText(surface.stops))
    assert.equal(surface.background.includes('linear-gradient', 1), false)
  }
})

test('curated themes normalize and retain every color while custom multi-color input is deferred', () => {
  for (const theme of COLOR_THEMES) {
    const value = theme.colors.join(',')
    for (const schema of [
      storedColorSchema,
      quizDetailsSchema.shape.color,
      dimensionInput.shape.color,
    ]) {
      assert.equal(
        schema.parse(
          theme.colors.map((color) => color.toUpperCase()).join(', '),
        ),
        value,
      )
      assert.equal(schema.safeParse('#ffffff,#000000').success, false)
      assert.equal(schema.safeParse('#123456,#abcdef,#987654').success, false)
    }
    const resolved = getColorTheme(value)
    assert.equal(resolved.value, value)
    assert.deepEqual(resolved.colors, [...theme.colors])
    assert.equal(resolved.label, theme.label)
    assert.equal(getColorName(value), theme.label)
    assert.equal(
      getBarGradient(value),
      `linear-gradient(90deg, ${theme.colors.join(', ')})`,
    )
    const surface = getColorSurface(value)
    theme.colors.forEach((color) =>
      assert.ok(surface.background.includes(color)),
    )
    assert.equal(surface.textColor, getContrastText(surface.stops))
    const badge = getBadgeAppearance(value)
    assert.equal(badge.themed, true)
    assert.equal(badge.primary, theme.colors[0])
    assert.equal(badge.accent, theme.colors[1])
    assert.notEqual(badge.border, '#ffffff')
    assert.notEqual(badge.texture, badge.primary)
    assert.ok(getScalePreview(value, 'ascending').includes(theme.colors[1]))
    assert.ok(
      getScalePreview(value, 'descending').indexOf(theme.colors[1]) <
        getScalePreview(value, 'descending').indexOf(theme.colors[0]),
    )
  }
  assert.equal(getColorName('#3b82f6,#ec4899'), 'Blue/Pink')
  assert.equal(getColorName('#123456,#abcdef'), '#123456/#ABCDEF')
  assert.equal(getColorTheme('#123456,#abcdef,#987654').colors.length, 3)
  assert.equal(getBadgeAppearance('#123456').themed, false)
})
