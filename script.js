/**
 * ═══════════════════════════════════════════════════════════════
 *  PERIODIC TABLE — Interactive 3D  ·  Sourav Biswas
 *  Pure vanilla JS — no module bundler, no external animation lib
 *
 *  Architecture:
 *   • TABLE mode  → #stage is display:grid, cards placed by CSS grid
 *                   zero JS transforms on cards
 *   • 3D modes    → #stage is display:block (mode-3d class)
 *                   cards get position:absolute + translate3d via JS
 *   • Mouse tilt  → rotateX/Y on #stage (rAF lerp loop)
 *   • Card sizing → fitTable() reads real #scene size via getBCR
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────────────────────
   1. ELEMENT DATA
   Format per element (stride = 9):
   [symbol, name, colorIdx, gridCol, gridRow, mass, density, melt, boil]
────────────────────────────────────────────────────────────── */
const EL = [
  'H','Hydrogen',0,1,1,1.008,0.09,-259,-253,
  'He','Helium',1,18,1,4.003,0.18,-272,-269,
  'Li','Lithium',2,1,2,6.94,0.53,181,1330,
  'Be','Beryllium',3,2,2,9.012,1.85,1287,2469,
  'B','Boron',4,13,2,10.81,2.08,2076,3927,
  'C','Carbon',0,14,2,12.011,1.82,null,null,
  'N','Nitrogen',0,15,2,14.007,1.25,-210,-196,
  'O','Oxygen',0,16,2,15.999,1.43,-219,-183,
  'F','Fluorine',0,17,2,18.998,1.70,-220,-188,
  'Ne','Neon',1,18,2,20.18,0.90,-249,-246,
  'Na','Sodium',2,1,3,22.99,0.97,98,883,
  'Mg','Magnesium',3,2,3,24.305,1.74,650,1090,
  'Al','Aluminium',5,13,3,26.982,2.70,660,2470,
  'Si','Silicon',4,14,3,28.085,2.33,1414,3265,
  'P','Phosphorus',0,15,3,30.974,1.82,null,null,
  'S','Sulfur',0,16,3,32.06,2.07,115,445,
  'Cl','Chlorine',0,17,3,35.45,3.20,-102,-34,
  'Ar','Argon',1,18,3,39.948,1.78,-189,-186,
  'K','Potassium',2,1,4,39.098,0.86,64,759,
  'Ca','Calcium',3,2,4,40.078,1.55,842,1484,
  'Sc','Scandium',6,3,4,44.956,2.99,1541,2836,
  'Ti','Titanium',6,4,4,47.867,4.51,1668,3287,
  'V','Vanadium',6,5,4,50.942,6.00,1910,3407,
  'Cr','Chromium',6,6,4,51.996,7.19,1907,2671,
  'Mn','Manganese',6,7,4,54.938,7.21,1246,2061,
  'Fe','Iron',6,8,4,55.845,7.87,1538,2861,
  'Co','Cobalt',6,9,4,58.933,8.90,1495,2927,
  'Ni','Nickel',6,10,4,58.693,8.91,1455,2730,
  'Cu','Copper',6,11,4,63.546,8.96,1085,2562,
  'Zn','Zinc',5,12,4,65.38,7.14,420,907,
  'Ga','Gallium',5,13,4,69.723,5.91,30,2400,
  'Ge','Germanium',4,14,4,72.63,5.32,938,2833,
  'As','Arsenic',4,15,4,74.922,5.73,null,null,
  'Se','Selenium',0,16,4,78.971,4.81,221,685,
  'Br','Bromine',0,17,4,79.904,3.10,-7,59,
  'Kr','Krypton',1,18,4,83.798,3.75,-157,-153,
  'Rb','Rubidium',2,1,5,85.468,1.53,39,688,
  'Sr','Strontium',3,2,5,87.62,2.64,777,1377,
  'Y','Yttrium',6,3,5,88.906,4.47,1526,2930,
  'Zr','Zirconium',6,4,5,91.224,6.52,1855,4377,
  'Nb','Niobium',6,5,5,92.906,8.57,2477,4744,
  'Mo','Molybdenum',6,6,5,95.95,10.28,2623,4639,
  'Tc','Technetium',6,7,5,98,11.00,2157,4265,
  'Ru','Ruthenium',6,8,5,101.07,12.45,2334,4150,
  'Rh','Rhodium',6,9,5,102.91,12.41,1964,3695,
  'Pd','Palladium',6,10,5,106.42,12.02,1555,2963,
  'Ag','Silver',6,11,5,107.87,10.49,962,2162,
  'Cd','Cadmium',5,12,5,112.41,8.65,321,767,
  'In','Indium',5,13,5,114.82,7.31,157,2072,
  'Sn','Tin',5,14,5,118.71,7.37,232,2602,
  'Sb','Antimony',4,15,5,121.76,6.70,631,1635,
  'Te','Tellurium',4,16,5,127.60,6.24,450,988,
  'I','Iodine',0,17,5,126.90,4.93,114,184,
  'Xe','Xenon',1,18,5,131.29,5.89,-112,-108,
  'Cs','Cesium',2,1,6,132.91,1.93,29,671,
  'Ba','Barium',3,2,6,137.33,3.51,727,1845,
  'Hf','Hafnium',6,4,6,178.49,13.31,2233,4603,
  'Ta','Tantalum',6,5,6,180.95,16.69,3017,5458,
  'W','Tungsten',6,6,6,183.84,19.25,3422,5930,
  'Re','Rhenium',6,7,6,186.21,21.02,3186,5596,
  'Os','Osmium',6,8,6,190.23,22.59,3033,5012,
  'Ir','Iridium',6,9,6,192.22,22.56,2446,4130,
  'Pt','Platinum',6,10,6,195.08,21.45,1768,3825,
  'Au','Gold',6,11,6,196.97,19.30,1064,2970,
  'Hg','Mercury',5,12,6,200.59,13.53,-39,357,
  'Tl','Thallium',5,13,6,204.38,11.85,304,1473,
  'Pb','Lead',5,14,6,207.20,11.34,327,1749,
  'Bi','Bismuth',5,15,6,208.98,9.78,272,1564,
  'Po','Polonium',4,16,6,209,9.20,254,962,
  'At','Astatine',0,17,6,210,6.35,302,337,
  'Rn','Radon',1,18,6,222,9.73,-71,-62,
  'Fr','Francium',2,1,7,223,1.87,27,677,
  'Ra','Radium',3,2,7,226,5.50,960,1737,
  'Rf','Rutherfordium',6,4,7,267,23.2,null,null,
  'Db','Dubnium',6,5,7,268,29.3,null,null,
  'Sg','Seaborgium',6,6,7,269,35.0,null,null,
  'Bh','Bohrium',6,7,7,270,37.1,null,null,
  'Hs','Hassium',6,8,7,269,40.7,null,null,
  'Mt','Meitnerium',9,9,7,278,37.4,null,null,
  'Ds','Darmstadtium',9,10,7,281,34.8,null,null,
  'Rg','Roentgenium',9,11,7,282,28.7,null,null,
  'Cn','Copernicium',9,12,7,285,14.0,null,null,
  'Nh','Nihonium',9,13,7,286,16.0,427,1157,
  'Fl','Flerovium',9,14,7,289,14.0,67,147,
  'Mc','Moscovium',9,15,7,289,13.5,397,1127,
  'Lv','Livermorium',9,16,7,293,12.9,436,812,
  'Ts','Tennessine',9,17,7,294,7.17,null,null,
  'Og','Oganesson',9,18,7,294,4.95,null,null,
  'La','Lanthanum',7,3,8,138.91,6.16,920,3464,
  'Ce','Cerium',7,4,8,140.12,6.77,795,3443,
  'Pr','Praseodymium',7,5,8,140.91,6.77,935,3130,
  'Nd','Neodymium',7,6,8,144.24,7.01,1024,3074,
  'Pm','Promethium',7,7,8,145,7.26,1042,3000,
  'Sm','Samarium',7,8,8,150.36,7.52,1072,1900,
  'Eu','Europium',7,9,8,151.96,5.26,826,1529,
  'Gd','Gadolinium',7,10,8,157.25,7.90,1312,3000,
  'Tb','Terbium',7,11,8,158.93,8.23,1356,3123,
  'Dy','Dysprosium',7,12,8,162.50,8.54,1407,2567,
  'Ho','Holmium',7,13,8,164.93,8.79,1461,2600,
  'Er','Erbium',7,14,8,167.26,9.07,1529,2868,
  'Tm','Thulium',7,15,8,168.93,9.32,1545,1950,
  'Yb','Ytterbium',7,16,8,173.04,6.90,824,1196,
  'Lu','Lutetium',7,17,8,174.97,9.84,1652,3402,
  'Ac','Actinium',8,3,9,227,10.0,1227,3227,
  'Th','Thorium',8,4,9,232.04,11.72,1750,4788,
  'Pa','Protactinium',8,5,9,231.04,15.37,1568,4027,
  'U','Uranium',8,6,9,238.03,19.10,1132,4131,
  'Np','Neptunium',8,7,9,237,20.45,639,4174,
  'Pu','Plutonium',8,8,9,244,19.82,639,3232,
  'Am','Americium',8,9,9,243,12.0,1176,2607,
  'Cm','Curium',8,10,9,247,13.51,1340,3110,
  'Bk','Berkelium',8,11,9,247,14.78,986,2627,
  'Cf','Californium',8,12,9,251,15.10,900,1470,
  'Es','Einsteinium',8,13,9,252,8.84,860,996,
  'Fm','Fermium',8,14,9,257,null,null,null,
  'Md','Mendelevium',8,15,9,258,null,null,null,
  'No','Nobelium',8,16,9,259,null,null,null,
  'Lr','Lawrencium',8,17,9,266,null,null,null,
];
const STRIDE = 9;
const COUNT  = EL.length / STRIDE;

