export function convertUnits (value, unit) {
  switch (unit) {
    case 'mmol':
      return +(value * 0.0555).toFixed(1)
    case 'mg/dl':
      return +(value * 18.018).toFixed(0)
    default:
      return value
  }
}

export function convertUnitsForString (value, unit) {
  switch (unit) {
    case 'mmol':
      return (value * 0.0555).toFixed(1)
    case 'mg/dl':
      return (value * 18.018).toFixed(0)
    default:
      return value
  }
}

export function sgvToUnit (value, unit) {
  switch (unit) {
    case 'mmol':
      return +(value * 0.0555).toFixed(1)
    case 'mg/dl':
      return +value.toFixed(0)
    default:
      return value
  }
}

export function sgvToUnitString (value, unit) {
  switch (unit) {
    case 'mmol':
      return (value * 0.0555).toFixed(1)
    case 'mg/dl':
      return value.toFixed(0)
    default:
      return value
  }
}

export function toSgv (value, unit) {
  switch (unit) {
    case 'mmol':
      return +(value * 18.018).toFixed(0)
    default:
      return value
  }
}

export function getUnitLabel (unit) {
  return {
    mmol: 'mmol/L',
    'mg/dl': 'mg/dL'
  }[unit] || ''
}
