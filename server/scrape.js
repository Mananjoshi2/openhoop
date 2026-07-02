// Fetches basketball courts in Toronto (and nearby GTA) from Overpass API
// and inserts them into the SQLite database.

import db from './db.js';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const QUERY = `
[out:json][timeout:30];
(
  node["leisure"="pitch"]["sport"="basketball"](43.44,-79.90,43.92,-79.10);
  way["leisure"="pitch"]["sport"="basketball"](43.44,-79.90,43.92,-79.10);
  relation["leisure"="pitch"]["sport"="basketball"](43.44,-79.90,43.92,-79.10);
);
out center tags;
`;

function surfaceLabel(raw) {
  if (!raw) return 'concrete';
  const s = raw.toLowerCase();
  if (s.includes('asphalt')) return 'asphalt';
  if (s.includes('concrete')) return 'concrete';
  if (s.includes('wood')) return 'hardwood';
  if (s.includes('rubber')) return 'rubber';
  return raw;
}

function courtName(tags, lat, lng) {
  return (
    tags.name ||
    tags['name:en'] ||
    (tags.operator ? `${tags.operator} Court` : null) ||
    `Basketball Court (${lat.toFixed(4)}, ${lng.toFixed(4)})`
  );
}

export async function scrapeAndSeed() {
  console.log('[scrape] Fetching courts from Overpass API...');
  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(QUERY)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
    const json = await res.json();

    const insert = db.prepare(`
      INSERT OR IGNORE INTO courts (osm_id, name, lat, lng, hoops, surface, lights, source)
      VALUES (@osm_id, @name, @lat, @lng, @hoops, @surface, @lights, @source)
    `);

    const insertMany = db.transaction((elements) => {
      let count = 0;
      for (const el of elements) {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) continue;
        const tags = el.tags || {};
        const info = insert.run({
          osm_id: `${el.type}/${el.id}`,
          name: courtName(tags, lat, lng),
          lat,
          lng,
          hoops: parseInt(tags.hoops) || 2,
          surface: surfaceLabel(tags.surface),
          lights: tags.lit === 'yes' ? 1 : 0,
          source: 'osm',
        });
        if (info.changes > 0) count++;
      }
      return count;
    });

    const added = insertMany(json.elements || []);
    console.log(`[scrape] Done — ${added} new courts inserted (${json.elements?.length ?? 0} total from OSM).`);
    return added;
  } catch (e) {
    console.error('[scrape] Error:', e.message);
    return 0;
  }
}