/* ──────────────────────────────────────────────────────────────
   2. EXTENDED INFO (category, phase, electronegativity, config,
                     discovery, fun fact)
────────────────────────────────────────────────────────────── */
const INFO = {
  H:  {cat:'nonmetal',      ph:'Gas',     en:2.20, cfg:'1s¹',              disc:'1766, H. Cavendish',    fun:'Most abundant element — stars are mostly hydrogen fusion.'},
  He: {cat:'noble',         ph:'Gas',     en:null, cfg:'1s²',              disc:'1868, Janssen & Lockyer',fun:'Discovered on the Sun before it was found on Earth.'},
  Li: {cat:'alkali',        ph:'Solid',   en:0.98, cfg:'[He] 2s¹',         disc:'1817, Arfwedson',       fun:'So light it floats on water — and then reacts violently with it.'},
  Be: {cat:'alkaline',      ph:'Solid',   en:1.57, cfg:'[He] 2s²',         disc:'1798, Vauquelin',       fun:'Used in spacecraft windows; transmits X-rays exceptionally well.'},
  B:  {cat:'metalloid',     ph:'Solid',   en:2.04, cfg:'[He] 2s² 2p¹',     disc:'1808, Gay-Lussac',      fun:'Key ingredient in heat-resistant borosilicate glass.'},
  C:  {cat:'nonmetal',      ph:'Solid',   en:2.55, cfg:'[He] 2s² 2p²',     disc:'Prehistoric',           fun:'Diamond and graphite — both pure carbon, worlds apart in hardness.'},
  N:  {cat:'nonmetal',      ph:'Gas',     en:3.04, cfg:'[He] 2s² 2p³',     disc:'1772, D. Rutherford',   fun:'78% of our atmosphere, yet mostly inert — a silent giant.'},
  O:  {cat:'nonmetal',      ph:'Gas',     en:3.44, cfg:'[He] 2s² 2p⁴',     disc:'1774, C.W. Scheele',    fun:'Third most abundant element in the universe by mass.'},
  F:  {cat:'nonmetal',      ph:'Gas',     en:3.98, cfg:'[He] 2s² 2p⁵',     disc:'1886, H. Moissan',      fun:'Most electronegative element; reacts with nearly everything.'},
  Ne: {cat:'noble',         ph:'Gas',     en:null, cfg:'[He] 2s² 2p⁶',     disc:'1898, W. Ramsay',       fun:'"Neos" means new in Greek — it was a brand-new kind of element.'},
  Na: {cat:'alkali',        ph:'Solid',   en:0.93, cfg:'[Ne] 3s¹',          disc:'1807, H. Davy',         fun:'Must be stored in oil to prevent explosive contact with water.'},
  Mg: {cat:'alkaline',      ph:'Solid',   en:1.31, cfg:'[Ne] 3s²',          disc:'1755, J. Black',        fun:'Burns with a blinding white flame — used in old camera flash.'},
  Al: {cat:'post-transition',ph:'Solid',  en:1.61, cfg:'[Ne] 3s² 3p¹',     disc:'1825, H.C. Ørsted',     fun:'Most abundant metal in Earth\'s crust — yet was once rarer than gold.'},
  Si: {cat:'metalloid',     ph:'Solid',   en:1.90, cfg:'[Ne] 3s² 3p²',     disc:'1824, Berzelius',       fun:'The backbone of modern computing — every chip starts with silicon.'},
  P:  {cat:'nonmetal',      ph:'Solid',   en:2.19, cfg:'[Ne] 3s² 3p³',     disc:'1669, H. Brand',        fun:'First element discovered by a known person; glowed green in the dark.'},
  S:  {cat:'nonmetal',      ph:'Solid',   en:2.58, cfg:'[Ne] 3s² 3p⁴',     disc:'Prehistoric',           fun:'The "brimstone" of the Bible — humans have known it for millennia.'},
  Cl: {cat:'nonmetal',      ph:'Gas',     en:3.16, cfg:'[Ne] 3s² 3p⁵',     disc:'1774, Scheele',         fun:'Chemical weapon in WWI; now purifies the water you drink.'},
  Ar: {cat:'noble',         ph:'Gas',     en:null, cfg:'[Ne] 3s² 3p⁶',     disc:'1894, Rayleigh',        fun:'Third most abundant gas in Earth\'s atmosphere at 0.93%.'},
  K:  {cat:'alkali',        ph:'Solid',   en:0.82, cfg:'[Ar] 4s¹',          disc:'1807, H. Davy',         fun:'Symbol K from "kalium" — Neo-Latin for alkali plant ash.'},
  Ca: {cat:'alkaline',      ph:'Solid',   en:1.00, cfg:'[Ar] 4s²',          disc:'1808, H. Davy',         fun:'5th most abundant element in Earth\'s crust; essential for bones.'},
  Sc: {cat:'transition',    ph:'Solid',   en:1.36, cfg:'[Ar] 3d¹ 4s²',     disc:'1879, L. Nilson',       fun:'Alloyed with aluminium to make lightweight sports equipment frames.'},
  Ti: {cat:'transition',    ph:'Solid',   en:1.54, cfg:'[Ar] 3d² 4s²',     disc:'1791, W. Gregor',       fun:'As strong as steel but 45% lighter — the aerospace wonder metal.'},
  V:  {cat:'transition',    ph:'Solid',   en:1.63, cfg:'[Ar] 3d³ 4s²',     disc:'1801, del Río',         fun:'Named after Vanadis, the Norse goddess of beauty and fertility.'},
  Cr: {cat:'transition',    ph:'Solid',   en:1.66, cfg:'[Ar] 3d⁵ 4s¹',    disc:'1798, Vauquelin',       fun:'The chromium in stainless steel is what makes it stainless.'},
  Mn: {cat:'transition',    ph:'Solid',   en:1.55, cfg:'[Ar] 3d⁵ 4s²',    disc:'1774, J. Gahn',         fun:'Found in colossal quantities on the deep ocean floor.'},
  Fe: {cat:'transition',    ph:'Solid',   en:1.83, cfg:'[Ar] 3d⁶ 4s²',    disc:'Prehistoric',           fun:'Earth\'s inner core is a solid iron-nickel ball — our magnetic shield.'},
  Co: {cat:'transition',    ph:'Solid',   en:1.88, cfg:'[Ar] 3d⁷ 4s²',    disc:'1735, G. Brandt',       fun:'Gives brilliant blue to glass and ceramics for thousands of years.'},
  Ni: {cat:'transition',    ph:'Solid',   en:1.91, cfg:'[Ar] 3d⁸ 4s²',    disc:'1751, Cronstedt',       fun:'The US 5-cent "nickel" coin is actually 75% copper.'},
  Cu: {cat:'transition',    ph:'Solid',   en:1.90, cfg:'[Ar] 3d¹⁰ 4s¹',   disc:'Prehistoric',           fun:'First metal worked by humans over 10,000 years ago.'},
  Zn: {cat:'post-transition',ph:'Solid',  en:1.65, cfg:'[Ar] 3d¹⁰ 4s²',   disc:'1746, Marggraf',        fun:'Galvanising steel with zinc prevents rust on bridges worldwide.'},
  Ga: {cat:'post-transition',ph:'Solid',  en:1.81, cfg:'[Ar] 3d¹⁰ 4s² 4p¹',disc:'1875, P. Lecoq',      fun:'Melts right in your hand — its melting point is just 29.76°C.'},
  Ge: {cat:'metalloid',     ph:'Solid',   en:2.01, cfg:'[Ar] 3d¹⁰ 4s² 4p²',disc:'1886, C. Winkler',     fun:'Predicted by Mendeleev before its discovery — confirmed the table.'},
  As: {cat:'metalloid',     ph:'Solid',   en:2.18, cfg:'[Ar] 3d¹⁰ 4s² 4p³',disc:'Antiquity',            fun:'The Renaissance poison of choice — colourless, tasteless, and lethal.'},
  Se: {cat:'nonmetal',      ph:'Solid',   en:2.55, cfg:'[Ar] 3d¹⁰ 4s² 4p⁴',disc:'1817, Berzelius',      fun:'Named after Selene, Greek goddess of the Moon.'},
  Br: {cat:'nonmetal',      ph:'Liquid',  en:2.96, cfg:'[Ar] 3d¹⁰ 4s² 4p⁵',disc:'1826, A. Balard',      fun:'One of only two elements that are liquid at room temperature.'},
  Kr: {cat:'noble',         ph:'Gas',     en:3.00, cfg:'[Ar] 3d¹⁰ 4s² 4p⁶',disc:'1898, Ramsay',         fun:'Used in high-powered lasers and specialised lighting systems.'},
  Rb: {cat:'alkali',        ph:'Solid',   en:0.82, cfg:'[Kr] 5s¹',          disc:'1861, Bunsen',          fun:'Ignites spontaneously in air and explodes violently with water.'},
  Sr: {cat:'alkaline',      ph:'Solid',   en:0.95, cfg:'[Kr] 5s²',          disc:'1790, Crawford',        fun:'Strontium salts give fireworks their brilliant crimson-red colour.'},
  Y:  {cat:'transition',    ph:'Solid',   en:1.22, cfg:'[Kr] 4d¹ 5s²',     disc:'1794, Gadolin',         fun:'Named after Ytterby — a Swedish village that names four elements.'},
  Zr: {cat:'transition',    ph:'Solid',   en:1.33, cfg:'[Kr] 4d² 5s²',     disc:'1789, Klaproth',        fun:'Cubic zirconia, its synthetic oxide, mimics diamonds brilliantly.'},
  Nb: {cat:'transition',    ph:'Solid',   en:1.60, cfg:'[Kr] 4d⁴ 5s¹',    disc:'1801, Hatchett',        fun:'Makes superconducting magnets for MRI machines and particle colliders.'},
  Mo: {cat:'transition',    ph:'Solid',   en:2.16, cfg:'[Kr] 4d⁵ 5s¹',    disc:'1781, Hjelm',           fun:'One of the highest melting points among all the elements.'},
  Tc: {cat:'transition',    ph:'Solid',   en:1.90, cfg:'[Kr] 4d⁵ 5s²',    disc:'1937, Segrè',           fun:'First element to be artificially created — all isotopes radioactive.'},
  Ru: {cat:'transition',    ph:'Solid',   en:2.20, cfg:'[Kr] 4d⁷ 5s¹',    disc:'1844, Claus',           fun:'Named after Ruthenia, the Medieval Latin name for Russia.'},
  Rh: {cat:'transition',    ph:'Solid',   en:2.28, cfg:'[Kr] 4d⁸ 5s¹',    disc:'1803, Wollaston',       fun:'One of the rarest and most expensive metals on Earth.'},
  Pd: {cat:'transition',    ph:'Solid',   en:2.20, cfg:'[Kr] 4d¹⁰',        disc:'1803, Wollaston',       fun:'Catalytic converters use palladium to clean your car\'s exhaust.'},
  Ag: {cat:'transition',    ph:'Solid',   en:1.93, cfg:'[Kr] 4d¹⁰ 5s¹',   disc:'Prehistoric',           fun:'Highest electrical and thermal conductivity of all the metals.'},
  Cd: {cat:'post-transition',ph:'Solid',  en:1.69, cfg:'[Kr] 4d¹⁰ 5s²',   disc:'1817, Leberecht',       fun:'Powers the rechargeable nickel-cadmium batteries of our world.'},
  In: {cat:'post-transition',ph:'Solid',  en:1.78, cfg:'[Kr] 4d¹⁰ 5s² 5p¹',disc:'1863, Richter',        fun:'Emits a haunting high-pitched cry when you bend a bar of it.'},
  Sn: {cat:'post-transition',ph:'Solid',  en:1.96, cfg:'[Kr] 4d¹⁰ 5s² 5p²',disc:'Prehistoric',          fun:'"Tin pest" crumbles it in cold — may have doomed Napoleon\'s Russia campaign.'},
  Sb: {cat:'metalloid',     ph:'Solid',   en:2.05, cfg:'[Kr] 4d¹⁰ 5s² 5p³',disc:'Antiquity',            fun:'Used as eye makeup (kohl) in ancient Egypt over 5,000 years ago.'},
  Te: {cat:'metalloid',     ph:'Solid',   en:2.10, cfg:'[Kr] 4d¹⁰ 5s² 5p⁴',disc:'1782, Müller',         fun:'Causes an unmistakable garlic-like odour even in microscopic amounts.'},
  I:  {cat:'nonmetal',      ph:'Solid',   en:2.66, cfg:'[Kr] 4d¹⁰ 5s² 5p⁵',disc:'1811, Courtois',       fun:'Essential for thyroid function; deficiency causes goiter.'},
  Xe: {cat:'noble',         ph:'Gas',     en:2.60, cfg:'[Kr] 4d¹⁰ 5s² 5p⁶',disc:'1898, Ramsay',         fun:'Ion drives for deep-space probes use xenon as propellant.'},
  Cs: {cat:'alkali',        ph:'Solid',   en:0.79, cfg:'[Xe] 6s¹',          disc:'1860, Bunsen',          fun:'Atomic clocks use cesium oscillations — it literally defines the second.'},
  Ba: {cat:'alkaline',      ph:'Solid',   en:0.89, cfg:'[Xe] 6s²',          disc:'1808, H. Davy',         fun:'Barium sulfate is swallowed to make your gut visible in X-rays.'},
  Hf: {cat:'transition',    ph:'Solid',   en:1.30, cfg:'[Xe] 4f¹⁴ 5d² 6s²',disc:'1923, Coster',         fun:'Nuclear reactor control rods use hafnium to absorb neutrons.'},
  Ta: {cat:'transition',    ph:'Solid',   en:1.50, cfg:'[Xe] 4f¹⁴ 5d³ 6s²',disc:'1802, Ekeberg',        fun:'Biocompatible — surgeons use it for bone repair and implants.'},
  W:  {cat:'transition',    ph:'Solid',   en:2.36, cfg:'[Xe] 4f¹⁴ 5d⁴ 6s²',disc:'1783, Elhuyar',        fun:'Highest melting point of all elements — old light bulb filaments.'},
  Re: {cat:'transition',    ph:'Solid',   en:1.90, cfg:'[Xe] 4f¹⁴ 5d⁵ 6s²',disc:'1925, Noddack',        fun:'One of the rarest elements in Earth\'s continental crust.'},
  Os: {cat:'transition',    ph:'Solid',   en:2.20, cfg:'[Xe] 4f¹⁴ 5d⁶ 6s²',disc:'1803, Tennant',        fun:'Densest naturally occurring element — twice as dense as lead.'},
  Ir: {cat:'transition',    ph:'Solid',   en:2.20, cfg:'[Xe] 4f¹⁴ 5d⁷ 6s²',disc:'1803, Tennant',        fun:'Most corrosion-resistant metal; named after the rainbow goddess Iris.'},
  Pt: {cat:'transition',    ph:'Solid',   en:2.28, cfg:'[Xe] 4f¹⁴ 5d⁹ 6s¹',disc:'1735, de Ulloa',       fun:'Used in catalytic converters, fuel cells, and platinum cancer drugs.'},
  Au: {cat:'transition',    ph:'Solid',   en:2.54, cfg:'[Xe] 4f¹⁴ 5d¹⁰ 6s¹',disc:'Prehistoric',         fun:'Every gram of gold on Earth arrived via meteorite 3.9 billion years ago.'},
  Hg: {cat:'post-transition',ph:'Liquid', en:2.00, cfg:'[Xe] 4f¹⁴ 5d¹⁰ 6s²',disc:'Antiquity',           fun:'The only metal that exists as a liquid at room temperature.'},
  Tl: {cat:'post-transition',ph:'Solid',  en:1.62, cfg:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹',disc:'1861, Crookes',  fun:'Extremely toxic — once infamously used as a tasteless rat poison.'},
  Pb: {cat:'post-transition',ph:'Solid',  en:2.33, cfg:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²',disc:'Prehistoric',     fun:'Roman lead pipes and vessels may have slowly poisoned an empire.'},
  Bi: {cat:'post-transition',ph:'Solid',  en:2.02, cfg:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³',disc:'1753, Geoffroy',  fun:'Grows into mesmerising iridescent staircase-shaped crystals.'},
  Po: {cat:'metalloid',     ph:'Solid',   en:2.00, cfg:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴',disc:'1898, M. Curie',  fun:'Discovered and named by Marie Curie after her homeland Poland.'},
  At: {cat:'nonmetal',      ph:'Solid',   en:2.20, cfg:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵',disc:'1940, Corson',    fun:'Rarest naturally occurring element — at most ~28g exists on Earth at once.'},
  Rn: {cat:'noble',         ph:'Gas',     en:null, cfg:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶',disc:'1900, F. Dorn',   fun:'Odourless radioactive gas from rocks can accumulate in basements.'},
  Fr: {cat:'alkali',        ph:'Solid',   en:0.70, cfg:'[Rn] 7s¹',          disc:'1939, M. Perey',        fun:'At any moment, fewer than 30 grams of francium exist on all of Earth.'},
  Ra: {cat:'alkaline',      ph:'Solid',   en:0.90, cfg:'[Rn] 7s²',          disc:'1898, M. Curie',        fun:'Glows a faint blue-white — its radioactivity excites the surrounding air.'},
  Rf: {cat:'transition',    ph:'Solid',   en:null, cfg:'[Rn] 5f¹⁴ 6d² 7s²',disc:'1964, Dubna',           fun:'Named after Ernest Rutherford, pioneer of nuclear physics.'},
  Db: {cat:'transition',    ph:'Solid',   en:null, cfg:'[Rn] 5f¹⁴ 6d³ 7s²',disc:'1970, Dubna',           fun:'Properties mostly theoretical — only a handful of atoms created so far.'},
  Sg: {cat:'transition',    ph:'Solid',   en:null, cfg:'[Rn] 5f¹⁴ 6d⁴ 7s²',disc:'1974, LBNL',            fun:'Named after Glenn Seaborg, the only person after whom a living element was named.'},
  Bh: {cat:'transition',    ph:'Solid',   en:null, cfg:'[Rn] 5f¹⁴ 6d⁵ 7s²',disc:'1981, GSI',             fun:'Named after Niels Bohr, father of quantum atomic theory.'},
  Hs: {cat:'transition',    ph:'Solid',   en:null, cfg:'[Rn] 5f¹⁴ 6d⁶ 7s²',disc:'1984, GSI',             fun:'Named after Hessen, the German state where it was created.'},
  Mt: {cat:'transition',    ph:'Unknown', en:null, cfg:'[Rn] 5f¹⁴ 6d⁷ 7s²',disc:'1982, GSI',             fun:'Named after Lise Meitner, co-discoverer of nuclear fission.'},
  Ds: {cat:'transition',    ph:'Unknown', en:null, cfg:'[Rn] 5f¹⁴ 6d⁹ 7s¹',disc:'1994, GSI',             fun:'Named after Darmstadt, the German city where it was created.'},
  Rg: {cat:'transition',    ph:'Unknown', en:null, cfg:'[Rn] 5f¹⁴ 6d¹⁰ 7s¹',disc:'1994, GSI',            fun:'Named after Wilhelm Röntgen, the discoverer of X-rays.'},
  Cn: {cat:'transition',    ph:'Gas',     en:null, cfg:'[Rn] 5f¹⁴ 6d¹⁰ 7s²',disc:'1996, GSI',            fun:'Named after Nicolaus Copernicus, who showed Earth orbits the Sun.'},
  Nh: {cat:'post-transition',ph:'Unknown',en:null, cfg:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹',disc:'2004, RIKEN',      fun:'First element discovered in Asia; named for Japan (Nihon).'},
  Fl: {cat:'post-transition',ph:'Unknown',en:null, cfg:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²',disc:'1999, Dubna',      fun:'Named after Flerov Laboratory of Nuclear Reactions in Dubna.'},
  Mc: {cat:'post-transition',ph:'Unknown',en:null, cfg:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³',disc:'2003, Dubna/LLNL', fun:'Named after Moscow Oblast, where the Dubna facility stands.'},
  Lv: {cat:'post-transition',ph:'Unknown',en:null, cfg:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴',disc:'2000, Dubna/LLNL', fun:'Named after Lawrence Livermore National Laboratory, California.'},
  Ts: {cat:'nonmetal',      ph:'Unknown', en:null, cfg:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵',disc:'2010, Dubna/LLNL', fun:'Named after Tennessee, home to Vanderbilt University and ORNL.'},
  Og: {cat:'noble',         ph:'Unknown', en:null, cfg:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶',disc:'2002, Dubna/LLNL', fun:'Named after Yuri Oganessian, pioneer of superheavy element research.'},
  La: {cat:'lanthanide',    ph:'Solid',   en:1.10, cfg:'[Xe] 5d¹ 6s²',     disc:'1839, Mosander',        fun:'First lanthanide — its name means "to lie hidden" in Greek.'},
  Ce: {cat:'lanthanide',    ph:'Solid',   en:1.12, cfg:'[Xe] 4f¹ 5d¹ 6s²',disc:'1803, Berzelius',        fun:'Named after the dwarf planet Ceres, discovered around the same time.'},
  Pr: {cat:'lanthanide',    ph:'Solid',   en:1.13, cfg:'[Xe] 4f³ 6s²',     disc:'1885, von Welsbach',    fun:'Its salts dye glass and ceramics a distinctive yellow-green.'},
  Nd: {cat:'lanthanide',    ph:'Solid',   en:1.14, cfg:'[Xe] 4f⁴ 6s²',     disc:'1885, von Welsbach',    fun:'Neodymium magnets — the strongest permanent magnets ever made.'},
  Pm: {cat:'lanthanide',    ph:'Solid',   en:1.13, cfg:'[Xe] 4f⁵ 6s²',     disc:'1945, Marinsky',        fun:'Only lanthanide with no stable isotopes — all are radioactive.'},
  Sm: {cat:'lanthanide',    ph:'Solid',   en:1.17, cfg:'[Xe] 4f⁶ 6s²',     disc:'1879, Lecoq',           fun:'Samarium-cobalt magnets maintain strength up to 300°C.'},
  Eu: {cat:'lanthanide',    ph:'Solid',   en:1.20, cfg:'[Xe] 4f⁷ 6s²',     disc:'1901, Demarçay',        fun:'Makes the red in euro banknotes glow under UV — anti-counterfeiting magic.'},
  Gd: {cat:'lanthanide',    ph:'Solid',   en:1.20, cfg:'[Xe] 4f⁷ 5d¹ 6s²',disc:'1880, Galissard',       fun:'MRI contrast agents use gadolinium to make organs visible.'},
  Tb: {cat:'lanthanide',    ph:'Solid',   en:1.20, cfg:'[Xe] 4f⁹ 6s²',     disc:'1843, Mosander',        fun:'One of four elements named after the tiny village Ytterby, Sweden.'},
  Dy: {cat:'lanthanide',    ph:'Solid',   en:1.22, cfg:'[Xe] 4f¹⁰ 6s²',    disc:'1886, Lecoq',           fun:'"Hard to get" in Greek — it was genuinely hard to isolate.'},
  Ho: {cat:'lanthanide',    ph:'Solid',   en:1.23, cfg:'[Xe] 4f¹¹ 6s²',    disc:'1878, Delafontaine',    fun:'Named after Holmia, the Medieval Latin name for Stockholm.'},
  Er: {cat:'lanthanide',    ph:'Solid',   en:1.24, cfg:'[Xe] 4f¹² 6s²',    disc:'1843, Mosander',        fun:'Gives glass and crystal a beautiful pink tint; amplifies fibre-optic signals.'},
  Tm: {cat:'lanthanide',    ph:'Solid',   en:1.25, cfg:'[Xe] 4f¹³ 6s²',    disc:'1879, P. Cleve',        fun:'Named after Thule — the ancient Greek name for the far north.'},
  Yb: {cat:'lanthanide',    ph:'Solid',   en:1.10, cfg:'[Xe] 4f¹⁴ 6s²',    disc:'1878, Galissard',       fun:'Powers the most precise atomic clocks ever built by humanity.'},
  Lu: {cat:'lanthanide',    ph:'Solid',   en:1.27, cfg:'[Xe] 4f¹⁴ 5d¹ 6s²',disc:'1907, Urbain',         fun:'Named after Lutetia, the Roman name for Paris.'},
  Ac: {cat:'actinide',      ph:'Solid',   en:1.10, cfg:'[Rn] 6d¹ 7s²',     disc:'1899, Debierne',        fun:'Glows an ethereal blue in the dark — its radiation excites the air.'},
  Th: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 6d² 7s²',     disc:'1829, Berzelius',       fun:'Named after Thor, the Norse god of thunder and lightning.'},
  Pa: {cat:'actinide',      ph:'Solid',   en:1.50, cfg:'[Rn] 5f² 6d¹ 7s²',disc:'1913, Fajans',           fun:'One of the rarest and most expensive naturally occurring elements.'},
  U:  {cat:'actinide',      ph:'Solid',   en:1.38, cfg:'[Rn] 5f³ 6d¹ 7s²',disc:'1789, Klaproth',        fun:'Named after Uranus; powers nuclear reactors across the world.'},
  Np: {cat:'actinide',      ph:'Solid',   en:1.36, cfg:'[Rn] 5f⁴ 6d¹ 7s²',disc:'1940, McMillan',        fun:'First transuranium element ever produced — beyond uranium.'},
  Pu: {cat:'actinide',      ph:'Solid',   en:1.28, cfg:'[Rn] 5f⁶ 7s²',     disc:'1940, Seaborg',         fun:'Has six distinct allotropic forms — more than any other element.'},
  Am: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f⁷ 7s²',     disc:'1944, Seaborg',         fun:'The ionisation chamber in most smoke detectors contains americium.'},
  Cm: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f⁷ 6d¹ 7s²',disc:'1944, Seaborg',         fun:'Named in honour of both Marie and Pierre Curie.'},
  Bk: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f⁹ 7s²',     disc:'1949, Thompson',        fun:'Named after Berkeley, California, where it was first created.'},
  Cf: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f¹⁰ 7s²',    disc:'1950, Thompson',        fun:'A portable neutron source — used to locate oil deep underground.'},
  Es: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f¹¹ 7s²',    disc:'1952, Ghiorso',         fun:'Discovered in the radioactive debris of the first hydrogen bomb test.'},
  Fm: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f¹² 7s²',    disc:'1952, Ghiorso',         fun:'Named after Enrico Fermi, who built the first nuclear reactor.'},
  Md: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f¹³ 7s²',    disc:'1955, Ghiorso',         fun:'Named after Mendeleev, the visionary creator of the periodic table.'},
  No: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f¹⁴ 7s²',    disc:'1966, Dubna',           fun:'Named after Alfred Nobel, inventor of dynamite and the Nobel Prize.'},
  Lr: {cat:'actinide',      ph:'Solid',   en:1.30, cfg:'[Rn] 5f¹⁴ 7p¹',   disc:'1961, Ghiorso',         fun:'Named after Ernest O. Lawrence, inventor of the cyclotron.'},
};

/* ──────────────────────────────────────────────────────────────
   3. DOM REFERENCES
────────────────────────────────────────────────────────────── */
const stage         = document.getElementById('stage');
const scene         = document.getElementById('scene');
const panel         = document.getElementById('panel');
const panelClose    = document.getElementById('panel-close');
const statSel       = document.getElementById('stat-sel');
const statLayout    = document.getElementById('stat-layout');
const filterSel     = document.getElementById('filter-sel');
const searchOverlay = document.getElementById('search-overlay');
const searchInp     = document.getElementById('search-inp');
const searchResults = document.getElementById('search-results');
const searchClose   = document.getElementById('search-close');
const musicBtn      = document.getElementById('music-btn');
const musicLbl      = document.getElementById('music-lbl');
const musicBars     = document.getElementById('music-bars');
const btnMode       = document.getElementById('btn-mode');
const btnSearch     = document.getElementById('btn-search');

/* ──────────────────────────────────────────────────────────────
   4. BUILD ELEMENT CARDS
   Cards are created once and live permanently in #stage.
   In table mode  → grid-column / grid-row position them
   In 3D modes    → translate3d positions them
────────────────────────────────────────────────────────────── */
const cards = []; // ordered array of card elements

(function buildCards() {
  const frag = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const o    = i * STRIDE;
    const sym  = EL[o],     name = EL[o+1], ci   = EL[o+2];
    const gcol = EL[o+3],   grow = EL[o+4];
    const mass = EL[o+5],   den  = EL[o+6];
    const melt = EL[o+7],   boil = EL[o+8];
    const inf  = INFO[sym] || {};
    const ph   = inf.ph || 'Solid';
    const dotC = ph==='Gas'?'dot-gas': ph==='Liquid'?'dot-liquid': ph==='Unknown'?'dot-unknown':'dot-solid';

    const card = document.createElement('button');
    card.className   = 'card';
    card.dataset.ci  = ci;
    card.dataset.idx = i;
    card.dataset.sym = sym;
    card.dataset.cat = inf.cat || 'nonmetal';
    card.setAttribute('aria-label', `${sym} — ${name}, element ${i+1}`);
    /* Grid placement (used in table mode) */
    card.style.gridColumn = gcol;
    card.style.gridRow    = grow;

    card.innerHTML =
      `<span class="c-num">${i+1}</span>` +
      `<span class="c-sym">${sym}</span>` +
      `<span class="c-name">${name}</span>` +
      `<div class="c-desc">` +
        `<div class="dr"><span>MASS</span><span>${mass!=null?mass+' u':'—'}</span></div>` +
        `<div class="dr"><span>DENSITY</span><span>${den!=null?den+' g/cm³':'—'}</span></div>` +
        `<div class="dr"><span>MELT</span><span>${melt!=null?melt+' °C':'—'}</span></div>` +
        `<div class="dr"><span>BOIL</span><span>${boil!=null?boil+' °C':'—'}</span></div>` +
        `<div class="dr"><span>EN</span><span>${inf.en||'—'}</span></div>` +
        `<div class="dr"><span>PHASE</span><span>${ph}</span></div>` +
      `</div>` +
      `<div class="c-dot ${dotC}"></div>`;

    frag.appendChild(card);
    cards.push(card);
  }

  stage.appendChild(frag);
})();

/* ──────────────────────────────────────────────────────────────
   5. CARD FONT SCALING  (injected <style> scales with --cw)
────────────────────────────────────────────────────────────── */
const fontStyle = document.createElement('style');
fontStyle.id = 'card-fonts';
document.head.appendChild(fontStyle);

function updateCardFonts(cw) {
  const sfs = Math.max(7,  Math.round(cw * 0.27)) + 'px';
  const lfs = Math.max(5,  Math.round(cw * 0.105))+ 'px';
  const nfs = Math.max(4.5,Math.round(cw * 0.10)) + 'px';
  fontStyle.textContent =
    `.c-sym{font-size:${sfs}}` +
    `.c-name{font-size:${lfs}}` +
    `.c-num{font-size:${nfs}}`;
}

/* ──────────────────────────────────────────────────────────────
   6. FIT TABLE  —  compute card px size to fill #scene exactly
   Called on load (inside rAF) and on resize.
   Reads real scene dimensions via getBoundingClientRect.
────────────────────────────────────────────────────────────── */
const GRID_COLS = 18, GRID_ROWS = 9, GRID_GAP = 2;

function fitTable() {
  /* Real scene size */
  const r  = scene.getBoundingClientRect();
  const aw = r.width  || window.innerWidth;
  const ah = r.height || (window.innerHeight * 0.70);

  /* Max card dimensions from each axis */
  const cwFromW = Math.floor((aw - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS);
  const chFromH = Math.floor((ah - GRID_GAP * (GRID_ROWS - 1)) / GRID_ROWS);

  /* Maintain ~0.87 aspect ratio; clamp to sensible range */
  let cw = Math.min(cwFromW, Math.round(chFromH * 0.80));
  cw = Math.max(20, Math.min(cw, 72));
  const ch = Math.round(cw / 0.87);

  /* Write to CSS custom properties on :root so everything inherits */
  document.documentElement.style.setProperty('--cw', cw + 'px');
  document.documentElement.style.setProperty('--ch', ch + 'px');
  updateCardFonts(cw);
}

/* ──────────────────────────────────────────────────────────────
   7. LAYOUT SYSTEM
   curLayout — the active layout name
   setLayout(name) — switches mode, updates CSS classes, animates cards
────────────────────────────────────────────────────────────── */
let curLayout = 'table';
let isTransitioning = false;
let last3DPos = [];  /* stores {x,y,z,ry,rx} per card for 3D mode restore */

/**
 * Compute 3D {x,y,z,ry,rx} positions for each card in a given layout.
 * Returns an array of objects, one per card.
 */
function computePositions(layout) {
  const n   = cards.length;
  const pos = [];

  if (layout === 'sphere') {
    const r = Math.min(scene.clientWidth, scene.clientHeight) * 0.33;
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(-1 + (2 * i) / n);
      const th  = Math.sqrt(n * Math.PI) * phi;
      const sp  = Math.sin(phi);
      const x   = r * sp * Math.cos(th);
      const y   = r * Math.cos(phi);
      const z   = r * sp * Math.sin(th);
      pos.push({
        x, y, z,
        ry: Math.atan2(x, z) * 180 / Math.PI,
        rx: -Math.atan2(y, Math.hypot(x, z)) * 180 / Math.PI,
      });
    }

  } else if (layout === 'helix') {
    /* ── EXACT ORIGINAL HELIX ───────────────────────────────
       Copied precisely from the original Anime.js implementation:
         radius = 400, thetaStep = 0.16, verticalSpacing = 3
       Single continuous spiral; cards face outward via yaw+pitch.
       tilt target: rotateX=30, rotateY=300 (set in tilt table below)
    ──────────────────────────────────────────────────────── */
    const radius          = 400;
    const thetaStep       = 0.16;
    const verticalSpacing = 3;
    const yOffset         = (n * verticalSpacing) / 2;

    for (let i = 0; i < n; i++) {
      const theta = i * thetaStep + Math.PI;
      const y     = -(i * verticalSpacing) + yOffset;
      const x     = radius * Math.sin(theta);
      const z     = radius * Math.cos(theta);
      const yaw   = Math.atan2(x, z);                     /* radians → deg below */
      const pitch = -Math.atan2(y, Math.hypot(x, z) * 2);
      pos.push({
        x, y, z,
        ry: yaw   * 180 / Math.PI,
        rx: pitch * 180 / Math.PI,
      });
    }

  } else if (layout === 'grid') {
    const cols = 5, rows = 5, dg = 130;
    const cg = Math.min(scene.clientWidth / cols, 150);
    const rg = Math.min(scene.clientHeight / rows, 100);
    const pl = cols * rows;
    const layers = Math.ceil(n / pl);
    for (let i = 0; i < n; i++) {
      pos.push({
        rx: 0, ry: 0,
        x:  (i % cols - (cols - 1) / 2) * cg,
        y:  ((rows - 1) / 2 - Math.floor(i / cols) % rows) * rg,
        z:  (Math.floor(i / pl) - (layers - 1) / 2) * dg,
      });
    }

  } else if (layout === 'wave') {
    /* Use real card pixel dimensions + same gap as table grid.
       18 columns just like the periodic table. Vertical spacing matches rows.
       Z offset creates the wave ripple effect on top of the flat table layout. */
    const cw  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 36;
    const ch  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ch')) || 42;
    const gap = 2;
    const sx  = cw + gap;   /* column spacing = card width + gap */
    const sy  = ch + gap;   /* row spacing    = card height + gap */
    const wc  = 18;
    const amp = Math.min(scene.clientHeight * 0.22, 120); /* wave amplitude */
    const freq = 0.38;

    for (let i = 0; i < n; i++) {
      const col = i % wc, row = Math.floor(i / wc);
      const x   = (col - (wc - 1) / 2) * sx;
      const baseY = (row - 4) * sy;
      /* Wave: each card's z is displaced by a sine function of column + row */
      const z = amp * Math.sin(freq * col + row * 0.55) * Math.cos(row * 0.38);
      /* Small y ripple for extra depth feel */
      const y = baseY + amp * 0.18 * Math.cos(freq * col * 0.9 + row * 0.4);
      pos.push({ rx: 0, ry: 0, x, y, z });
    }

  } else if (layout === 'pyramid') {
    /* Build rings: ring 0 has 1 card, ring 1 has 4, ring 2 has 8, … */
    const rings = [];
    let rem = n, rs = 1;
    while (rem > 0) {
      const cnt = Math.min(rs === 1 ? 1 : rs * 4, rem);
      rings.push(cnt);
      rem -= cnt;
      rs++;
    }
    /* pre-fill pos array */
    for (let k = 0; k < n; k++) pos.push({x:0,y:0,z:0,rx:0,ry:0});
    let ci = 0;
    rings.forEach((cnt, ri) => {
      const radius = ri * 46;
      const yLevel = -ri * 38 + rings.length * 16;
      for (let k = 0; k < cnt; k++) {
        const angle = (k / cnt) * Math.PI * 2;
        pos[ci++] = {
          x:  radius * Math.cos(angle),
          y:  yLevel,
          z:  radius * Math.sin(angle),
          rx: 0, ry: 0,
        };
      }
    });

  } else if (layout === 'tornado') {
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const a = i * 0.42;
      const r = 14 + (1 - t) * 290;
      const y = (t - 0.5) * Math.min(scene.clientHeight * 0.9, 560);
      pos.push({
        x:  r * Math.cos(a),
        y,
        z:  r * Math.sin(a),
        rx: 0,
        ry: a * 180 / Math.PI,
      });
    }
  }

  return pos;
}

/**
 * Switch to a layout.
 * @param {string} name   — layout key
 * @param {boolean} animate — whether to animate the transition
 */
let pendingTimeouts = [];   /* track stagger timeouts so we can cancel on fast switch */

function clearPendingTimeouts() {
  pendingTimeouts.forEach(id => clearTimeout(id));
  pendingTimeouts = [];
}

function setLayout(name, animate = true) {
  if (name === curLayout && animate) return;

  /* Cancel any in-flight stagger animations */
  clearPendingTimeouts();

  isTransitioning = true;
  curLayout = name;

  /* Update button active states */
  document.querySelectorAll('#layout-group .btn').forEach(b => {
    b.classList.toggle('active', b.dataset.layout === name);
  });
  statLayout.textContent = name.toUpperCase();

  /* Collapse any expanded card */
  collapseCard();

  if (name === 'table') {
    /* ── TABLE MODE ─────────────────────────────────────────── */
    stage.className = 'mode-table';
    fitTable();

    cards.forEach((card, i) => {
      /* Reset any 3D-mode inline styles */
      card.style.position   = '';
      card.style.left       = '';
      card.style.top        = '';
      card.style.marginLeft = '';
      card.style.marginTop  = '';
      card.style.transform  = '';
      /* Ensure grid placement */
      card.style.gridColumn = EL[i * STRIDE + 3];
      card.style.gridRow    = EL[i * STRIDE + 4];

      if (animate) {
        card.style.opacity = '0';
        const tid = setTimeout(() => {
          const d = dur(400);
          card.style.transition = `opacity ${d}ms ease, transform ${d}ms ease`;
          card.style.opacity    = '1';
          card.style.transform  = 'translateZ(3px)';
          const tid2 = setTimeout(() => { card.style.transition = ''; }, d + 20);
          pendingTimeouts.push(tid2);
        }, 30 + Math.random() * dur(580));
        pendingTimeouts.push(tid);
      } else {
        card.style.opacity   = '1';
        card.style.transform = 'translateZ(3px)';
      }
    });

    /* Gentle tilt for table mode */
    setTargetRot(5, 0);
    setTimeout(() => { isTransitioning = false; }, 700);

  } else {
    /* ── 3D MODE ────────────────────────────────────────────── */
    stage.className = 'mode-3d';
    const positions = computePositions(name);
    last3DPos = positions;  /* save for collapse restore */

    /* Tilt targets per layout — helix matches original exactly */
    const tilt = {
      sphere:  {x:  0, y:   0},
      helix:   {x: 30, y: 300},   /* original: pointer.rotateX=30, rotateY=300 */
      grid:    {x: 10, y:  14},
      wave:    {x: 14, y:   5},
      pyramid: {x: 28, y:   0},
      tornado: {x: 10, y:   0},
    };
    const t = tilt[name] || {x:0,y:0};
    setTargetRot(t.x, t.y);

    cards.forEach((card, i) => {
      const p  = positions[i] || {x:0,y:0,z:0,rx:0,ry:0};
      const tf = `translate3d(${p.x}px,${p.y}px,${p.z}px) rotateY(${p.ry||0}deg) rotateX(${p.rx||0}deg)`;

      if (animate) {
        card.style.opacity    = '0';
        card.style.transition = '';
        const delay = 20 + Math.random() * dur(620);
        const tid = setTimeout(() => {
          if (card.style.opacity === '0') {  /* still pending */
            const d1 = dur(500), d2 = dur(720);
            card.style.transition = `opacity ${d1}ms ease, transform ${d2}ms cubic-bezier(.4,0,.2,1)`;
            card.style.opacity    = '1';
            card.style.transform  = tf;
            const tid2 = setTimeout(() => { card.style.transition = ''; }, d2 + 30);
            pendingTimeouts.push(tid2);
          }
        }, delay);
        pendingTimeouts.push(tid);
      } else {
        card.style.opacity   = '1';
        card.style.transform = tf;
      }
    });

    setTimeout(() => { isTransitioning = false; }, 800);
  }

  /* Notify float/hover systems */
  onLayoutChanged(name);

  /* Switch music profile for this layout */
  switchMusicProfile(name);
}

/* ──────────────────────────────────────────────────────────────
   8. 3D MOUSE TILT  (slow smooth lerp — lerp rate 0.018 matches original feel)
────────────────────────────────────────────────────────────── */
let rotX = 0, rotY = 0, tRotX = 5, tRotY = 0, rafRunning = false;

function setTargetRot(x, y) {
  tRotX = x; tRotY = y;
  if (!rafRunning) { rafRunning = true; requestAnimationFrame(rotTick); }
}

function rotTick() {
  /* 0.018 lerp = slow, cinematic — original used ~0.01 */
  rotX += (tRotX - rotX) * 0.018;
  rotY += (tRotY - rotY) * 0.018;
  stage.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  if (Math.abs(tRotX - rotX) > 0.02 || Math.abs(tRotY - rotY) > 0.02) {
    requestAnimationFrame(rotTick);
  } else {
    rotX = tRotX; rotY = tRotY;
    stage.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    rafRunning = false;
  }
}

document.addEventListener('pointermove', e => {
  const hw = window.innerWidth  / 2;
  const hh = window.innerHeight / 2;
  /* Normalise cursor to -1..+1 */
  const nx = (e.clientX - hw) / hw;
  const ny = (e.clientY - hh) / hh;

  if (curLayout === 'table') {
    /* Smooth, gentle tilt for table mode */
    tRotX = ny * 30;
    tRotY = nx * 40;
  } else if (curLayout === 'helix') {
    /* Original: pointer.rotateX=30, rotateY=300; pointer.x/y = -1..+1
       Full live range: ±30 for X and ±300 for Y — most responsive       */
    tRotX = ny * 30;
    tRotY = nx * 300;
  } else if (curLayout === 'sphere') {
    /* Sphere with strong responsiveness like helix */
    tRotX = ny * 38;
    tRotY = nx * 300;
  } else if (curLayout === 'grid') {
    /* Grid with responsive cursor tracking */
    tRotX = ny * 26;
    tRotY = nx * 260;
  } else if (curLayout === 'wave') {
    /* Wave with smooth flowing responsiveness */
    tRotX = ny * 24;
    tRotY = nx * 240;
  } else if (curLayout === 'pyramid') {
    /* Pyramid with dynamic cursor control */
    tRotX = ny * 32;
    tRotY = nx * 320;
  } else if (curLayout === 'tornado') {
    /* Tornado with snappy, reactive cursor response */
    tRotX = ny * 30;
    tRotY = nx * 310;
  }
  if (!rafRunning) { rafRunning = true; requestAnimationFrame(rotTick); }
});

/* ──────────────────────────────────────────────────────────────
   9. LAYOUT BUTTON CLICKS
────────────────────────────────────────────────────────────── */
document.getElementById('layout-group').addEventListener('click', e => {
  const btn = e.target.closest('.btn[data-layout]');
  if (!btn) return;
  setLayout(btn.dataset.layout);
});

/* ──────────────────────────────────────────────────────────────
   10. CARD INTERACTION  (expand / collapse / panel)
────────────────────────────────────────────────────────────── */
let expandedCard = null;

function collapseCard() {
  if (expandedCard) {
    const c   = expandedCard;
    const idx = +c.dataset.idx;
    c.classList.remove('expanded');

    if (curLayout === 'table') {
      /* Table: restore gentle lift */
      c.style.transform = 'translateZ(3px)';
    } else {
      /* 3D mode: restore exact position from stored last3DPos */
      const p = last3DPos[idx];
      if (p) {
        c.style.transform =
          `translate3d(${p.x}px,${p.y}px,${p.z}px)` +
          ` rotateY(${p.ry||0}deg) rotateX(${p.rx||0}deg)`;
      }
      /* Always keep visible */
      c.style.opacity = '1';
    }
    expandedCard = null;
  }
  panel.classList.add('hidden');
  statSel.textContent = '—';
}

function expandCard(card) {
  if (expandedCard === card) { collapseCard(); return; }

  /* Collapse previous without calling collapseCard (avoid panel hide flash) */
  if (expandedCard) {
    const prev    = expandedCard;
    const prevIdx = +prev.dataset.idx;
    prev.classList.remove('expanded');
    prev.style.opacity = '1';
    if (curLayout === 'table') {
      prev.style.transform = 'translateZ(3px)';
    } else {
      const pp = last3DPos[prevIdx];
      if (pp) {
        prev.style.transform =
          `translate3d(${pp.x}px,${pp.y}px,${pp.z}px)` +
          ` rotateY(${pp.ry||0}deg) rotateX(${pp.rx||0}deg)`;
      }
    }
  }

  expandedCard = card;
  card.classList.add('expanded');
  card.style.opacity = '1';  /* never let it vanish */

  if (curLayout === 'table') {
    /* Lift above siblings in table mode */
    card.style.transform = 'translateZ(50px)';
  } else {
    /* In 3D mode: keep card at its 3D position — don't touch transform
       The .expanded class grows --cw/--ch via CSS, card stays in place */
    const idx = +card.dataset.idx;
    const p   = last3DPos[idx];
    if (p) {
      card.style.transform =
        `translate3d(${p.x}px,${p.y}px,${p.z}px)` +
        ` rotateY(${p.ry||0}deg) rotateX(${p.rx||0}deg) scale(1.15)`;
    }
  }

  fillPanel(+card.dataset.idx);
}

/* card click handled by capture listener in section 22 */

panelClose.addEventListener('click', collapseCard);

/* Panel arrow navigation buttons */
document.getElementById('nav-prev').addEventListener('click', () => {
  if (!expandedCard) return;
  const i = +expandedCard.dataset.idx;
  if (i > 0) expandCard(cards[i - 1]);
});
document.getElementById('nav-next').addEventListener('click', () => {
  if (!expandedCard) return;
  const i = +expandedCard.dataset.idx;
  if (i < COUNT - 1) expandCard(cards[i + 1]);
});

/* ──────────────────────────────────────────────────────────────
   11. FILL DETAIL PANEL
────────────────────────────────────────────────────────────── */
function fillPanel(i) {
  const o    = i * STRIDE;
  const sym  = EL[o], name = EL[o+1];
  const gc   = EL[o+3], gr = EL[o+4];
  const mass = EL[o+5], den = EL[o+6];
  const melt = EL[o+7], boil = EL[o+8];
  const inf  = INFO[sym] || {};

  document.getElementById('p-num').textContent    = `ELEMENT #${i+1}`;
  document.getElementById('p-sym').textContent    = sym;
  document.getElementById('p-name').textContent   = name;
  document.getElementById('p-cat').textContent    = (inf.cat||'?').replace(/-/g,' ').toUpperCase();
  document.getElementById('p-mass').textContent   = mass!=null ? `${mass} u`      : '—';
  document.getElementById('p-dens').textContent   = den!=null  ? `${den} g/cm³`  : '—';
  document.getElementById('p-melt').textContent   = melt!=null ? `${melt} °C`    : '—';
  document.getElementById('p-boil').textContent   = boil!=null ? `${boil} °C`    : '—';
  document.getElementById('p-period').textContent = gr<=7 ? `Period ${gr}` : gr===8 ? 'Lanthanides' : 'Actinides';
  document.getElementById('p-group').textContent  = gc<=18 ? `Group ${gc}` : '—';
  document.getElementById('p-phase').textContent  = inf.ph || 'Solid';
  document.getElementById('p-en').textContent     = inf.en ? `${inf.en} (Pauling)` : '—';
  document.getElementById('p-cfg').textContent    = inf.cfg  || '—';
  document.getElementById('p-disc').textContent   = inf.disc || '—';
  document.getElementById('p-fun').textContent    = inf.fun  || '';

  document.getElementById('bar-mass').style.width = mass ? Math.min(mass/294*100,100)+'%' : '0%';
  document.getElementById('bar-en').style.width   = inf.en ? (inf.en/4*100)+'%' : '0%';

  statSel.textContent = sym;

  /* Animate the atomic number counting up */
  const pNum = document.getElementById('p-num');
  let countN = 0;
  const countTarget = i + 1;
  const countStep   = Math.max(1, Math.floor(countTarget / 18));
  const countTimer  = setInterval(() => {
    countN = Math.min(countN + countStep, countTarget);
    pNum.textContent = `ELEMENT #${countN}`;
    if (countN >= countTarget) clearInterval(countTimer);
  }, 28);

  panel.classList.remove('hidden');
}

/* ──────────────────────────────────────────────────────────────
   12. FILTER  (handled in section 21 with group flash)
────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────
   13. SEARCH
────────────────────────────────────────────────────────────── */
function openSearch() {
  searchOverlay.classList.remove('hidden');
  setTimeout(() => searchInp.focus(), 30);
}
function closeSearch() {
  searchOverlay.classList.add('hidden');
  searchInp.value = '';
  searchResults.innerHTML = '';
}

btnSearch.addEventListener('click', openSearch);
searchClose.addEventListener('click', closeSearch);

searchInp.addEventListener('input', () => {
  const q = searchInp.value.trim().toLowerCase();
  if (!q) { searchResults.innerHTML = ''; return; }

  const hits = [];
  for (let i = 0; i < COUNT && hits.length < 9; i++) {
    const o = i * STRIDE, sym = EL[o], name = EL[o+1];
    if (
      sym.toLowerCase().startsWith(q) ||
      name.toLowerCase().includes(q)  ||
      String(i+1) === q
    ) {
      hits.push({ i, sym, name, cat: (INFO[sym]||{}).cat||'?' });
    }
  }

  if (!hits.length) {
    searchResults.innerHTML = '<div class="sr-item" style="color:var(--fg4);cursor:default">No results</div>';
    return;
  }

  searchResults.innerHTML = hits.map(h =>
    `<div class="sr-item" data-idx="${h.i}" role="option">
       <span class="sr-n">${h.i+1}</span>
       <span class="sr-s">${h.sym}</span>
       <span class="sr-nm">${h.name}</span>
       <span class="sr-cat">${h.cat.replace(/-/g,' ').toUpperCase()}</span>
     </div>`
  ).join('');

  searchResults.querySelectorAll('.sr-item[data-idx]').forEach(item => {
    item.addEventListener('click', () => {
      const idx  = +item.dataset.idx;
      const prev = curLayout;
      closeSearch();
      if (prev !== 'table') setLayout('table', true);
      setTimeout(() => expandCard(cards[idx]), prev !== 'table' ? 750 : 50);
    });
  });
});

/* ──────────────────────────────────────────────────────────────
   14. KEYBOARD SHORTCUTS
────────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!searchOverlay.classList.contains('hidden')) { closeSearch(); return; }
    collapseCard();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }

  /* ── Arrow key navigation between elements ──────────────── */
  if (expandedCard && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
    e.preventDefault();
    const cur = +expandedCard.dataset.idx;
    let next = cur;
    if      (e.key === 'ArrowRight') next = Math.min(cur + 1,  COUNT - 1);
    else if (e.key === 'ArrowLeft')  next = Math.max(cur - 1,  0);
    else if (e.key === 'ArrowDown')  next = Math.min(cur + 18, COUNT - 1); /* next row */
    else if (e.key === 'ArrowUp')    next = Math.max(cur - 18, 0);         /* prev row */
    if (next !== cur) expandCard(cards[next]);
  }

  /* Number keys 1-7 switch layouts */
  const layoutKeys = ['table','sphere','helix','grid','wave','pyramid','tornado'];
  const n = parseInt(e.key);
  if (!e.ctrlKey && !e.metaKey && !e.altKey && n >= 1 && n <= 7) {
    setLayout(layoutKeys[n-1]);
  }

  /* R = random element */
  if (e.key === 'r' || e.key === 'R') {
    if (!e.ctrlKey && !e.metaKey && searchOverlay.classList.contains('hidden')) {
      pickRandom();
    }
  }
});

function pickRandom() {
  const idx = Math.floor(Math.random() * COUNT);
  if (curLayout !== 'table') setLayout('table', true);
  setTimeout(() => expandCard(cards[idx]), curLayout !== 'table' ? 700 : 50);
}

document.getElementById('btn-random').addEventListener('click', pickRandom);

/* ──────────────────────────────────────────────────────────────
   15. LIGHT / DARK MODE
────────────────────────────────────────────────────────────── */
let isLight = false;
btnMode.addEventListener('click', () => {
  isLight = !isLight;
  document.body.classList.toggle('light', isLight);
  btnMode.textContent = isLight ? '◑ MODE' : '◐ MODE';
});

/* ──────────────────────────────────────────────────────────────
   16. AMBIENT MUSIC  (Web Audio API — pure sine, heart-touching)
   All layouts use gentle sine-wave pads tuned to beautiful
   harmonic intervals. Soft attack, long release, warm reverb.
   Melody is slow, pentatonic — never jarring.
────────────────────────────────────────────────────────────── */
let AC = null, musicOn = false;
let padOscs = [], masterGain = null, reverbGain = null;
let arpTimer = null, arpIdx = 0;

/*
  Each profile:
    pads  = sustained chord tones (Hz) — always sine
    mel   = slow melody note pool (Hz)
    tempo = ms between melody notes (higher = slower)
    lbl   = display name
*/
const MUSIC_PROFILES = {
  table: {
    pads:  [261.63, 329.63, 392.00, 493.88, 523.25],   /* C maj7 */
    mel:   [523.25, 587.33, 659.26, 783.99, 880.00, 783.99, 659.26, 587.33],
    tempo: 700, lbl: '✦ Starlight',
  },
  sphere: {
    pads:  [220.00, 277.18, 329.63, 415.30, 493.88],   /* A min 7 */
    mel:   [440.00, 493.88, 523.25, 587.33, 659.26, 587.33, 523.25, 493.88],
    tempo: 600, lbl: '✦ Cosmos',
  },
  helix: {
    pads:  [174.61, 220.00, 261.63, 329.63, 392.00],   /* F maj 7 */
    mel:   [349.23, 392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00],
    tempo: 650, lbl: '✦ Spiral',
  },
  grid: {
    pads:  [196.00, 246.94, 293.66, 369.99, 440.00],   /* G maj 7 */
    mel:   [392.00, 440.00, 493.88, 587.33, 659.26, 587.33, 493.88, 440.00],
    tempo: 750, lbl: '✦ Crystal',
  },
  wave: {
    pads:  [261.63, 311.13, 369.99, 440.00, 523.25],   /* C min 7 */
    mel:   [523.25, 587.33, 622.25, 698.46, 783.99, 698.46, 622.25, 587.33],
    tempo: 800, lbl: '✦ Ocean',
  },
  pyramid: {
    pads:  [146.83, 185.00, 220.00, 277.18, 329.63],   /* D min 7 */
    mel:   [293.66, 329.63, 369.99, 440.00, 493.88, 440.00, 369.99, 329.63],
    tempo: 900, lbl: '✦ Ancient',
  },
  tornado: {
    pads:  [233.08, 293.66, 349.23, 440.00, 523.25],   /* Bb maj 7 */
    mel:   [466.16, 523.25, 587.33, 659.26, 783.99, 659.26, 587.33, 523.25],
    tempo: 500, lbl: '✦ Whirl',
  },
};

/* Build a simple convolution reverb from white noise */
function makeReverb(ctx, duration = 2.5, decay = 2.0) {
  const sr  = ctx.sampleRate;
  const len = Math.floor(sr * duration);
  const buf = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

function stopMusic() {
  if (arpTimer) { clearTimeout(arpTimer); arpTimer = null; }
  if (masterGain && AC) {
    try {
      masterGain.gain.cancelScheduledValues(AC.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, AC.currentTime + 1.2);
    } catch(e) {}
    const g = masterGain;
    setTimeout(() => {
      padOscs.forEach(o => { try { o.stop(); } catch(e) {} });
      padOscs = [];
      masterGain = null;
      reverbGain = null;
    }, 1400);
  }
}

function _buildMusic(layout) {
  if (!AC || !musicOn) return;
  const prof = MUSIC_PROFILES[layout] || MUSIC_PROFILES.table;

  /* Master output */
  masterGain = AC.createGain();
  masterGain.gain.setValueAtTime(0, AC.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, AC.currentTime + 2.5);
  masterGain.connect(AC.destination);

  /* Reverb send */
  const reverb = makeReverb(AC, 3, 2.5);
  reverbGain   = AC.createGain();
  reverbGain.gain.value = 0.35;
  masterGain.connect(reverbGain);
  reverbGain.connect(reverb);
  reverb.connect(AC.destination);

  /* Low-pass warmth filter */
  const lpf = AC.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 2800;
  lpf.Q.value = 0.5;
  masterGain.connect(lpf);
  lpf.connect(AC.destination);

  /* Gentle chorus using two slightly detuned oscillators per pad */
  prof.pads.forEach((freq, fi) => {
    [-2, 0, 2].forEach(detuneC => {
      const osc = AC.createOscillator();
      const env = AC.createGain();
      const now = AC.currentTime;

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value    = detuneC;

      /* Soft attack, hold */
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(
        (0.018 - fi * 0.001) * (detuneC === 0 ? 1 : 0.4),
        now + 1.8 + fi * 0.3
      );

      osc.connect(env);
      env.connect(masterGain);
      osc.start(now);
      padOscs.push(osc);
    });
  });

  /* Slow, expressive melody */
  arpIdx = 0;
  function playMelNote() {
    if (!masterGain || !musicOn) return;

    const notes = prof.mel;
    const freq  = notes[arpIdx % notes.length];
    arpIdx++;

    const osc = AC.createOscillator();
    const env = AC.createGain();
    const now = AC.currentTime;
    const dur = (prof.tempo / 1000) * 1.8; /* note duration = 1.8x tempo interval */

    osc.type            = 'sine';
    osc.frequency.value = freq;

    /* Bell-like envelope: fast attack, slow exponential decay */
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.09, now + 0.06);
    env.gain.setTargetAtTime(0.003, now + 0.08, dur * 0.4);

    osc.connect(env);
    env.connect(masterGain);
    /* Also send melody to reverb for bloom */
    const mrevSend = AC.createGain();
    mrevSend.gain.value = 0.6;
    env.connect(mrevSend);
    mrevSend.connect(reverbGain);

    osc.start(now);
    osc.stop(now + dur + 0.5);

    /* Vary tempo slightly for human feel */
    const jitter = (Math.random() - 0.5) * prof.tempo * 0.15;
    arpTimer = setTimeout(playMelNote, prof.tempo + jitter);
  }

  /* First note after a gentle pause */
  arpTimer = setTimeout(playMelNote, 600);
  musicLbl.textContent = prof.lbl;
}

function startMusic(layout) {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (AC.state === 'suspended') AC.resume();
  stopMusic();
  setTimeout(() => _buildMusic(layout), 1500);
}

function switchMusicProfile(layout) {
  if (!musicOn) return;
  /* Smoothly transition to new profile */
  stopMusic();
  setTimeout(() => _buildMusic(layout), 1500);
}

musicBtn.addEventListener('click', () => {
  musicOn = !musicOn;
  if (musicOn) {
    startMusic(curLayout);
    musicBtn.textContent = '■';
    musicBars.classList.add('playing');
  } else {
    stopMusic();
    musicBtn.textContent = '♪';
    musicBars.classList.remove('playing');
    musicLbl.textContent = 'AMBIENT';
  }
});

/* ──────────────────────────────────────────────────────────────
   20. SPEED CONTROL
   speedMult: 0.3 = very slow (cinematic), 1 = normal, 3 = fast
   dur(ms) = ms / speedMult  →  higher mult = shorter duration = faster
────────────────────────────────────────────────────────────── */
let speedMult = 1.0;
const speedSlider = document.getElementById('speed-slider');
const speedLabel  = document.getElementById('speed-label');

function updateSpeedLabel() {
  if (!speedLabel) return;
  const labels = { 0.3:'SLOW', 0.5:'SLOW', 0.7:'SLOW',
                   1.0:'NORMAL', 1.5:'FAST', 2.0:'FAST', 3.0:'FAST' };
  const v = speedMult;
  speedLabel.textContent = v < 0.8 ? 'SLOW' : v > 1.3 ? 'FAST' : 'NORMAL';
}

if (speedSlider) {
  speedSlider.addEventListener('input', () => {
    speedMult = parseFloat(speedSlider.value);
    updateSpeedLabel();
    /* Restart float with new speed */
    if (floatActive) {
      floatLastTime = 0; /* reset dt so no jump */
    }
  });
}

/* Helper: transition duration in ms, scaled by speed */
function dur(baseMs) {
  /* Clamp result between 80ms (never invisible) and 3000ms (never frozen) */
  return Math.max(80, Math.min(3000, Math.round(baseMs / speedMult)));
}

/* ──────────────────────────────────────────────────────────────
   21. GROUP FLASH  — when filter changes, briefly illuminate
       all matching cards with a 200ms bright glow flash,
       then return to normal brightness.
────────────────────────────────────────────────────────────── */
function flashGroup(cat) {
  const matching = cards.filter(c => c.dataset.cat === cat);
  if (!matching.length) return;

  matching.forEach(card => {
    /* Remove dim, add flash class */
    card.classList.remove('dimmed');
    card.classList.add('flash-bright');
  });

  /* Hold bright for 250ms, then remove */
  setTimeout(() => {
    matching.forEach(card => card.classList.remove('flash-bright'));
  }, 250);

  /* After flash, re-apply dim to non-matching */
  setTimeout(() => {
    const val = filterSel.value;
    if (val !== 'all') {
      cards.forEach(c => {
        c.classList.toggle('dimmed', c.dataset.cat !== val);
      });
    }
  }, 280);
}

/* Override filter to add flash */
filterSel.addEventListener('change', () => {
  const val = filterSel.value;
  /* Flash all matching cards first */
  if (val !== 'all') {
    /* First un-dim everything momentarily */
    cards.forEach(c => c.classList.remove('dimmed'));
    flashGroup(val);
  } else {
    cards.forEach(c => { c.classList.remove('dimmed'); c.classList.remove('flash-bright'); });
  }
});

/* Also flash when clicking legend dot */
document.querySelectorAll('.leg').forEach(leg => {
  leg.addEventListener('click', () => {
    filterSel.value = leg.dataset.cat;
    filterSel.dispatchEvent(new Event('change'));
  });
});

/* ──────────────────────────────────────────────────────────────
   22. CARD TOUCH / CLICK RIPPLE + PARTICLE BURST
────────────────────────────────────────────────────────────── */
function spawnRipple(card, e) {
  const rect   = card.getBoundingClientRect();
  const cx     = (e.clientX || rect.left + rect.width  / 2) - rect.left;
  const cy     = (e.clientY || rect.top  + rect.height / 2) - rect.top;
  const ripple = document.createElement('span');
  ripple.className = 'card-ripple';
  ripple.style.left = cx + 'px';
  ripple.style.top  = cy + 'px';
  card.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function spawnParticles(card) {
  const rect = card.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  const color= getComputedStyle(card).getPropertyValue('--card-fg').trim() || '#20d8f8';

  for (let p = 0; p < 10; p++) {
    const dot = document.createElement('div');
    dot.className = 'particle';
    dot.style.cssText = `
      left:${cx}px; top:${cy}px;
      background:${color};
      --dx:${(Math.random()-0.5)*120}px;
      --dy:${(Math.random()-0.5)*120}px;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
  }
}

/* Hook card clicks for ripple + particles */
stage.addEventListener('pointerdown', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  spawnRipple(card, e);
  /* Particles only on expand */
});

/* Card click with ripple + particle burst */
stage.addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  const wasExpanded = card.classList.contains('expanded');
  expandCard(card);
  if (!wasExpanded) {
    spawnParticles(card);
  }
}, false);

/* ──────────────────────────────────────────────────────────────
   23. CONTINUOUS FLOAT ANIMATION ON CARDS (table mode)
   Cards gently bob in a staggered sine wave.
   Speed slider: 0.2 = very slow, 1 = normal, 3 = fast.
   speedMult drives both float speed AND transition duration.
────────────────────────────────────────────────────────────── */
let floatFrame = null, floatActive = false;
const floatPhases = cards.map(() => Math.random() * Math.PI * 2);
let floatT = 0;
let floatLastTime = 0;

function startFloat() {
  if (floatActive) return;
  floatActive = true;
  floatLastTime = 0;

  function tick(ts) {
    if (!floatActive) return;
    /* Delta time in seconds, capped to avoid jumps after tab switch */
    if (floatLastTime === 0) floatLastTime = ts;
    const dt = Math.min((ts - floatLastTime) / 1000, 0.05);
    floatLastTime = ts;

    /* speedMult=1 → normal; speedMult=3 → 3x faster; speedMult=0.2 → slow */
    floatT += dt * speedMult * 0.65;

    if (curLayout === 'table') {
      cards.forEach((c, i) => {
        /* Never touch the expanded card's transform */
        if (c === expandedCard) return;
        if (c.classList.contains('dimmed')) return;
        const bobY = Math.sin(floatT + floatPhases[i]) * 1.5;
        const bobZ = Math.cos(floatT * 0.7 + floatPhases[i] * 1.4) * 2;
        c.style.transform = `translateZ(${3 + bobZ}px) translateY(${bobY}px)`;
      });
    }
    floatFrame = requestAnimationFrame(tick);
  }
  floatFrame = requestAnimationFrame(tick);
}

function stopFloat() {
  floatActive = false;
  if (floatFrame) { cancelAnimationFrame(floatFrame); floatFrame = null; }
  floatLastTime = 0;
  /* Reset only non-expanded cards */
  cards.forEach(c => {
    if (c !== expandedCard) c.style.transform = 'translateZ(3px)';
  });
}

/* Start float when in table mode */
function onLayoutChanged(name) {
  if (name === 'table') {
    startFloat();
  } else {
    stopFloat();
  }
}

/* ──────────────────────────────────────────────────────────────
   24. HOVER GLOW TRAIL  (3D modes)
   As you hover over a card in 3D mode, nearby cards get
   a subtle sympathetic glow.
────────────────────────────────────────────────────────────── */
stage.addEventListener('pointermove', e => {
  if (curLayout === 'table') return;
  const hovered = e.target.closest('.card');
  cards.forEach(c => c.classList.remove('near-glow'));
  if (!hovered) return;
  /* Find cards that share data-ci (same element family) */
  const ci = hovered.dataset.ci;
  cards.forEach(c => {
    if (c !== hovered && c.dataset.ci === ci) {
      c.classList.add('near-glow');
    }
  });
});

/* ──────────────────────────────────────────────────────────────
   17. MOBILE TOUCH  (swipe to change layout, pinch to zoom)
────────────────────────────────────────────────────────────── */
const LAYOUT_ORDER = ['table','sphere','helix','grid','wave','pyramid','tornado'];
let touchX0 = 0, touchY0 = 0, pinchDist0 = 0, sceneScale = 1;

document.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    touchX0 = e.touches[0].clientX;
    touchY0 = e.touches[0].clientY;
  }
  if (e.touches.length === 2) {
    pinchDist0 = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY
    );
  }
}, { passive: true });

document.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && pinchDist0) {
    const d = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY
    );
    sceneScale = Math.max(0.4, Math.min(3.0, sceneScale * (d / pinchDist0)));
    scene.style.transform = `scale(${sceneScale})`;
    pinchDist0 = d;
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', e => {
  if (e.changedTouches.length === 1 && e.touches.length === 0) {
    const dx = e.changedTouches[0].clientX - touchX0;
    const dy = e.changedTouches[0].clientY - touchY0;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 44) {
      const ci   = LAYOUT_ORDER.indexOf(curLayout);
      const next = (ci + (dx < 0 ? 1 : -1) + LAYOUT_ORDER.length) % LAYOUT_ORDER.length;
      setLayout(LAYOUT_ORDER[next]);
    }
  }
  pinchDist0 = 0;
}, { passive: true });

/* ──────────────────────────────────────────────────────────────
   18. RESIZE HANDLER
────────────────────────────────────────────────────────────── */
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (curLayout === 'table') {
      fitTable();
      /* Reapply table layout to reflect new card sizes */
      setLayout('table', false);
    } else {
      setLayout(curLayout, false);
    }
  }, 120);
});

/* ──────────────────────────────────────────────────────────────
   19. BOOT SEQUENCE
   We wait two animation frames so the browser has fully painted
   #scene and getBoundingClientRect returns real dimensions.
────────────────────────────────────────────────────────────── */
(function boot() {
  /* Hide cards while we compute sizes */
  cards.forEach(c => { c.style.opacity = '0'; });

  /* Double rAF — guarantees #scene has real pixel dimensions */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    /* Set table mode immediately (no animation) so grid is active */
    stage.className = 'mode-table';
    fitTable();

    /* Make sure each card has its grid placement */
    cards.forEach((c, i) => {
      c.style.gridColumn = EL[i * STRIDE + 3];
      c.style.gridRow    = EL[i * STRIDE + 4];
      c.style.transform  = 'translateZ(3px)';
    });

    /* Staggered fade-in — each card fades in at a random delay */
    cards.forEach((c, i) => {
      setTimeout(() => {
        c.style.transition = 'opacity .45s ease';
        c.style.opacity    = '1';
        setTimeout(() => { c.style.transition = ''; }, 480);
      }, 40 + Math.random() * 800);
    });

    /* Gentle initial tilt */
    setTargetRot(5, 0);

    /* Start floating animation for table mode */
    setTimeout(() => startFloat(), 900);
  }));
})();