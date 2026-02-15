// Dictionary of Portuguese color names to hex values (common across 12 seasonal palettes)
const colorNameToHex: Record<string, string> = {
  // Neutros
  'branco puro': '#FFFFFF',
  'branco': '#FFFFFF',
  'preto': '#000000',
  'cinza': '#808080',
  'cinza claro': '#D3D3D3',
  'cinza escuro': '#696969',
  'bege': '#F5F5DC',
  'creme': '#FFFDD0',
  'marfim': '#FFFFF0',
  'caramelo': '#C68E17',
  'nude': '#E3BC9A',
  // Azuis
  'marinho': '#000080',
  'azul marinho': '#000080',
  'azul royal': '#4169E1',
  'azul bebê': '#89CFF0',
  'azul celeste': '#87CEEB',
  'azul petróleo': '#005F69',
  'azul cobalto': '#0047AB',
  'azul aço': '#4682B4',
  'azul claro': '#ADD8E6',
  'azul': '#0000FF',
  'indigo': '#4B0082',
  'teal': '#008080',
  'teal escuro': '#008B8B',
  'turquesa': '#40E0D0',
  // Vermelhos / Rosas
  'carmesim': '#DC143C',
  'vermelho': '#FF0000',
  'vermelho escuro': '#8B0000',
  'vermelho tomate': '#FF6347',
  'bordô': '#800020',
  'rosa': '#FFC0CB',
  'rosa choque': '#FF1493',
  'rosa claro': '#FFB6C1',
  'rosa antigo': '#D2691E',
  'magenta': '#FF00FF',
  'fúcsia': '#FF00FF',
  'coral': '#FF7F50',
  'salmão': '#FA8072',
  // Verdes
  'verde': '#008000',
  'verde esmeralda': '#50C878',
  'verde musgo': '#8A9A5B',
  'verde oliva': '#808000',
  'verde floresta': '#228B22',
  'verde menta': '#98FF98',
  'verde limão': '#32CD32',
  'verde jade': '#00A86B',
  // Amarelos / Laranjas
  'amarelo': '#FFD700',
  'amarelo mostarda': '#FFDB58',
  'amarelo ouro': '#FFD700',
  'dourado': '#DAA520',
  'laranja': '#FFA500',
  'laranja dourado': '#DAA520',
  'laranja queimado': '#CC5500',
  'pêssego': '#FFDAB9',
  'terracota': '#E2725B',
  // Roxos / Violetas
  'roxo': '#800080',
  'violeta': '#8B00FF',
  'lavanda': '#E6E6FA',
  'lilás': '#C8A2C8',
  'ameixa': '#8E4585',
  'berinjela': '#614051',
  'púrpura': '#800080',
  // Marrons
  'marrom': '#8B4513',
  'marrom escuro': '#654321',
  'chocolate': '#D2691E',
  'café': '#6F4E37',
  'caqui': '#BDB76B',
  'castanho': '#8B4513',
  'mogno': '#C04000',
  'ferrugem': '#B7410E',
  // Outros
  'vinho': '#722F37',
  'borgonha': '#800020',
  'champagne': '#F7E7CE',
  'cobre': '#B87333',
  'bronze': '#CD7F32',
  'prata': '#C0C0C0',
  'ouro': '#FFD700',
};

export type ColorInput = string | { hex: string; name: string };

export function normalizeColor(color: ColorInput): { hex: string; name: string } {
  if (typeof color === 'string') {
    const hex = colorNameToHex[color.toLowerCase().trim()] || '#808080';
    return { hex, name: color };
  }
  return color;
}
