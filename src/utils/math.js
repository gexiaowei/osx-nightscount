export function standardDeviation (arr, usePopulation = false) {
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length
  return Math.sqrt(
    arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) /
    (arr.length - (usePopulation ? 0 : 1))
  )
}

export function mean (arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}
