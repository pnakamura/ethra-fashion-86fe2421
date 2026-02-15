import type { PackingList, PackingItem } from '@/components/voyager/PackingChecklist';
import type { TripAnalysis } from '@/types/trip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TripData {
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  packing_list?: PackingList | null;
  trip_analysis?: TripAnalysis | null;
}

const tripTypeLabels: Record<string, string> = {
  leisure: 'Lazer',
  business: 'Negócios',
  adventure: 'Aventura',
  romantic: 'Romântica',
  beach: 'Praia',
};

const categoryLabels: Record<string, string> = {
  roupas: '👕 Roupas',
  calcados: '👟 Calçados',
  acessorios: '⌚ Acessórios',
  chapeus: '👑 Chapéus',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateItemRow(item: PackingItem, index: number): string {
  const statusColor = item.in_wardrobe ? '#10b981' : '#f59e0b';
  const statusText = item.in_wardrobe ? '✓ No closet' : '🛒 Sugestão';
  
  return `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: center; color: #6b7280;">${index + 1}</td>
      <td style="padding: 12px 8px;">
        <strong>${escapeHtml(item.name)}</strong>
        <br>
        <span style="font-size: 12px; color: #6b7280;">${escapeHtml(item.category)}</span>
      </td>
      <td style="padding: 12px 8px; text-align: center;">x${item.quantity}</td>
      <td style="padding: 12px 8px;">
        ${item.colors.slice(0, 3).map(color => 
          `<span style="display: inline-block; width: 16px; height: 16px; border-radius: 50%; background: ${color.startsWith('#') ? color : '#' + color}; margin-right: 4px; border: 1px solid #e5e7eb;"></span>`
        ).join('')}
      </td>
      <td style="padding: 12px 8px;">
        ${item.styles.slice(0, 2).map(style => 
          `<span style="display: inline-block; padding: 2px 8px; background: #f3f4f6; border-radius: 12px; font-size: 11px; margin-right: 4px;">${escapeHtml(style)}</span>`
        ).join('')}
      </td>
      <td style="padding: 12px 8px; text-align: center;">
        <span style="color: ${statusColor}; font-weight: 500; font-size: 12px;">${statusText}</span>
      </td>
    </tr>
  `;
}

function generateCategorySection(category: keyof PackingList, items: PackingItem[]): string {
  if (items.length === 0) return '';

  return `
    <div style="margin-bottom: 32px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #6366f1;">
        ${categoryLabels[category]}
        <span style="font-weight: normal; color: #6b7280; font-size: 14px;"> (${items.length} itens)</span>
      </h3>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 12px 8px; text-align: center; width: 40px;">#</th>
            <th style="padding: 12px 8px; text-align: left;">Item</th>
            <th style="padding: 12px 8px; text-align: center; width: 60px;">Qtd</th>
            <th style="padding: 12px 8px; text-align: left; width: 100px;">Cores</th>
            <th style="padding: 12px 8px; text-align: left; width: 120px;">Estilo</th>
            <th style="padding: 12px 8px; text-align: center; width: 100px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => generateItemRow(item, idx)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateWeatherSection(weather: TripAnalysis['weather']): string {
  const conditionEmojis: Record<string, string> = {
    sunny: '☀️',
    partly_cloudy: '⛅',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
    snowy: '❄️',
    foggy: '🌫️',
  };

  const conditions = weather.conditions
    .map(c => conditionEmojis[c] || '🌤️')
    .join(' ');

  return `
    <div style="margin-bottom: 32px; padding: 20px; background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 16px;">
      <h3 style="font-size: 18px; color: #4338ca; margin-bottom: 12px;">
        ☁️ Previsão do Clima
      </h3>
      <p style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">
        ${escapeHtml(weather.summary)}
      </p>
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <div style="text-align: center; padding: 12px; background: white; border-radius: 12px; min-width: 100px;">
          <div style="font-size: 24px; font-weight: bold; color: #1f2937;">
            ${weather.temp_min}° - ${weather.temp_max}°
          </div>
          <div style="font-size: 12px; color: #6b7280;">Temperatura</div>
        </div>
        <div style="text-align: center; padding: 12px; background: white; border-radius: 12px; min-width: 80px;">
          <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">
            ${weather.rain_probability}%
          </div>
          <div style="font-size: 12px; color: #6b7280;">Chuva</div>
        </div>
        <div style="text-align: center; padding: 12px; background: white; border-radius: 12px; min-width: 80px;">
          <div style="font-size: 24px;">${conditions}</div>
          <div style="font-size: 12px; color: #6b7280;">Condições</div>
        </div>
      </div>
      ${weather.packing_mood ? `
        <p style="margin-top: 16px; font-style: italic; color: #6366f1; font-size: 14px;">
          ✨ "${escapeHtml(weather.packing_mood)}"
        </p>
      ` : ''}
    </div>
  `;
}

function generateTripBriefSection(tripBrief: string): string {
  return `
    <div style="margin-bottom: 32px; padding: 20px; background: #faf5ff; border-left: 4px solid #8b5cf6; border-radius: 0 12px 12px 0;">
      <h3 style="font-size: 16px; color: #6d28d9; margin-bottom: 8px;">
        ✨ Sobre seu Destino
      </h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        ${escapeHtml(tripBrief)}
      </p>
    </div>
  `;
}

function generateTipsSection(tips: TripAnalysis['tips']): string {
  const sections = [
    { key: 'essentials', label: '⭐ Essenciais', items: tips?.essentials || [], color: '#f59e0b' },
    { key: 'local_culture', label: '🌍 Cultura Local', items: tips?.local_culture || [], color: '#3b82f6' },
    { key: 'avoid', label: '⚠️ Evitar', items: tips?.avoid || [], color: '#ef4444' },
    { key: 'pro_tips', label: '💡 Dicas Pro', items: tips?.pro_tips || [], color: '#10b981' },
  ].filter(section => section.items.length > 0);

  if (sections.length === 0) return '';

  return `
    <div style="margin-bottom: 32px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 16px;">
        📝 Dicas de Viagem
      </h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        ${sections.map(section => `
          <div style="padding: 16px; background: #f9fafb; border-radius: 12px; border-left: 3px solid ${section.color};">
            <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
              ${section.label}
            </h4>
            <ul style="margin: 0; padding-left: 16px; font-size: 13px; color: #6b7280;">
              ${section.items.map(tip => `<li style="margin-bottom: 4px;">${escapeHtml(tip)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateSuggestedLooksSection(looks: TripAnalysis['suggested_looks']): string {
  if (!looks || looks.length === 0) return '';

  return `
    <div style="margin-bottom: 32px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 16px;">
        👗 Looks Sugeridos
      </h3>
      <div style="display: grid; gap: 16px;">
        ${looks.map((look, index) => `
          <div style="padding: 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">✨</span>
              <h4 style="font-size: 14px; font-weight: 600; color: #92400e; margin: 0;">
                ${escapeHtml(look.name)}
              </h4>
              <span style="font-size: 12px; color: #a16207; background: white; padding: 2px 8px; border-radius: 8px;">
                ${escapeHtml(look.occasion)}
              </span>
            </div>
            <p style="font-size: 13px; color: #78350f; margin-bottom: 8px;">
              ${escapeHtml(look.description)}
            </p>
            ${look.style_tip ? `
              <p style="font-size: 12px; color: #92400e; font-style: italic;">
                💡 ${escapeHtml(look.style_tip)}
              </p>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function generatePackingListHTML(trip: TripData): string {
  const startDate = format(new Date(trip.start_date), "d 'de' MMMM", { locale: ptBR });
  const endDate = format(new Date(trip.end_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const tripDays = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const packingList = trip.packing_list || { roupas: [], calcados: [], acessorios: [], chapeus: [] };
  const tripAnalysis = trip.trip_analysis;
  
  const allItems = [
    ...packingList.roupas,
    ...packingList.calcados,
    ...packingList.acessorios,
    ...packingList.chapeus,
  ];
  
  const totalItems = allItems.length;
  const inWardrobe = allItems.filter(i => i.in_wardrobe).length;
  const suggestions = allItems.filter(i => !i.in_wardrobe).length;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lista de Viagem - ${escapeHtml(trip.destination)}</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1f2937;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 24px;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #6366f1;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 8px;">
          Lista de Viagem
        </div>
        <h1 style="font-size: 32px; margin: 0 0 8px 0; color: #111827;">
          ✈️ ${escapeHtml(trip.destination)}
        </h1>
        <p style="font-size: 16px; color: #6b7280; margin: 0;">
          ${startDate} a ${endDate} • ${tripDays} dias • ${tripTypeLabels[trip.trip_type] || trip.trip_type}
        </p>
      </div>

      <!-- Trip Brief -->
      ${tripAnalysis?.trip_brief ? generateTripBriefSection(tripAnalysis.trip_brief) : ''}

      <!-- Weather Section -->
      ${tripAnalysis?.weather ? generateWeatherSection(tripAnalysis.weather) : ''}

      <!-- Tips Section -->
      ${tripAnalysis?.tips ? generateTipsSection(tripAnalysis.tips) : ''}

      <!-- Suggested Looks -->
      ${tripAnalysis?.suggested_looks ? generateSuggestedLooksSection(tripAnalysis.suggested_looks) : ''}

      <!-- Summary Cards -->
      <div style="display: flex; gap: 16px; margin-bottom: 32px;">
        <div style="flex: 1; padding: 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; color: white; text-align: center;">
          <div style="font-size: 28px; font-weight: bold;">${totalItems}</div>
          <div style="font-size: 12px; opacity: 0.9;">Total de Itens</div>
        </div>
        <div style="flex: 1; padding: 16px; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); border-radius: 12px; color: white; text-align: center;">
          <div style="font-size: 28px; font-weight: bold;">${inWardrobe}</div>
          <div style="font-size: 12px; opacity: 0.9;">No Closet</div>
        </div>
        <div style="flex: 1; padding: 16px; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 12px; color: white; text-align: center;">
          <div style="font-size: 28px; font-weight: bold;">${suggestions}</div>
          <div style="font-size: 12px; opacity: 0.9;">Sugestões</div>
        </div>
      </div>

      <!-- Categories -->
      ${generateCategorySection('roupas', packingList.roupas)}
      ${generateCategorySection('calcados', packingList.calcados)}
      ${generateCategorySection('acessorios', packingList.acessorios)}
      ${generateCategorySection('chapeus', packingList.chapeus)}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>Gerado por Aura • ${format(new Date(), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
        <p style="margin-top: 8px;">✨ Boa viagem!</p>
      </div>
    </body>
    </html>
  `;
}

export async function downloadPackingListPDF(trip: TripData): Promise<void> {
  const html = generatePackingListHTML(trip);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup bloqueado. Permita popups para baixar o PDF.');
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
