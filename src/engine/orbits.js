/**
 * Orbital mechanics engine using VSOP87 via the `astronomia` library.
 * Returns heliocentric ecliptic coordinates (x, y, z) in AU for each planet.
 */
import { planetposition, julian } from 'astronomia'
import vsop87Bmercury from 'astronomia/data/vsop87Bmercury'
import vsop87Bvenus from 'astronomia/data/vsop87Bvenus'
import vsop87Bearth from 'astronomia/data/vsop87Bearth'
import vsop87Bmars from 'astronomia/data/vsop87Bmars'
import vsop87Bjupiter from 'astronomia/data/vsop87Bjupiter'
import vsop87Bsaturn from 'astronomia/data/vsop87Bsaturn'
import vsop87Buranus from 'astronomia/data/vsop87Buranus'
import vsop87Bneptune from 'astronomia/data/vsop87Bneptune'

// Instantiate VSOP87B planet objects (heliocentric spherical)
const mercuryPlanet = new planetposition.Planet(vsop87Bmercury)
const venusPlanet   = new planetposition.Planet(vsop87Bvenus)
const earthPlanet   = new planetposition.Planet(vsop87Bearth)
const marsPlanet    = new planetposition.Planet(vsop87Bmars)
const jupiterPlanet = new planetposition.Planet(vsop87Bjupiter)
const saturnPlanet  = new planetposition.Planet(vsop87Bsaturn)
const uranusPlanet  = new planetposition.Planet(vsop87Buranus)
const neptunePlanet = new planetposition.Planet(vsop87Bneptune)

const vsopPlanets = {
  mercury: mercuryPlanet,
  venus:   venusPlanet,
  earth:   earthPlanet,
  mars:    marsPlanet,
  jupiter: jupiterPlanet,
  saturn:  saturnPlanet,
  uranus:  uranusPlanet,
  neptune: neptunePlanet,
}

/**
 * Convert JS Date → Julian Day Number (JDE).
 */
export function dateToJDE(date) {
  return julian.DateToJD(date)
}

/**
 * Given a VSOP87B position (lon, lat, range in radians/AU),
 * return Cartesian {x, y, z} in AU.
 * Y is up in Three.js, so we map ecliptic Y → Three.js Z and Z → Three.js Y.
 */
function vsopToCartesian(pos) {
  const lon = pos.lon
  const lat = pos.lat
  const r   = pos.range
  // Heliocentric ecliptic spherical → Cartesian
  const xe = r * Math.cos(lat) * Math.cos(lon)
  const ye = r * Math.cos(lat) * Math.sin(lon)
  const ze = r * Math.sin(lat)
  // Map to Three.js axes: x=xe, z=-ye, y=ze (ecliptic plane → XZ plane)
  return { x: xe, y: ze, z: -ye }
}

/**
 * Get the heliocentric Cartesian position of a planet at the given JDE.
 * Returns {x, y, z} in AU.
 */
export function getPlanetPosition(planetName, jde) {
  const planet = vsopPlanets[planetName]
  if (!planet) return { x: 0, y: 0, z: 0 }
  const pos = planet.position(jde)
  return vsopToCartesian(pos)
}

/**
 * Get positions of ALL planets at the given JDE.
 * Returns object keyed by planet name.
 */
export function getAllPositions(jde) {
  const result = {}
  for (const name of Object.keys(vsopPlanets)) {
    result[name] = getPlanetPosition(name, jde)
  }
  return result
}

// ─── Moon position (simplified analytical, J2000 epoch) ───────────────────
const DEG = Math.PI / 180

/**
 * Very accurate approximate lunar position relative to Earth (AU).
 * Based on Jean Meeus, "Astronomical Algorithms" Ch. 47 simplified.
 */
