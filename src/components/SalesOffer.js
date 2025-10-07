"use client";

const emptySalesOfferData = {
  projects: [
    {
      projectName: "",
      location: "",
      country: "",
      units: [
        {
          unitNo: "",
          floorNo: "",
          unitType: "",
          view: "",
          grossArea: "",
          price: "",
          installments: [
            {
              installment: "",
              percentagePayable: "",
              milestone: "",
              milestoneDate: "",
              amount: "",
              total: "",
            },
          ],
          preRegistrationPayment: {
            totalAmount: "",
            breakdown: [{ description: "", amount: "" }],
          },
          floorPlans: [
            {
              layoutsImages: "",
            },
          ],
        },
      ],
    },
  ],
  salesConsultant: "",
  brokerageAgency: "",
  customer: {
    name: "",
    date: "",
  },
  meta: {
    logoUrl: "",
    brandColors: "",
    accentColor: "",
    fonts: [""],
    styles: {
      header: {
        fontSize: "",
        fontWeight: "",
      },
      table: {
        borderColor: "",
      },
    },
  },
  extra: {
    elevations: "",
    header: {
      salesOffer: "OFFICIAL SALES OFFER",
      floorPlan: "INDIVIDUAL UNIT FLOOR PLAN",
      preRegistration: "PRE-REGISTRATION FEE TO BE PAID WITH RESERVATION",
    },
  },
};

