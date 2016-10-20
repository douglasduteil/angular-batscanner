//

import * as d3 from 'd3'

//

const dis = 20

export function polylinearRangeFromDomains (options) {
  const [min, max] = options.range
  const offset = 0 // (options.offset || dis) / 2
  const seriesDistances = options.domains.map(([dMin, dMax]) => dMax - dMin)

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

export function axisTicks (options) {
  const {domains, x} = options
  const [xdMin, xdMax] = d3.extent(x.domain())
  const seriesScales = domains
    .filter(([dMin, dMax]) => dMax >= xdMin && dMin <= xdMax)
    .map(
      (domain, i) => x.copy()
        .domain(domain)
        .range(x.range().slice(i * 2, (i * 2) + 2))
    )
  const rDistance = distance(d3.extent(x.domain()))
  const ticks = seriesScales.reduce((memo, scale) => {
    const coef = distance(scale.domain()) / rDistance
    return memo.concat(scale.ticks(10 * coef))
  }, [])

  return ticks
}

function distance ([min, max]) {
  return max - min
}
