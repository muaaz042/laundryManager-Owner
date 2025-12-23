import RNPrint from 'react-native-print';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep your BASE_URL and buildQuery function exactly as they were...
const BASE_URL = "http://103.184.0.121:8002";

function buildQuery(params = {}) {
  const esc = encodeURIComponent;
  const query = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .map(k => `${esc(k)}=${esc(params[k])}`)
    .join("&");
  return query ? `?${query}` : "";
}

export async function fetchReports(params = {}) {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("No authentication token found");

  const query = buildQuery(params);
  const url = `${BASE_URL}/api/reports/orders${query}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return await res.json();
}

// --- UPDATED FUNCTION USING REACT-NATIVE-PRINT ---
export async function downloadReportAsPDF(params = {}) {
  try {
    const data = await fetchReports(params);

    // Generate HTML
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { color: #2563eb; text-align: center; }
            .meta { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f4f8; font-weight: bold; }
            .amount { text-align: right; }
            .status { text-transform: capitalize; }
          </style>
        </head>
        <body>
          <h2>Report Export</h2>
          
          <div class="meta">
            ${params.shop_name ? `<p><strong>Shop:</strong> ${params.shop_name}</p>` : ''}
            <p><strong>Period:</strong> ${params.start_date || 'N/A'} to ${params.end_date || 'N/A'}</p>
          </div>

          <h3>Summary</h3>
          <table>
            <tbody>
              ${data.summary
                ? Object.entries(data.summary).map(([k, v]) => `
                    <tr>
                      <td style="text-transform:capitalize">${k.replace(/_/g, ' ')}</td>
                      <td class="amount">${v}</td>
                    </tr>`).join('')
                : '<tr><td colspan="2">No summary available</td></tr>'}
            </tbody>
          </table>

          <h3>Orders List</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Date</th>
                <th class="amount">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(data.orders || []).map(o => `
                <tr>
                  <td>${o.id}</td>
                  <td>${o.customer_phone || '-'}</td>
                  <td class="status">${o.status || '-'}</td>
                  <td>${o.created_at?.slice(0,10) || '-'}</td>
                  <td class="amount">${o.total_amount || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Opens the Native Print Dialog
    // User clicks "Save as PDF" (Android) or "Print -> Share" (iOS)
    await RNPrint.print({
      html: html,
      jobName: `Report_${params.start_date}_${params.end_date}`
    });

  } catch (err) {
    console.error("Print error:", err);
    throw err;
  }
}