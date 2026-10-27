export function dimensionValidationMessages(dimension: {
  name: string
  minLabel: string
  maxLabel: string
}) {
  const missing = [
    !dimension.name.trim() && 'a name',
    !dimension.minLabel.trim() && 'a low end label',
    !dimension.maxLabel.trim() && 'a high end label',
  ].filter((field): field is string => !!field)
  return missing.length
    ? [
        `Enter ${new Intl.ListFormat('en', { type: 'conjunction' }).format(missing)}.`,
      ]
    : []
}

export function archetypeValidationMessages(archetype: { name: string }) {
  return archetype.name.trim() ? [] : ['Enter a name.']
}
