/**

 * 高中／大學常見化學式 — 可於 CHEM-IS-TRY 展示對照

 */

export const formulaCatalog = [

  { formula: 'H₂O', name: '水／蒸餾水', category: '溶劑', id: 'h2o', source: '通用' },

  { formula: 'HCl(aq)', name: '鹽酸', category: '酸', id: 'hcl', source: 'FSU' },

  { formula: 'H₂SO₄(濃)', name: '濃硫酸', category: '酸', id: 'h2so4_conc', source: 'docbrown' },

  { formula: 'H₂SO₄(稀)', name: '稀硫酸', category: '酸', id: 'h2so4_dil', source: 'docbrown' },

  { formula: 'HNO₃', name: '硝酸', category: '酸', id: 'hno3', source: 'docbrown' },

  { formula: 'H₃PO₄(稀)', name: '磷酸', category: '酸', id: 'h3po4_dil', source: 'Shiksha' },

  { formula: 'CH₃COOH', name: '乙酸', category: '有機酸', id: 'ch3cooh', source: 'Shiksha' },

  { formula: 'NaOH(aq)', name: '氫氧化鈉', category: '鹼', id: 'naoh', source: 'FSU' },

  { formula: 'KOH(aq)', name: '氫氧化鉀', category: '鹼', id: 'koh_aq', source: 'Pearson' },

  { formula: 'Ca(OH)₂(aq)', name: '澄清石灰水', category: '鹼', id: 'caoh2_aq', source: 'docbrown' },

  { formula: 'AgNO₃(aq)', name: '硝酸銀', category: '鹽', id: 'agno3', source: '沉澱' },

  { formula: 'NaCl(aq)', name: '氯化鈉溶液', category: '鹽', id: 'nacl_aq', source: 'FSU' },

  { formula: 'CuSO₄(aq)', name: '硫酸銅', category: '鹽', id: 'cuso4_aq', source: 'docbrown' },

  { formula: 'FeCl₃(aq)', name: '氯化鐵', category: '鹽', id: 'fecl3_aq', source: 'docbrown' },

  { formula: 'FeSO₄(aq)', name: '硫酸亞鐵', category: '鹽', id: 'feso4_aq', source: 'Shiksha' },

  { formula: 'BaCl₂(aq)', name: '氯化鋇', category: '鹽', id: 'bacl2_aq', source: '沉澱' },

  { formula: 'ZnSO₄(aq)', name: '硫酸鋅', category: '鹽', id: 'znso4_aq', source: 'Shiksha' },

  { formula: 'KMnO₄(aq)', name: '過錳酸鉀', category: '氧化劑', id: 'kmno4_aq', source: '氧化還原' },

  { formula: 'Na₂CO₃(aq)', name: '碳酸鈉', category: '鹽', id: 'na2co3_aq', source: 'docbrown' },

  { formula: 'H₂O₂(aq)', name: '過氧化氫', category: '氧化劑', id: 'h2o2_aq', source: '催化' },

  { formula: 'CaCO₃', name: '碳酸鈣', category: '鹽', id: 'caco3', source: 'docbrown' },

  { formula: 'NH₄Cl', name: '氯化銨', category: '鹽', id: 'nh4cl', source: 'Shiksha' },

  { formula: 'KNO₃', name: '硝酸鉀', category: '鹽', id: 'kno3', source: 'Shiksha' },

  { formula: 'KClO₃', name: '氯酸鉀', category: '鹽', id: 'kclo3', source: '分解' },

  { formula: 'MnO₂', name: '二氧化錳', category: '催化劑', id: 'mno2', source: 'H₂O₂分解' },

  { formula: 'C₆H₁₂O₆', name: '葡萄糖', category: '有機', id: 'c6h12o6', source: '有機' },

  { formula: '酚酞', name: '指示劑', category: '指示劑', id: 'phenolphthalein', source: '課本' },

  { formula: '石蕊', name: '石蕊', category: '指示劑', id: 'litmus', source: '課本' },



  { formula: 'NaCl', name: '氯化鈉', category: '鹽', id: 'nacl', source: '化合' },

  { formula: 'CO₂', name: '二氧化碳', category: '氣體', id: 'co2', source: '燃燒/酸鹽' },

  { formula: 'MgO', name: '氧化鎂', category: '氧化物', id: 'mgo', source: '燃燒' },

  { formula: 'Fe₂O₃', name: '氧化鐵', category: '氧化物', id: 'fe2o3', source: '氧化' },

  { formula: 'Al₂O₃', name: '氧化鋁', category: '氧化物', id: 'al2o3', source: '燃燒' },

  { formula: 'NH₃', name: '氨', category: '氣體', id: 'nh3', source: '化合' },

  { formula: 'CH₄', name: '甲烷', category: '有機', id: 'ch4', source: '化合' },

  { formula: 'H₂SO₄', name: '硫酸', category: '酸', id: 'h2so4', source: '合成' },

  { formula: 'CuO', name: '氧化銅', category: '氧化物', id: 'cuo', source: '燃燒' },

  { formula: 'AgCl', name: '氯化銀', category: '沉澱', id: 'agcl', source: 'FSU' },

  { formula: 'Cu(NO₃)₂', name: '硝酸銅', category: '鹽', id: 'cu_no3', source: '氧化' },

  { formula: 'BaSO₄', name: '硫酸鋇', category: '沉澱', id: 'baso4', source: 'FSU' },

  { formula: 'CaSO₄', name: '硫酸鈣', category: '沉澱', id: 'caso4', source: 'docbrown' },

  { formula: 'PbCl₂', name: '氯化鉛', category: '沉澱', id: 'pbcl2', source: '溶解度' },

  { formula: 'PbSO₄', name: '硫酸鉛', category: '沉澱', id: 'pbso4', source: '溶解度' },

  { formula: 'CaCl₂(aq)', name: '氯化鈣', category: '鹽', id: 'cacl2_aq', source: '酸鹽' },

  { formula: 'ZnCl₂', name: '氯化鋅', category: '鹽', id: 'zncl2', source: '置換' },

  { formula: 'SO₂', name: '二氧化硫', category: '氣體', id: 'so2', source: '燃燒' },

  { formula: 'C₂H₅OH', name: '乙醇', category: '有機', id: 'c2h5oh', source: '有機' },

  { formula: 'CH₃COONa', name: '乙酸鈉', category: '鹽', id: 'ch3coona', source: '中和' },

  { formula: 'O₃', name: '臭氧', category: '氣體', id: 'o3', source: '放電' },

  { formula: 'H₂', name: '氫氣', category: '氣體', id: 'h2', source: '分解' },

  { formula: 'NaNO₃', name: '硝酸鈉', category: '鹽', id: 'nano3', source: '中和' },

  { formula: 'Cu(OH)₂', name: '氫氧化銅', category: '沉澱', id: 'cu_oh2', source: '沉澱' },

  { formula: 'Fe(OH)₂', name: '氫氧化亞鐵', category: '沉澱', id: 'fe_oh2', source: '沉澱' },

  { formula: 'FeCl₂(aq)', name: '氯化亞鐵', category: '鹽', id: 'fecl2_aq', source: '置換' },

  { formula: 'KCl', name: '氯化鉀', category: '鹽', id: 'kcl', source: '分解' },



  { formula: 'H₂CO₃', name: '碳酸', category: '酸', id: null, source: 'Shiksha', note: '水溶液中不稳定，以 CO₂ 水溶液示意' },

]


