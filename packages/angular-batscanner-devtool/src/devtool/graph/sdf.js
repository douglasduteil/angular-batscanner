//

const dis = 20

export function polylinearRangeFromDomains (options) {
  const [min, max] = options.range
  const offset = 0 // (options.offset || dis) / 2
  const seriesDistances = options.domains.map(([dMin, dMax]) => dMin - dMax)

  const totalSerieDistance = seriesDistances
    .reduce((memo, domainLenght) => memo + domainLenght, 0)

  const middleRanges = seriesDistances.slice(0, -1)
    .reduce((memo, domainLenght, i) => {
      const last = memo[memo.length - 1] || 0
      const pos = last + (max * (domainLenght / totalSerieDistance))
      memo.push(pos - offset)
      memo.push(pos + offset)
      return memo
    }, [])

  return []
    .concat([min])
    .concat(middleRanges)
    .concat([max])
}
