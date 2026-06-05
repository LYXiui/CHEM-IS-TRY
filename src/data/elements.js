/** 118 種元素 — 狀態圖示：固態 🪨 液態 💧 氣態 ☁️ */
const STATE_ICON = { solid: '🪨', liquid: '💧', gas: '☁️' }

/** 元素常見／代表色（週期表格子背景） */
const ELEMENT_COLOR = {
  H: '#e8f4fc', He: '#fce4ec', Li: '#ffcdd2', Be: '#ffe0b2', B: '#fff9c4', C: '#37474f',
  N: '#bbdefb', O: '#ffcdd2', F: '#c8e6c9', Ne: '#f3e5f5', Na: '#ef9a9a', Mg: '#c5e1a5',
  Al: '#cfd8dc', Si: '#78909c', P: '#ffcc80', S: '#fff176', Cl: '#a5d6a7', Ar: '#e1bee7',
  K: '#ef5350', Ca: '#fff59d', Fe: '#8d6e63', Cu: '#4fc3f7', Zn: '#b0bec5', Br: '#8d6e63',
  I: '#5d4037', Ag: '#eceff1', Au: '#ffd54f', Hg: '#b0bec5', Pb: '#78909c', U: '#66bb6a',
}

const CATEGORY_COLOR = {
  alkali: '#ffcdd2',
  alkaline: '#ffe0b2',
  transition: '#fff9c4',
  post: '#e0e0e0',
  metalloid: '#c8e6c9',
  nonmetal: '#e3f2fd',
  halogen: '#b2dfdb',
  noble: '#e1bee7',
  lanthanide: '#d1c4e9',
  actinide: '#ce93d8',
}