export function getMoonPositionRelativeToEarth(jde) {
  const T = (jde - 2451545.0) / 36525.0

  // Moon's mean longitude
  const L0 = (218.3164477 + 481267.88123421 * T) * DEG
  // Moon's mean anomaly
  const M0 = (134.9633964 + 477198.8676313 * T) * DEG
  // Sun's mean anomaly
  const M  = (357.5291092 + 35999.0502909 * T) * DEG
  // Moon's argument of latitude
  const F  = (93.2720950 + 483202.0175233 * T) * DEG
  // Longitude of ascending node
  const Om = (125.0445479 - 1934.1362608 * T) * DEG

  // Primary longitude correction (degrees)
  const dLon =
    6.288774 * Math.sin(M0) +
    1.274027 * Math.sin(2 * L0 - M0) +
    0.658314 * Math.sin(2 * L0) +
    0.213618 * Math.sin(2 * M0) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * L0 - 2 * M0) +
    0.057066 * Math.sin(2 * L0 - M - M0) +
    0.053322 * Math.sin(2 * L0 + M0) +
    0.045758 * Math.sin(2 * L0 - M)

  // Primary latitude correction (degrees)
  const dLat =
    5.128122 * Math.sin(F) +
    0.280602 * Math.sin(M0 + F) +
    0.277693 * Math.sin(M0 - F) +
    0.173237 * Math.sin(2 * L0 - F) +
    0.055413 * Math.sin(2 * L0 + F - M0) +
    0.046271 * Math.sin(2 * L0 - F - M0) +
    0.032573 * Math.sin(2 * L0 + F)

  // Distance correction (km)
  const dR =
    -20905.355 * Math.cos(M0) -
    3699.111  * Math.cos(2 * L0 - M0) -
    2955.968  * Math.cos(2 * L0) -
    569.925   * Math.cos(2 * M0) +
    48.888    * Math.cos(M) -
    3.149     * Math.cos(2 * F) +
    246.158   * Math.cos(2 * L0 - 2 * M0)

  const lon = L0 + dLon * DEG
  const lat = dLat * DEG
  const r   = (385000.56 + dR) / 1.496e8 // km → AU

  // Geocentric ecliptic spherical → Cartesian (AU, relative to Earth)
  const xe = r * Math.cos(lat) * Math.cos(lon)
  const ye = r * Math.cos(lat) * Math.sin(lon)
  const ze = r * Math.sin(lat)

  return { x: xe, y: ze, z: -ye }
}

// ─── Other moon positions (Keplerian approximations) ────────────────────────
// Semi-major axes in AU, periods in days, inclinations in radians
const MOON_ELEMENTS = {
  // Jupiter's Galilean moons
  io:       { parent: 'jupiter', a: 0.002819, period: 1.769138, incl: 0.0004 },
  europa:   { parent: 'jupiter', a: 0.004486, period: 3.551810, incl: 0.0086 },
  ganymede: { parent: 'jupiter', a: 0.007155, period: 7.154553, incl: 0.0018 },
  callisto: { parent: 'jupiter', a: 0.012585, period: 16.68902, incl: 0.0028 },
  // Saturn
  titan:    { parent: 'saturn',  a: 0.008168, period: 15.94544, incl: 0.0087 },
  // Uranus
  titania:  { parent: 'uranus',  a: 0.002919, period: 8.705872, incl: 0.0016 },
  // Neptune
  triton:   { parent: 'neptune', a: 0.002370, period: 5.876854, incl: 2.7688 }, // retrograde
}

export const MOON_ELEMENTS_MAP = MOON_ELEMENTS

/**
 * Get position of a named moon relative to its parent planet (AU).
 */
export function getMoonPosition(moonName, jde) {
  const el = MOON_ELEMENTS[moonName]
  if (!el) return { x: 0, y: 0, z: 0 }

  const n = (2 * Math.PI) / el.period  // mean motion rad/day
  const M = n * jde                    // mean anomaly (ignoring epoch offset — fine for visual)
  // Keplerian circular approximation
  const x = el.a * Math.cos(M)
  const y = el.a * Math.sin(M) * Math.cos(el.incl)
  const z = el.a * Math.sin(M) * Math.sin(el.incl)
  return { x, y: z, z: -y }
}

/**
 * Orbital period in years for each planet (for info panel).
 */
export const ORBITAL_PERIODS = {
  mercury: 0.2408,
  venus:   0.6152,
  earth:   1.0000,
  mars:    1.8809,
  jupiter: 11.862,
  saturn:  29.457,
  uranus:  84.011,
  neptune: 164.80,
}

/**
 * Mean orbital speed in km/s for each planet.
 */
export const ORBITAL_SPEEDS = {
  mercury: 47.87,
  venus:   35.02,
  earth:   29.78,
  mars:    24.07,
  jupiter: 13.07,
  saturn:  9.69,
  uranus:  6.81,
  neptune: 5.43,
}
