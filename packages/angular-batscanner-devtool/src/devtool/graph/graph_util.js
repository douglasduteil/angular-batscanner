//

import * as d3 from 'd3'

//

const AXIS_SUBTICKS = 10

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

  const {distances, totalDistance} = seriesScales.reduce(
    (memo, scale) => {
      const d = distance(scale.domain())
      memo.distances.push(d)
      memo.totalDistance += d
      return memo
    },
    {
      distances: [],
      totalDistance: 0
    }
  )

  const ticks = seriesScales.reduce((memo, scale, i) => {
    const dFract = distances[i] / totalDistance
    let ticksCount = Math.floor(AXIS_SUBTICKS * dFract)
    ticksCount = ticksCount || (i % 2 ? 1 : 0)
    return memo.concat(scale.ticks(ticksCount))
  }, [])

  return ticks
}

function distance ([min, max]) {
  return max - min
}
