/**
 * 十類化學反應 — 網頁可觸發對照（供 scripts/verify-reactions.mjs 與文件維護）
 * items: 實驗台 beaker 內物質格式
 */
export const reactionCatalog = [
  /* 1 化合 */
  { cat: 1, name: 'H₂+O₂→H₂O（混合）', items: ['H', 'O'], mode: 'mix', key: 'H+O' },
  { cat: 1, name: 'H₂+O₂→H₂O（燃燒）', items: ['H', 'O'], mode: 'burn', key: 'H+O' },
  { cat: 1, name: 'Mg+O₂→MgO', items: ['Mg', 'O'], mode: 'burn', key: 'Mg+O' },
  { cat: 1, name: 'C+O₂→CO₂', items: ['C', 'O'], mode: 'burn', key: 'C+O' },
  { cat: 1, name: 'H₂+Cl₂→HCl', items: ['H', 'Cl'], mode: 'mix', key: 'Cl+H' },
  /* 2 分解 */
  { cat: 2, name: '電解／加熱分解水', items: [{ type: 'compound', id: 'h2o' }], mode: 'mix', key: 'c:h2o', needsLamp: true },
  { cat: 2, name: 'CaCO₃高溫分解', items: [{ type: 'compound', id: 'caco3' }], mode: 'mix', key: 'c:caco3', needsLamp: true },
  { cat: 9, name: '火柴檢驗 CO₂（分解後）', items: [{ type: 'compound', id: 'cao' }, { type: 'compound', id: 'co2' }], mode: 'matchTest', key: 'c:cao+c:co2', note: '先加熱 CaCO₃，再劃燃火柴' },
  { cat: 9, name: '火柴檢驗 CO₂', items: [{ type: 'compound', id: 'co2' }], mode: 'matchTest', key: 'c:co2' },
  { cat: 9, name: '火柴檢驗 H₂', items: [{ type: 'compound', id: 'h2' }], mode: 'matchTest', key: 'c:h2' },
  { cat: 9, name: '火柴檢驗 O₂', items: [{ type: 'compound', id: 'o2' }], mode: 'matchTest', key: 'c:o2' },
  { cat: 9, name: '石灰水檢驗 CO₂', items: [{ type: 'compound', id: 'caoh2_aq' }, { type: 'compound', id: 'co2' }], mode: 'mix', key: 'c:caoh2_aq+c:co2', note: '需燒杯' },
  { cat: 9, name: '石蕊遇酸', items: [{ type: 'compound', id: 'litmus' }, { type: 'compound', id: 'hcl' }], mode: 'mix', key: 'c:litmus+c:hcl', note: '需燒杯' },
  { cat: 9, name: '石蕊遇鹼', items: [{ type: 'compound', id: 'litmus' }, { type: 'compound', id: 'naoh' }], mode: 'mix', key: 'c:litmus+c:naoh', note: '需燒杯' },
  { cat: 9, name: '酚酞遇鹼', items: [{ type: 'compound', id: 'phenolphthalein' }, { type: 'compound', id: 'naoh' }], mode: 'mix', key: 'c:phenolphthalein+c:naoh', note: '需燒杯' },
  /* 3 置換 */
  { cat: 3, name: 'Zn+鹽酸', items: ['Zn', { type: 'compound', id: 'hcl' }], mode: 'mix', key: 'Zn+c:hcl' },
  { cat: 3, name: 'Zn+稀硫酸', items: ['Zn', { type: 'compound', id: 'h2so4_dil' }], mode: 'mix', key: 'Zn+c:h2so4_dil' },
  { cat: 3, name: 'Fe+硫酸銅', items: ['Fe', { type: 'compound', id: 'cuso4_aq' }], mode: 'mix', key: 'Fe+c:cuso4_aq' },
  { cat: 3, name: 'Cu+硝酸銀', items: ['Cu', { type: 'compound', id: 'agno3' }], mode: 'mix', key: 'Cu+c:agno3' },
  /* 4 複分解 */
  { cat: 4, name: 'AgNO₃+NaCl', items: [{ type: 'compound', id: 'agno3' }, { type: 'compound', id: 'nacl_aq' }], mode: 'mix', key: 'c:agno3+c:nacl_aq' },
  { cat: 4, name: 'BaCl₂+稀硫酸', items: [{ type: 'compound', id: 'bacl2_aq' }, { type: 'compound', id: 'h2so4_dil' }], mode: 'mix', key: 'c:bacl2_aq+c:h2so4_dil' },
  { cat: 4, name: 'NaOH+HCl', items: [{ type: 'compound', id: 'naoh' }, { type: 'compound', id: 'hcl' }], mode: 'mix', key: 'c:naoh+c:hcl' },
  { cat: 4, name: 'CaCO₃+鹽酸', items: [{ type: 'compound', id: 'caco3' }, { type: 'compound', id: 'hcl' }], mode: 'mix', key: 'c:caco3+c:hcl' },
  /* 5 氧化還原 */
  { cat: 5, name: 'Cu+硝酸', items: ['Cu', { type: 'compound', id: 'hno3' }], mode: 'mix', key: 'Cu+c:hno3' },
  { cat: 5, name: 'KMnO₄+H₂O₂', items: [{ type: 'compound', id: 'kmno4_aq' }, { type: 'compound', id: 'h2o2_aq' }], mode: 'mix', key: 'c:kmno4_aq+c:h2o2_aq' },
  /* 6 中和（含指示劑呈色為動畫輔助） */
  { cat: 6, name: 'NaOH+稀硫酸', items: [{ type: 'compound', id: 'naoh' }, { type: 'compound', id: 'h2so4_dil' }], mode: 'mix', key: 'c:naoh+c:h2so4_dil' },
  /* 7 燃燒 */
  { cat: 7, name: 'CH₄+O₂', items: [{ type: 'compound', id: 'ch4' }, 'O'], mode: 'burn', key: 'c:ch4+O', note: '需先 C+H 混合解鎖 CH₄' },
  { cat: 7, name: 'C₂H₅OH+O₂', items: [{ type: 'compound', id: 'c2h5oh' }, 'O'], mode: 'burn', key: 'c:c2h5oh+O', note: '需先 C+H+O 混合解鎖乙醇' },
  /* 8 沉澱 */
  { cat: 8, name: 'Cu(OH)₂藍沉澱', items: [{ type: 'compound', id: 'naoh' }, { type: 'compound', id: 'cuso4_aq' }], mode: 'mix', key: 'c:naoh+c:cuso4_aq' },
  /* 9 氣體 */
  { cat: 9, name: 'Zn+鹽酸', items: ['Zn', { type: 'compound', id: 'hcl' }], mode: 'mix', key: 'Zn+c:hcl' },
  { cat: 2, name: 'KClO₃加熱', items: [{ type: 'compound', id: 'kclo3' }], mode: 'mix', key: 'c:kclo3', needsLamp: true },
  { cat: 10, name: 'MnO₂催化 H₂O₂', items: [{ type: 'compound', id: 'mno2' }, { type: 'compound', id: 'h2o2_aq' }], mode: 'mix', key: 'c:h2o2_aq+c:mno2' },
  /* 10 催化 */
  { cat: 10, name: 'KMnO₄催化 H₂O₂', items: [{ type: 'compound', id: 'kmno4_aq' }, { type: 'compound', id: 'h2o2_aq' }], mode: 'mix', key: 'c:kmno4_aq+c:h2o2_aq' },
]