const RAW = [
  ['H', '氫', 1, 'nonmetal', 'gas'], ['He', '氦', 2, 'noble', 'gas'],
  ['Li', '鋰', 3, 'alkali', 'solid'], ['Be', '鈹', 4, 'alkaline', 'solid'],
  ['B', '硼', 5, 'metalloid', 'solid'], ['C', '碳', 6, 'nonmetal', 'solid'],
  ['N', '氮', 7, 'nonmetal', 'gas'], ['O', '氧', 8, 'nonmetal', 'gas'],
  ['F', '氟', 9, 'halogen', 'gas'], ['Ne', '氖', 10, 'noble', 'gas'],
  ['Na', '鈉', 11, 'alkali', 'solid'], ['Mg', '鎂', 12, 'alkaline', 'solid'],
  ['Al', '鋁', 13, 'post', 'solid'], ['Si', '矽', 14, 'metalloid', 'solid'],
  ['P', '磷', 15, 'nonmetal', 'solid'], ['S', '硫', 16, 'nonmetal', 'solid'],
  ['Cl', '氯', 17, 'halogen', 'gas'], ['Ar', '氬', 18, 'noble', 'gas'],
  ['K', '鉀', 19, 'alkali', 'solid'], ['Ca', '鈣', 20, 'alkaline', 'solid'],
  ['Sc', '鈧', 21, 'transition', 'solid'], ['Ti', '鈦', 22, 'transition', 'solid'],
  ['V', '釩', 23, 'transition', 'solid'], ['Cr', '鉻', 24, 'transition', 'solid'],
  ['Mn', '錳', 25, 'transition', 'solid'], ['Fe', '鐵', 26, 'transition', 'solid'],
  ['Co', '鈷', 27, 'transition', 'solid'], ['Ni', '鎳', 28, 'transition', 'solid'],
  ['Cu', '銅', 29, 'transition', 'solid'], ['Zn', '鋅', 30, 'transition', 'solid'],
  ['Ga', '鎵', 31, 'post', 'solid'], ['Ge', '鍺', 32, 'metalloid', 'solid'],
  ['As', '砷', 33, 'metalloid', 'solid'], ['Se', '硒', 34, 'nonmetal', 'solid'],
  ['Br', '溴', 35, 'halogen', 'liquid'], ['Kr', '氪', 36, 'noble', 'gas'],
  ['Rb', '銣', 37, 'alkali', 'solid'], ['Sr', '鍶', 38, 'alkaline', 'solid'],
  ['Y', '釔', 39, 'transition', 'solid'], ['Zr', '鋯', 40, 'transition', 'solid'],
  ['Nb', '鈮', 41, 'transition', 'solid'], ['Mo', '鉬', 42, 'transition', 'solid'],
  ['Tc', '鎝', 43, 'transition', 'solid'], ['Ru', '釕', 44, 'transition', 'solid'],
  ['Rh', '銠', 45, 'transition', 'solid'], ['Pd', '鈀', 46, 'transition', 'solid'],
  ['Ag', '銀', 47, 'transition', 'solid'], ['Cd', '鎘', 48, 'transition', 'solid'],
  ['In', '銦', 49, 'post', 'solid'], ['Sn', '錫', 50, 'post', 'solid'],
  ['Sb', '銻', 51, 'metalloid', 'solid'], ['Te', '碲', 52, 'metalloid', 'solid'],
  ['I', '碘', 53, 'halogen', 'solid'], ['Xe', '氙', 54, 'noble', 'gas'],
  ['Cs', '銫', 55, 'alkali', 'solid'], ['Ba', '鋇', 56, 'alkaline', 'solid'],
  ['La', '鑭', 57, 'lanthanide', 'solid'], ['Ce', '鈰', 58, 'lanthanide', 'solid'],
  ['Pr', '鐠', 59, 'lanthanide', 'solid'], ['Nd', '釹', 60, 'lanthanide', 'solid'],
  ['Pm', '鉕', 61, 'lanthanide', 'solid'], ['Sm', '釤', 62, 'lanthanide', 'solid'],
  ['Eu', '銪', 63, 'lanthanide', 'solid'], ['Gd', '釓', 64, 'lanthanide', 'solid'],
  ['Tb', '鋱', 65, 'lanthanide', 'solid'], ['Dy', '鏑', 66, 'lanthanide', 'solid'],
  ['Ho', '鈥', 67, 'lanthanide', 'solid'], ['Er', '鉺', 68, 'lanthanide', 'solid'],
  ['Tm', '銩', 69, 'lanthanide', 'solid'], ['Yb', '鐿', 70, 'lanthanide', 'solid'],
  ['Lu', '鎦', 71, 'lanthanide', 'solid'], ['Hf', '鉿', 72, 'transition', 'solid'],
  ['Ta', '鉭', 73, 'transition', 'solid'], ['W', '鎢', 74, 'transition', 'solid'],
  ['Re', '錸', 75, 'transition', 'solid'], ['Os', '鋨', 76, 'transition', 'solid'],
  ['Ir', '銥', 77, 'transition', 'solid'], ['Pt', '鉑', 78, 'transition', 'solid'],
  ['Au', '金', 79, 'transition', 'solid'], ['Hg', '汞', 80, 'transition', 'liquid'],
  ['Tl', '鉈', 81, 'post', 'solid'], ['Pb', '鉛', 82, 'post', 'solid'],
  ['Bi', '鉍', 83, 'post', 'solid'], ['Po', '釙', 84, 'metalloid', 'solid'],
  ['At', '砈', 85, 'halogen', 'solid'], ['Rn', '氡', 86, 'noble', 'gas'],
  ['Fr', '鍣', 87, 'alkali', 'solid'], ['Ra', '鐳', 88, 'alkaline', 'solid'],
  ['Ac', '錒', 89, 'actinide', 'solid'], ['Th', '釷', 90, 'actinide', 'solid'],
  ['Pa', '鏷', 91, 'actinide', 'solid'], ['U', '鈾', 92, 'actinide', 'solid'],
  ['Np', '錼', 93, 'actinide', 'solid'], ['Pu', '鈽', 94, 'actinide', 'solid'],
  ['Am', '鋂', 95, 'actinide', 'solid'], ['Cm', '鋦', 96, 'actinide', 'solid'],
  ['Bk', '錇', 97, 'actinide', 'solid'], ['Cf', '鉲', 98, 'actinide', 'solid'],
  ['Es', '鑀', 99, 'actinide', 'solid'], ['Fm', '镄', 100, 'actinide', 'solid'],
  ['Md', '鍆', 101, 'actinide', 'solid'], ['No', '鍩', 102, 'actinide', 'solid'],
  ['Lr', '鐒', 103, 'actinide', 'solid'], ['Rf', '鑪', 104, 'transition', 'solid'],
  ['Db', '𨧀', 105, 'transition', 'solid'], ['Sg', '𨭎', 106, 'transition', 'solid'],
  ['Bh', '𨨏', 107, 'transition', 'solid'], ['Hs', '𨭆', 108, 'transition', 'solid'],
  ['Mt', '䥑', 109, 'transition', 'solid'], ['Ds', '鐽', 110, 'transition', 'solid'],
  ['Rg', '錀', 111, 'transition', 'solid'], ['Cn', '鎶', 112, 'transition', 'solid'],
  ['Nh', '鉨', 113, 'post', 'solid'], ['Fl', '鈇', 114, 'post', 'solid'],
  ['Mc', '鏌', 115, 'post', 'solid'], ['Lv', '鉝', 116, 'post', 'solid'],
  ['Ts', '鿬', 117, 'halogen', 'solid'], ['Og', '鿫', 118, 'noble', 'gas'],
]

const CATEGORY_ZH = {
  alkali: '鹼金屬',
  alkaline: '鹼土金屬',
  transition: '過渡金屬',
  post: '主族金屬',
  metalloid: '類金屬',
  nonmetal: '非金屬',
  halogen: '鹵素',
  noble: '稀有氣體',
  lanthanide: '鑭系',
  actinide: '錒系',
}
const STATE_ZH = { solid: '固態', liquid: '液態', gas: '氣態' }

export const elements = RAW.map(([symbol, name, number, category, state]) => ({
  symbol,
  name,
  number,
  category,
  state,
  icon: STATE_ICON[state] || '🪨',
  color: ELEMENT_COLOR[symbol] || CATEGORY_COLOR[category] || '#f1f5f9',
}))

export const elementBySymbol = Object.fromEntries(elements.map((e) => [e.symbol, e]))

export function getElementIntro(el) {
  if (!el) return ''
  const cat = CATEGORY_ZH[el.category] || el.category
  const st = STATE_ZH[el.state] || el.state
  return `${el.name}（${el.symbol}），原子序 ${el.number}。屬${cat}，常溫${st}。`
}