const SalesOffer = ({ salesOfferData, selectedUnit = 0 }) => {
  const data = salesOfferData || emptySalesOfferData;
  const project = data.projects?.[0];
  const unit = project?.units?.[selectedUnit] || project?.units?.[0];
  const { salesConsultant, brokerageAgency, customer, meta, extra } = data;

  if (!unit) return null;

  const brandColor = meta?.brandColors || "#007BFF";
  const fontFamily = meta?.fonts?.[0] || "Arial, sans-serif";

  return (
    <div
      style={{
        fontFamily,
        color: "#000",
        padding: "20px",
        background: "#fff",
      }}
    >
      <div key={unit.unitNo} style={{ pageBreakAfter: "always" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <img
              src={
                meta?.logoUrl ||
                "https://beansandblends.nl/wp-content/uploads/2025/08/Maaia-General-Trading_logo11.png"
              }
              alt="Logo"
              style={{ width: 160 }}
            />
          </div>

          <div
            style={{
              background: brandColor,
              color: "#fff",
              padding: "12px",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: meta.styles.header.fontSize,
                fontWeight: meta.styles.header.fontWeight,
              }}
            >{`${extra?.header?.salesOffer}`}</h1>
          </div>

          {/* Project Info */}
          <div className="section" style={{ textAlign: "center" }}>
            <p>
              <b>{project.projectName}</b> | <b>{project.location}</b> |{" "}
              <b>{project.country}</b>
            </p>
            <p>({extra?.elevations})</p>
          </div>

          {/* Greeting */}
          <div className="section" style={{ marginTop: 10 }}>
            <p>Dear {customer?.name || "Valued Client"},</p>
            <p>
              Considering the points we discussed, I believe that below listed
              project will cater your requirements.
            </p>
          </div>

          {/* Unit Table */}
          <div className="section">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Project Name",
                    "Unit No",
                    "Floor No",
                    "Unit Type",
                    "View",
                    "Area (Sq/Ft)",
                    "Price (AED)",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        background: brandColor,
                        color: "#fff",
                        padding: "6px",
                        border: "1px solid #ccc",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>
                    {project.projectName}
                  </td>
                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>
                    {unit.unitNo}
                  </td>
                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>
                    {unit.floorNo}
                  </td>
                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>
                    {unit.unitType}
                  </td>
                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>
                    {unit.view}
                  </td>
                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>
                    {unit.grossArea}
                  </td>
                  <td style={{ border: "1px solid #ccc", textAlign: "center" }}>
                    {unit.price}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Consultant Info */}
          <div className="section" style={{ marginTop: 20 }}>
            <p>
              <b>Internal Sales Consultant:</b> {salesConsultant || "N/A"}
            </p>
            <p>
              <b>Brokerage Agency (If Any):</b> {brokerageAgency || "N/A"}
            </p>
            <p style={{ fontSize: 13, marginTop: 10, marginBottom: 10 }}>
              Applicable fees to Dubai Land Department are excluded of the above
              price/plan, plus AED 5,000 Admin Fee.
              <br />
              The above-mentioned is not considered as a reservation until
              signed by the seller and approved by the developer. This is a
              computer-generated proposal and does not require a signature.
            </p>
          </div>

          {/* Installment Plan */}
          <div className="section">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Installment",
                    "% Payable",
                    "Milestone",
                    "Milestone Date",
                    "Amount (AED)",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        background: brandColor,
                        color: "#fff",
                        border: "1px solid #ccc",
                        padding: "6px",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unit.installments.map((inst, i) => (
                  <tr key={i}>
                    <td
                      style={{ border: "1px solid #ccc", textAlign: "center" }}
                    >
                      {inst.installment}
                    </td>
                    <td
                      style={{ border: "1px solid #ccc", textAlign: "center" }}
                    >
                      {inst.percentagePayable}%
                    </td>
                    <td
                      style={{ border: "1px solid #ccc", textAlign: "center" }}
                    >
                      {inst.milestone}
                    </td>
                    <td
                      style={{ border: "1px solid #ccc", textAlign: "center" }}
                    >
                      {inst.milestoneDate}
                    </td>
                    <td
                      style={{ border: "1px solid #ccc", textAlign: "center" }}
                    >
                      {inst.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Floor Plan Images */}
          {unit.floorPlans?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h2
                style={{
                  background: brandColor,
                  color: "#fff",
                  padding: "8px",
                  borderRadius: "4px",
                  textAlign: "center",
                  fontSize: meta.styles.header.fontSize,
                  fontWeight: meta.styles.header.fontWeight,
                }}
              >
                {extra?.header?.floorPlan}
              </h2>
              {unit.floorPlans.map((plan, i) => (
                <img
                  key={i}
                  src={plan.layoutsImages || null}
                  alt={`Floor Plan ${i + 1}`}
                  style={{
                    width: "100%",
                    maxHeight: "600px",
                    objectFit: "contain",
                    marginTop: 10,
                  }}
                />
              ))}
            </div>
          )}

          {/* Pre-registration Payment */}
          <div style={{ marginTop: 20 }}>
            <h2
              style={{
                background: brandColor,
                color: "#fff",
                padding: "8px",
                borderRadius: "4px",
                textAlign: "center",
                fontSize: meta.styles.header.fontSize,
                fontWeight: meta.styles.header.fontWeight,
              }}
            >
              {extra?.header?.preRegistration}
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 10,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      background: brandColor,
                      color: "#fff",
                      border: "1px solid #ccc",
                      padding: "6px",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      background: brandColor,
                      color: "#fff",
                      border: "1px solid #ccc",
                      padding: "6px",
                    }}
                  >
                    Amount (AED)
                  </th>
                </tr>
              </thead>
              <tbody>
                {unit.preRegistrationPayment.breakdown.map((b, i) => (
                  <tr key={i}>
                    <td
                      style={{ border: "1px solid #ccc", textAlign: "center" }}
                    >
                      {b.description}
                    </td>
                    <td
                      style={{ border: "1px solid #ccc", textAlign: "center" }}
                    >
                      {b.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            className="section"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <div>
              <b>Signature:</b> {customer?.name || "N/A"}
            </div>
            <div>
              <b>Date:</b> {customer?.date}
            </div>
          </div>

          <div
            className="section"
            style={{
              marginTop: 30,
              fontSize: 14,
              color: "#555",
              textAlign: "center",
            }}
          >
            <p>info@maaia.ae | www.maaia.ae</p>
            <p>Office Number 5202, Ubora Tower, Business Bay, Dubai, UAE</p>
          </div>
        </div>
    </div>
  );
};

export default SalesOffer;
