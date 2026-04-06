import { useState, useEffect, useRef } from 'react'

const W = 960
const H = 480

function project([lon, lat]) {
  return [(lon + 180) * (W / 360), (90 - lat) * (H / 180)]
}

function ringToD(ring) {
  let d = ''
  let prevLon = null
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i]
    const [x, y] = project([lon, lat])
    const jump = prevLon !== null && Math.abs(lon - prevLon) > 180
    d += `${i === 0 || jump ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    prevLon = lon
  }
  return d + 'Z'
}

function polyToD(rings) { return rings.map(ringToD).join('') }

function geomToD({ type, coordinates }) {
  if (type === 'Polygon') return coordinates.map(ringToD).join('')
  if (type === 'MultiPolygon') return coordinates.flat().map(ringToD).join('')
  return ''
}

function ringCentLat(ring) {
  return ring.reduce((s, [, lat]) => s + lat, 0) / ring.length
}

// ISO 3166-1 numeric → display name (covers all countries in world-atlas 50m)
const COUNTRY_NAMES = {
  '004':'Afghanistan','008':'Albania','012':'Algeria','024':'Angola','032':'Argentina',
  '040':'Austria','050':'Bangladesh','056':'Belgium','064':'Bhutan','068':'Bolivia',
  '070':'Bosnia and Herzegovina','072':'Botswana','076':'Brazil','100':'Bulgaria',
  '104':'Myanmar','108':'Burundi','116':'Cambodia','120':'Cameroon','124':'Canada',
  '140':'Central African Republic','144':'Sri Lanka','148':'Chad','152':'Chile',
  '156':'China','170':'Colombia','178':'Republic of Congo','180':'DR Congo',
  '188':'Costa Rica','191':'Croatia','192':'Cuba','196':'Cyprus','203':'Czechia',
  '204':'Benin','208':'Denmark','214':'Dominican Republic','218':'Ecuador',
  '231':'Ethiopia','232':'Eritrea','233':'Estonia','246':'Finland','250':'France',
  '262':'Djibouti','266':'Gabon','268':'Georgia','270':'Gambia','276':'Germany',
  '288':'Ghana','300':'Greece','320':'Guatemala','324':'Guinea','328':'Guyana',
  '332':'Haiti','340':'Honduras','348':'Hungary','352':'Iceland','356':'India',
  '360':'Indonesia','364':'Iran','368':'Iraq','372':'Ireland','376':'Israel',
  '380':'Italy','384':'Côte d\'Ivoire','388':'Jamaica','392':'Japan','398':'Kazakhstan',
  '400':'Jordan','404':'Kenya','408':'North Korea','410':'South Korea','414':'Kuwait',
  '417':'Kyrgyzstan','418':'Laos','422':'Lebanon','426':'Lesotho','428':'Latvia',
  '430':'Liberia','434':'Libya','440':'Lithuania','442':'Luxembourg','450':'Madagascar',
  '454':'Malawi','458':'Malaysia','462':'Maldives','466':'Mali','478':'Mauritania',
  '484':'Mexico','496':'Mongolia','508':'Mozambique','512':'Oman','516':'Namibia',
  '524':'Nepal','528':'Netherlands','558':'Nicaragua','562':'Niger','566':'Nigeria',
  '578':'Norway','586':'Pakistan','591':'Panama','598':'Papua New Guinea','600':'Paraguay',
  '604':'Peru','608':'Philippines','616':'Poland','620':'Portugal','624':'Guinea-Bissau',
  '634':'Qatar','642':'Romania','643':'Russia','646':'Rwanda','682':'Saudi Arabia',
  '686':'Senegal','694':'Sierra Leone','703':'Slovakia','705':'Slovenia','706':'Somalia',
  '710':'South Africa','716':'Zimbabwe','724':'Spain','728':'South Sudan','729':'Sudan',
  '748':'Eswatini','752':'Sweden','756':'Switzerland','760':'Syria','762':'Tajikistan',
  '764':'Thailand','768':'Togo','780':'Trinidad and Tobago','788':'Tunisia',
  '792':'Turkey','795':'Turkmenistan','800':'Uganda','804':'Ukraine','784':'UAE',
  '818':'Egypt','826':'United Kingdom','858':'Uruguay','860':'Uzbekistan',
  '862':'Venezuela','704':'Vietnam','887':'Yemen','894':'Zambia','051':'Armenia',
  '031':'Azerbaijan','112':'Belarus','854':'Burkina Faso','132':'Cape Verde',
  '174':'Comoros','275':'Palestine','010':'Antarctica',
  '304':'Greenland','732':'Western Sahara','583':'Micronesia',
  '548':'Vanuatu','090':'Solomon Islands','882':'Samoa','776':'Tonga',
}

// Countries rendered at sub-national level — skip in main country loop
const SKIP_NUMERIC = new Set(['840', '036', '554'])

// Legacy city→state mapping for existing US place data
const US_STATE_CITIES = {
  Georgia: ['Atlanta, GA', 'Savannah, Georgia'],
  Maryland: ['Maryland / DC'],
  'New York': ['New York City'],
  Massachusetts: ['Boston'],
}

// Legacy AU territory data (not yet in visitedPlaces as state-level entries)
const LEGACY_AU_VISITED = new Set(['Queensland', 'New South Wales'])

// NZ South Island threshold (Cook Strait ≈ -41.5°)
const NZ_SOUTH_THRESH = -41.5

export default function WorldMap({ visitedPlaces, onCountryClick, onAddCountry }) {
  const [countries, setCountries] = useState([])
  const [nzPolygons, setNzPolygons] = useState([])
  const [auCountry, setAuCountry] = useState(null)
  const [usStates, setUsStates] = useState([])
  const [auStates, setAuStates] = useState([])
  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then((r) => r.json())
      .then((topo) => {
        const { scale, translate } = topo.transform
        const arcs = topo.arcs.map((arc) => {
          let cx = 0, cy = 0
          return arc.map(([dx, dy]) => { cx += dx; cy += dy; return [cx * scale[0] + translate[0], cy * scale[1] + translate[1]] })
        })
        const resolveArc = (i) => i < 0 ? [...arcs[~i]].reverse() : arcs[i]
        const buildRing = (idx) => idx.flatMap(resolveArc)
        const buildPoly = (rings) => rings.map(buildRing)

        const parsed = []
        let nz = null, au = null

        for (const g of topo.objects.countries.geometries) {
          const numId = String(g.id).padStart(3, '0')
          let coordinates
          if (g.type === 'Polygon') coordinates = buildPoly(g.arcs)
          else if (g.type === 'MultiPolygon') coordinates = g.arcs.map(buildPoly)
          else continue

          if (numId === '554') nz = { numId, type: g.type, coordinates }
          else if (numId === '036') au = { numId, type: g.type, coordinates }
          else if (!SKIP_NUMERIC.has(numId)) parsed.push({ numId, type: g.type, coordinates })
        }

        setCountries(parsed)
        if (nz) setNzPolygons(nz.type === 'MultiPolygon' ? nz.coordinates : [nz.coordinates])
        if (au) setAuCountry(au)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json')
      .then((r) => r.json()).then((g) => setUsStates(g.features)).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/gh/rowanhogan/australian-states@master/states.min.geojson')
      .then((r) => r.json()).then((g) => setAuStates(g.features)).catch(() => {})
  }, [])

  // ── is-visited helpers ──────────────────────────────────────────────
  function isCountryVisited(countryName) {
    return visitedPlaces?.some((p) => p.country === countryName || p.name === countryName) || false
  }

  function isUsStateVisited(stateName) {
    const cities = US_STATE_CITIES[stateName] || []
    return visitedPlaces?.some((p) => p.name === stateName || cities.includes(p.name)) || false
  }

  function isAuStateVisited(stateName) {
    return LEGACY_AU_VISITED.has(stateName) ||
      visitedPlaces?.some((p) => p.name === stateName) || false
  }

  function isNzVisited() {
    return visitedPlaces?.some((p) => p.country === 'New Zealand' || p.name === 'New Zealand') || false
  }

  // ── tooltip helper ──────────────────────────────────────────────────
  function showTip(e, label) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({ label, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  // ── unified path props ──────────────────────────────────────────────
  function mkPath(visited, label, place, addPayload) {
    return {
      fill: visited ? '#16a34a' : '#9eaaa0',
      stroke: '#222',
      strokeWidth: visited ? 0.6 : 0.35,
      style: { cursor: 'pointer' },
      onMouseEnter: (e) => showTip(e, label),
      onMouseMove: (e) => showTip(e, label),
      onMouseLeave: () => setTooltip(null),
      onClick: () => {
        if (visited && place) onCountryClick?.(place)
        else if (!visited) onAddCountry?.(addPayload)
      },
    }
  }

  const featureName = (f) => {
    const p = f.properties || {}
    return p.STATE_NAME || p.NAME || p.name || ''
  }

  // ── render ──────────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>
      <div style={styles.legend}>
        <span style={styles.legendDot} />
        <span style={styles.legendText}>Places we've been together — click any country to add it</span>
      </div>

      <div style={{ position: 'relative' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={styles.svg} onMouseLeave={() => setTooltip(null)}>
          <rect width={W} height={H} fill="#a8cfe0" />

          {/* World countries */}
          {countries.map((c) => {
            const name = COUNTRY_NAMES[c.numId]
            const d = geomToD(c)
            if (!d) return null
            // Unknown territories (e.g. Antarctica): render grey, no interaction
            if (!name) return <path key={c.numId} d={d} fill="#9eaaa0" stroke="#222" strokeWidth={0.35} />
            const visited = isCountryVisited(name)
            const place = visited ? (visitedPlaces?.find((p) => p.country === name || p.name === name) || null) : null
            return (
              <path key={c.numId} d={d}
                {...mkPath(visited, name, place, { displayName: name, countryName: name })}
              />
            )
          })}

          {/* NZ by island */}
          {nzPolygons.map((poly, i) => {
            const centLat = ringCentLat(poly[0])
            const isSouth = centLat < NZ_SOUTH_THRESH
            const d = polyToD(poly)
            if (!d) return null
            const label = isSouth ? 'South Island, New Zealand' : 'North Island, New Zealand'
            const nzVisited = isNzVisited()
            const place = nzVisited ? (visitedPlaces?.find((p) => p.country === 'New Zealand' || p.name === 'New Zealand') || null) : null
            return (
              <path key={`nz-${i}`} d={d}
                {...mkPath(
                  isSouth && nzVisited,
                  label,
                  place,
                  { displayName: label, countryName: 'New Zealand' }
                )}
              />
            )
          })}

          {/* Australia by territory */}
          {auStates.length > 0
            ? auStates.map((feature) => {
                const name = featureName(feature)
                const d = geomToD(feature.geometry)
                if (!d || !name) return null
                const visited = isAuStateVisited(name)
                const place = visited ? (visitedPlaces?.find((p) => p.country === 'Australia' || p.name === 'Australia') || null) : null
                return (
                  <path key={`au-${name}`} d={d}
                    {...mkPath(visited, `${name}, Australia`, place, { displayName: name, countryName: 'Australia' })}
                  />
                )
              })
            : auCountry && (() => {
                const d = geomToD(auCountry)
                if (!d) return null
                const visited = isCountryVisited('Australia')
                const place = visited ? visitedPlaces?.find((p) => p.country === 'Australia') : null
                return <path key="au" d={d} {...mkPath(visited, 'Australia', place, { displayName: 'Australia', countryName: 'Australia' })} />
              })()}

          {/* US States */}
          {usStates.map((feature) => {
            const name = featureName(feature)
            const d = geomToD(feature.geometry)
            if (!d || !name) return null
            const visited = isUsStateVisited(name)
            const cities = US_STATE_CITIES[name] || []
            const place = visited
              ? visitedPlaces?.find((p) => p.name === name || cities.includes(p.name)) || null
              : null
            return (
              <path key={`us-${name}`} d={d}
                {...mkPath(visited, name, place, { displayName: name, countryName: 'USA' })}
              />
            )
          })}
        </svg>

        {tooltip && (
          <div style={{ ...styles.tooltip, left: tooltip.x + 14, top: Math.max(tooltip.y - 36, 8) }}>
            {tooltip.label}
          </div>
        )}

        {countries.length === 0 && <div style={styles.loading}>Loading map…</div>}
      </div>
    </div>
  )
}

const styles = {
  wrapper: { borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 36, background: '#a8cfe0' },
  legend: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 6px', background: 'rgba(255,255,255,0.7)' },
  legendDot: { width: 12, height: 12, borderRadius: '50%', background: '#16a34a', flexShrink: 0 },
  legendText: { fontSize: 13, color: '#444', fontWeight: '500' },
  svg: { width: '100%', height: 'auto', display: 'block' },
  tooltip: {
    position: 'absolute', background: 'rgba(26,46,26,0.92)', color: '#fff',
    padding: '5px 11px', borderRadius: 8, fontSize: 13, fontWeight: '600',
    pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  loading: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 14 },
}