// Seed hand-curated GTA courts. Runs on every startup — INSERT OR IGNORE skips existing rows.
export function seedFallback() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO courts (osm_id, name, address, lat, lng, hoops, surface, lights, source, players, status)
    VALUES (@osm_id, @name, @address, @lat, @lng, @hoops, @surface, @lights, @source, @players, @status)
  `);

  const fallback = [
    // ── Toronto – Downtown / West End ──────────────────────────────────────────
    { osm_id: 'fallback/1',  name: 'Trinity Bellwoods',       address: '790 Queen St W, Toronto',          lat: 43.6474, lng: -79.4158, hoops: 4, surface: 'concrete', lights: 0, players: 7,  status: 'some' },
    { osm_id: 'fallback/2',  name: 'Harbourfront Court',      address: '235 Queens Quay W, Toronto',       lat: 43.6387, lng: -79.3805, hoops: 2, surface: 'asphalt',  lights: 1, players: 10, status: 'full' },
    { osm_id: 'fallback/3',  name: 'Regent Park Athletic',    address: '480 Shuter St, Toronto',           lat: 43.6594, lng: -79.3633, hoops: 2, surface: 'concrete', lights: 1, players: 0,  status: 'free' },
    { osm_id: 'fallback/4',  name: 'Christie Pits',           address: '750 Bloor St W, Toronto',          lat: 43.6649, lng: -79.4199, hoops: 2, surface: 'asphalt',  lights: 0, players: 4,  status: 'some' },
    { osm_id: 'fallback/5',  name: 'Alexandra Park',          address: '275 Bathurst St, Toronto',         lat: 43.6495, lng: -79.4017, hoops: 2, surface: 'concrete', lights: 0, players: 2,  status: 'free' },
    { osm_id: 'fallback/6',  name: 'Dufferin Grove',          address: '875 Dufferin St, Toronto',         lat: 43.6534, lng: -79.4328, hoops: 2, surface: 'concrete', lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/7',  name: 'Greenwood Park',          address: '150 Greenwood Ave, Toronto',       lat: 43.6684, lng: -79.3314, hoops: 2, surface: 'asphalt',  lights: 1, players: 3,  status: 'some' },
    { osm_id: 'fallback/8',  name: 'Corktown Common',         address: '155 Bayview Ave, Toronto',         lat: 43.6504, lng: -79.3567, hoops: 2, surface: 'rubber',   lights: 1, players: 0,  status: 'free' },
    { osm_id: 'fallback/9',  name: 'Bickford Park',           address: '42 Bickford Ave, Toronto',         lat: 43.6652, lng: -79.4249, hoops: 2, surface: 'asphalt',  lights: 0, players: 5,  status: 'some' },
    { osm_id: 'fallback/10', name: 'Ramsden Park',            address: '1 Ramsden Park Rd, Toronto',       lat: 43.6791, lng: -79.3931, hoops: 2, surface: 'concrete', lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/11', name: 'Dovercourt Park',         address: '50 Bartlett Ave, Toronto',         lat: 43.6585, lng: -79.4281, hoops: 2, surface: 'asphalt',  lights: 0, players: 6,  status: 'some' },
    { osm_id: 'fallback/12', name: 'Fort York Blvd Court',    address: '100 Fort York Blvd, Toronto',      lat: 43.6384, lng: -79.4025, hoops: 2, surface: 'concrete', lights: 1, players: 0,  status: 'free' },
    { osm_id: 'fallback/13', name: 'Jimmie Simpson Park',     address: '870 Queen St E, Toronto',          lat: 43.6602, lng: -79.3530, hoops: 2, surface: 'asphalt',  lights: 1, players: 8,  status: 'full' },
    { osm_id: 'fallback/14', name: 'Sherbourne Common',       address: '54 Merchants Wharf, Toronto',      lat: 43.6464, lng: -79.3641, hoops: 2, surface: 'concrete', lights: 1, players: 2,  status: 'free' },
    // ── Toronto – East End ─────────────────────────────────────────────────────
    { osm_id: 'fallback/15', name: 'Pape Playground',         address: '659 Pape Ave, Toronto',            lat: 43.6720, lng: -79.3430, hoops: 2, surface: 'asphalt',  lights: 0, players: 3,  status: 'some' },
    { osm_id: 'fallback/16', name: 'East York Memorial Park', address: '888 Cosburn Ave, Toronto',         lat: 43.6991, lng: -79.3252, hoops: 2, surface: 'concrete', lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/17', name: 'Flemingdon Park',         address: '150 Overlea Blvd, Toronto',        lat: 43.7161, lng: -79.3383, hoops: 4, surface: 'asphalt',  lights: 1, players: 11, status: 'full' },
    { osm_id: 'fallback/18', name: 'Thomson Memorial Park',   address: '1005 Brimley Rd, Scarborough',     lat: 43.7615, lng: -79.2503, hoops: 2, surface: 'concrete', lights: 0, players: 4,  status: 'some' },
    { osm_id: 'fallback/19', name: 'Agincourt Park',          address: '31 Glen Watford Dr, Scarborough',  lat: 43.7907, lng: -79.2707, hoops: 2, surface: 'asphalt',  lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/20', name: 'Malvern Community Court', address: '30 Sewells Rd, Scarborough',       lat: 43.8028, lng: -79.2250, hoops: 4, surface: 'concrete', lights: 1, players: 6,  status: 'some' },
    // ── Toronto – North York ───────────────────────────────────────────────────
    { osm_id: 'fallback/21', name: 'Eglinton Park',           address: '200 Eglinton Ave W, Toronto',      lat: 43.7057, lng: -79.4074, hoops: 2, surface: 'asphalt',  lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/22', name: 'Earl Bales Park',         address: '4169 Bathurst St, North York',     lat: 43.7638, lng: -79.4468, hoops: 2, surface: 'concrete', lights: 0, players: 5,  status: 'some' },
    { osm_id: 'fallback/23', name: 'Mel Lastman Square',      address: '5100 Yonge St, North York',        lat: 43.7699, lng: -79.4149, hoops: 2, surface: 'concrete', lights: 1, players: 9,  status: 'full' },
    { osm_id: 'fallback/24', name: 'Finch-Jane Community',    address: '4 Habitant Dr, North York',        lat: 43.7531, lng: -79.5164, hoops: 2, surface: 'asphalt',  lights: 0, players: 0,  status: 'free' },
    // ── Mississauga ────────────────────────────────────────────────────────────
    { osm_id: 'fallback/25', name: 'Mississauga Valley Park', address: '1275 Mississauga Valley Blvd',     lat: 43.5959, lng: -79.6382, hoops: 4, surface: 'asphalt',  lights: 1, players: 7,  status: 'some' },
    { osm_id: 'fallback/26', name: 'Port Credit Memorial',    address: '50 Stavebank Rd, Mississauga',     lat: 43.5518, lng: -79.5835, hoops: 2, surface: 'concrete', lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/27', name: 'Huron Park',              address: '5500 Rose Cherry Pl, Mississauga', lat: 43.6370, lng: -79.6447, hoops: 2, surface: 'asphalt',  lights: 1, players: 3,  status: 'some' },
    { osm_id: 'fallback/28', name: 'Burnhamthorpe Park',      address: '400 Burnhamthorpe Rd, Mississauga',lat: 43.5881, lng: -79.6494, hoops: 2, surface: 'concrete', lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/29', name: 'Streetsville Memorial',   address: '251 Queen St S, Mississauga',      lat: 43.5871, lng: -79.7148, hoops: 2, surface: 'asphalt',  lights: 0, players: 2,  status: 'free' },
    { osm_id: 'fallback/30', name: 'Meadowvale Community',    address: '6655 Glen Erin Dr, Mississauga',   lat: 43.6289, lng: -79.7458, hoops: 2, surface: 'concrete', lights: 1, players: 10, status: 'full' },
    { osm_id: 'fallback/31', name: 'Malton Neighbourhood Ct', address: '3540 Morning Star Dr, Mississauga',lat: 43.7095, lng: -79.6636, hoops: 2, surface: 'asphalt',  lights: 0, players: 4,  status: 'some' },
    { osm_id: 'fallback/32', name: 'Cooksville Park',         address: '1100 Hurontario St, Mississauga',  lat: 43.5840, lng: -79.6240, hoops: 2, surface: 'concrete', lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/33', name: 'Erin Mills Park Court',   address: '4120 Erin Mills Pkwy, Mississauga',lat: 43.5524, lng: -79.7101, hoops: 2, surface: 'asphalt',  lights: 1, players: 5,  status: 'some' },
    // ── Brampton ───────────────────────────────────────────────────────────────
    { osm_id: 'fallback/34', name: 'Chinguacousy Park',       address: '9050 Bramalea Rd, Brampton',       lat: 43.7315, lng: -79.7136, hoops: 4, surface: 'asphalt',  lights: 1, players: 12, status: 'full' },
    { osm_id: 'fallback/35', name: 'Gage Park',               address: '45 Main St N, Brampton',           lat: 43.6843, lng: -79.7598, hoops: 2, surface: 'concrete', lights: 0, players: 5,  status: 'some' },
    { osm_id: 'fallback/36', name: "Loafer's Lake Park",      address: '50 Rutherford Rd, Brampton',       lat: 43.6905, lng: -79.7899, hoops: 2, surface: 'asphalt',  lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/37', name: 'McLaughlin Village Park', address: '50 McLaughlin Rd N, Brampton',     lat: 43.7103, lng: -79.7726, hoops: 2, surface: 'concrete', lights: 0, players: 3,  status: 'some' },
    { osm_id: 'fallback/38', name: 'Bramalea Community Court',address: '60 Balmoral Dr, Brampton',         lat: 43.7394, lng: -79.6993, hoops: 4, surface: 'asphalt',  lights: 1, players: 8,  status: 'some' },
    { osm_id: 'fallback/39', name: 'Century Gardens Park',    address: '8 Nevets Dr, Brampton',            lat: 43.6968, lng: -79.7481, hoops: 2, surface: 'concrete', lights: 1, players: 0,  status: 'free' },
    { osm_id: 'fallback/40', name: 'Heart Lake East Park',    address: '55 Conestoga Dr, Brampton',        lat: 43.7178, lng: -79.7481, hoops: 2, surface: 'asphalt',  lights: 0, players: 6,  status: 'some' },
    { osm_id: 'fallback/41', name: 'Williams Pkwy Court',     address: '500 Williams Pkwy, Brampton',      lat: 43.7199, lng: -79.7503, hoops: 2, surface: 'concrete', lights: 1, players: 11, status: 'full' },
    { osm_id: 'fallback/42', name: 'Professor\'s Lake Park',  address: '600 Sandalwood Pkwy, Brampton',    lat: 43.7480, lng: -79.7380, hoops: 2, surface: 'asphalt',  lights: 0, players: 0,  status: 'free' },
    // ── Etobicoke ──────────────────────────────────────────────────────────────
    { osm_id: 'fallback/43', name: 'Centennial Park Court',   address: '256 Centennial Park Rd, Etobicoke',lat: 43.6516, lng: -79.5740, hoops: 4, surface: 'asphalt',  lights: 1, players: 9,  status: 'full' },
    { osm_id: 'fallback/44', name: 'Humber Bay Park East',    address: '2225 Lake Shore Blvd W, Etobicoke',lat: 43.6246, lng: -79.4866, hoops: 2, surface: 'concrete', lights: 0, players: 3,  status: 'some' },
    { osm_id: 'fallback/45', name: 'James Gardens Park',      address: '61 James Gardens, Etobicoke',      lat: 43.6493, lng: -79.5238, hoops: 2, surface: 'asphalt',  lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/46', name: 'West Deane Park',         address: '250 West Deane Park Dr, Etobicoke',lat: 43.6580, lng: -79.5520, hoops: 2, surface: 'concrete', lights: 0, players: 4,  status: 'some' },
    { osm_id: 'fallback/47', name: 'Richview Park',           address: '1543 Kipling Ave, Etobicoke',      lat: 43.6720, lng: -79.5578, hoops: 2, surface: 'asphalt',  lights: 1, players: 0,  status: 'free' },
    { osm_id: 'fallback/48', name: 'Rexdale Community Court', address: '21 Panorama Crt, Etobicoke',       lat: 43.7365, lng: -79.5743, hoops: 2, surface: 'concrete', lights: 1, players: 7,  status: 'some' },
    { osm_id: 'fallback/49', name: 'Thistletown Park',        address: '2 Thistletown Dr, Etobicoke',      lat: 43.7299, lng: -79.5750, hoops: 2, surface: 'asphalt',  lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/50', name: 'West Humber Park',        address: '2055 Islington Ave, Etobicoke',    lat: 43.7191, lng: -79.5905, hoops: 4, surface: 'concrete', lights: 1, players: 11, status: 'full' },
    { osm_id: 'fallback/51', name: 'Albion Hills Court',      address: '1600 Albion Rd, Etobicoke',        lat: 43.7430, lng: -79.5680, hoops: 2, surface: 'asphalt',  lights: 0, players: 5,  status: 'some' },
    // ── York ───────────────────────────────────────────────────────────────────
    { osm_id: 'fallback/52', name: 'Fairbank Memorial Park',  address: '2213 Dufferin St, York',           lat: 43.6937, lng: -79.4589, hoops: 2, surface: 'concrete', lights: 0, players: 0,  status: 'free' },
    { osm_id: 'fallback/53', name: 'Amesbury Park',           address: '1370 Lawrence Ave W, York',        lat: 43.7026, lng: -79.4889, hoops: 2, surface: 'asphalt',  lights: 1, players: 6,  status: 'some' },
    { osm_id: 'fallback/54', name: 'Silverthorn Park',        address: '25 Silverthorn Ave, York',         lat: 43.6880, lng: -79.4802, hoops: 2, surface: 'concrete', lights: 0, players: 2,  status: 'free' },
    { osm_id: 'fallback/55', name: 'Caledonia Park',          address: '961 Caledonia Rd, York',           lat: 43.6856, lng: -79.4612, hoops: 2, surface: 'asphalt',  lights: 0, players: 8,  status: 'full' },
    { osm_id: 'fallback/56', name: 'Humber Summit Park',      address: '15 Humber Summit Rd, York',        lat: 43.7530, lng: -79.5630, hoops: 2, surface: 'concrete', lights: 1, players: 0,  status: 'free' },
    // ── Malton (NW Mississauga / Pearson area) ─────────────────────────────────
    { osm_id: 'fallback/57', name: 'Goreway Community Court', address: '3670 Goreway Dr, Malton',          lat: 43.7165, lng: -79.6495, hoops: 2, surface: 'asphalt',  lights: 1, players: 4,  status: 'some' },
    { osm_id: 'fallback/58', name: 'Westwood Park Malton',    address: '3760 Derry Rd W, Malton',          lat: 43.7042, lng: -79.6510, hoops: 2, surface: 'concrete', lights: 0, players: 0,  status: 'free' },
    // ── Dixie (east Mississauga) ───────────────────────────────────────────────
    { osm_id: 'fallback/59', name: 'Dixie Park Court',        address: '925 Burnhamthorpe Rd W, Mississauga',lat: 43.6118, lng: -79.6368, hoops: 2, surface: 'asphalt',lights: 0, players: 5,  status: 'some' },
    { osm_id: 'fallback/60', name: 'Applewood Hills Park',    address: '1075 Dixie Rd, Mississauga',       lat: 43.6039, lng: -79.6130, hoops: 2, surface: 'concrete', lights: 1, players: 0,  status: 'free' },
    { osm_id: 'fallback/61', name: 'Lakeview Park Court',     address: '1300 Dixie Rd, Mississauga',       lat: 43.5690, lng: -79.5970, hoops: 2, surface: 'asphalt',  lights: 0, players: 3,  status: 'some' },
  ];

  const insertAll = db.transaction((rows) => {
    let added = 0;
    for (const r of rows) {
      const info = insert.run({ source: 'seed', ...r });
      if (info.changes > 0) added++;
    }
    return added;
  });
  const added = insertAll(fallback);
  if (added > 0) console.log(`[seed] ${added} new courts inserted.`);
}
