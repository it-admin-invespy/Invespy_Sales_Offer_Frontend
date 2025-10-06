// utils/generateSalesOfferHTML.js
export function generateSalesOfferHTML(data, unitNo) {
  const project = data.projects[0];
  const unit = project.units.find((u, i) => i === unitNo) || null;
  const meta = data.meta || {};
  const customer = data.customer || {};
  const color = meta.brandColors || "#145218";
  const accent = meta.accentColor || "#f4f9f4";

  if (!unit) return "<p>Unit not found</p>";

  return `
  <html>
    <head>
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          font-family: '${meta.fonts?.[0] || "Poppins"}, sans-serif';
          color: #222;
          margin: 0;
          padding: 30px;
          line-height: 1.6;
          background-color: #fff;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid ${color};
          padding-bottom: 12px;
          margin-bottom: 30px;
        }

        header img {
          height: 60px;
          max-width: 200px;
          object-fit: contain;
        }

        h1 {
          font-size: 26px;
          color: ${color};
          margin: 0;
        }

        h2 {
          font-size: 18px;
          color: ${color};
          border-left: 5px solid ${color};
          padding-left: 10px;
          margin-bottom: 10px;
        }

        section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 13.5px;
          border-radius: 8px;
          overflow: hidden;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 10px 12px;
          text-align: center;
        }

        th {
          background-color: ${color};
          color: #fff;
          font-weight: 600;
        }

        tbody tr:nth-child(even) {
          background-color: ${accent};
        }

        .customer-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 5px;
          font-size: 14px;
        }

        .customer-info p {
          margin: 3px 0;
        }

        .floor-plan {
          text-align: center;
          margin-top: 30px;
          page-break-inside: avoid;
        }

        .floor-plan img {
          max-width: 90%;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        footer {
          border-top: 2px solid ${color};
          margin-top: 60px;
          padding-top: 15px;
          font-size: 12px;
          text-align: center;
          color: #666;
        }

        .page-break {
          page-break-before: always;
        }

        @media print {
          body {
            margin: 0;
          }
          section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <!-- PAGE 1 -->
      <header>
        <div>
          <h1>${project.projectName}</h1>
          <p>${project.location}, ${project.country}</p>
        </div>
        <img src="${meta.logoUrl || ""}" alt="logo" />
      </header>

      <section>
        <h2>Customer Details</h2>
        <div class="customer-info">
          <p><strong>Name:</strong> ${customer.name || "-"}</p>
          <p><strong>Date:</strong> ${new Date(
            customer.date || Date.now()
          ).toLocaleDateString()}</p>
          <p><strong>Sales Consultant:</strong> ${
            data.salesConsultant || "-"
          }</p>
          <p><strong>Brokerage Agency:</strong> ${
            data.brokerageAgency || "-"
          }</p>
        </div>
      </section>

      <section>
        <h2>Unit Details</h2>
        <table>
          <thead>
            <tr>
              <th>Unit No</th>
              <th>Floor</th>
              <th>Type</th>
              <th>View</th>
              <th>Gross Area (sq.ft)</th>
              <th>Price (AED)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${unit.unitNo}</td>
              <td>${unit.floorNo}</td>
              <td>${unit.unitType}</td>
              <td>${unit.view}</td>
              <td>${unit.grossArea}</td>
              <td>${Number(unit.price).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Payment Plan</h2>
        <table>
          <thead>
            <tr>
              <th>Installment</th>
              <th>Percentage</th>
              <th>Milestone</th>
              <th>Date</th>
              <th>Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            ${
              unit.installments
                ?.map(
                  (inst) => `
              <tr>
                <td>${inst.installment}</td>
                <td>${inst.percentagePayable}%</td>
                <td>${inst.milestone}</td>
                <td>${new Date(inst.milestoneDate).toLocaleDateString()}</td>
                <td>${Number(inst.amount).toLocaleString()}</td>
              </tr>`
                )
                .join("") || ""
            }
          </tbody>
        </table>
      </section>

      <!-- PAGE 2 -->
      <div class="page-break"></div>
      <section>
        <h2>Floor Plan</h2>
        <div class="floor-plan">
          ${
            unit.floorPlans?.length
              ? unit.floorPlans
                  .map(
                    (f) => `
              <img src="${f}" alt="Floor Plan" crossorigin="anonymous"/>`
                  )
                  .join("")
              : `<p>No floor plans available</p>`
          }
        </div>
      </section>

      <!-- PAGE 3 -->
      <div class="page-break"></div>
      <section>
        <h2>Pre-registration Payment</h2>
        <table>
          <thead>
            <tr><th>Description</th><th>Amount (AED)</th></tr>
          </thead>
          <tbody>
            ${
              unit.preRegistrationPayment?.breakdown?.length
                ? unit.preRegistrationPayment.breakdown
                    .map(
                      (b) => `
              <tr>
                <td>${b.description}</td>
                <td>${Number(b.amount).toLocaleString()}</td>
              </tr>`
                    )
                    .join("")
                : `<tr><td colspan="2">No pre-registration payments available</td></tr>`
            }
          </tbody>
        </table>
      </section>

      <footer>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </footer>
    </body>
  </html>
  `;
}
