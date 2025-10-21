"use client";

const emptySalesOfferData = {
  projects: [
    {
      projectName: "",
      location: "",
      country: "",
      elevation: "",
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
    header: {
      salesOffer: "OFFICIAL SALES OFFER",
      floorPlan: "INDIVIDUAL UNIT FLOOR PLAN",
      preRegistration: "PRE-REGISTRATION FEE TO BE PAID WITH RESERVATION",
    },
  },
};

const SalesOffer = ({ salesOfferData, selectedUnit }) => {
  const data = salesOfferData || emptySalesOfferData;
  const project = data?.projects?.[0];
  const unit = project?.units?.[selectedUnit] || project?.units?.[0];
  const { salesConsultant, brokerageAgency, customer, meta, extra } =
    data || {};
  const brandColor = meta?.brandColors || "#007BFF";
  const fontFamily = meta?.fonts?.[0] || "Arial, sans-serif";

  const sanitizeText = (text) => {
    if (typeof text !== "string") return "";
    return text.replace(/[<>"'&]/g, (match) => {
      const entities = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return entities[match];
    });
  };

  const Header = ({ value }) => (
    <div
      style={{
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <img src={meta?.logoUrl || null} alt="Logo" style={{ width: 140 }} />
      </div>
      <div
        style={{
          background: brandColor,
          color: "#fff",
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "600",
          padding: "12px 0",
        }}
      >
        *** {sanitizeText(value)} ***
      </div>
    </div>
  );

  const Footer = () => (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{ fontSize: "12px", display: "flex", alignItems: "center" }}
        >
          <strong>Customer signature:</strong>{" "}
          <div
            style={{
              color: "#333",
              borderBottom: "1px solid #000",
              paddingBottom: "10px",
              paddingLeft: "5px",
              minWidth: "150px",
              marginLeft: "5px",
            }}
          >
            {sanitizeText(customer?.name) || ""}
          </div>
        </div>
        <div
          style={{
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <strong>Date:</strong>{" "}
          <span
            style={{
              color: "#333",
              borderBottom: "1px solid #000",
              paddingBottom: "10px",
              paddingLeft: "5px",
              minWidth: "150px",
              marginLeft: "5px",
            }}
          >
            {sanitizeText(customer?.date) || ""}
          </span>
        </div>
      </div>
      <div
        style={{
          paddingTop: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "3px 0", fontWeight: "bold", fontSize: "12px" }}>
          info@maaia.ae | www.maaia.ae
        </p>
        <p style={{ margin: "3px 0", fontSize: "12px" }}>
          Office Number 5202, Ubora Tower, Business Bay, Dubai, UAE
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Page 1 */}
      <div
        style={{
          height: "306mm",
          display: "flex",
          width: "210mm",
          gap: "0.5rem",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Header value={extra?.header?.salesOffer} />
        <div
          style={{
            marginTop: "-10px",
            width: "100%",
          }}
        >
          {/* Project Details */}
          <div
            style={{
              textAlign: "center",
              marginTop: "-10px",
            }}
          >
            <div style={{ fontSize: "12px", marginBottom: "8px" }}>
              <strong>{project?.projectName || ""}</strong>,{" "}
              {project?.location || ""} - {project?.country || ""}
            </div>
            <div style={{ fontSize: "12px", color: "#333" }}>
              {`(${project?.elevation || ""})`}
            </div>
          </div>

          {/* Greeting */}
          <div style={{ width: "100%" }}>
            <div style={{ margin: "0px", fontSize: "12px" }}>Dear,</div>
            <div style={{ margin: 0, lineHeight: "1.5", fontSize: "12px" }}>
              Considering the points we discussed, I believe that the below
              listed project will cater to your requirements.
            </div>
          </div>
        </div>

        {/* Unit Table */}
        <div style={{ marginBottom: 20 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #000",
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
                      padding: "10px 8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textAlign: "center",
                      border: "1px solid #000",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  project?.projectName || "",
                  unit?.unitNo || "",
                  unit?.floorNo || "",
                  unit?.unitType || "",
                  unit?.view || "",
                  Number(unit?.grossArea) || "",
                  Number(unit?.price) || "",
                ].map((value, index) => (
                  <td
                    key={index}
                    style={{
                      border: "1px solid #000",
                      textAlign: "center",
                      padding: "10px 8px",
                      backgroundColor: "#fff",
                      fontSize: "12px",
                    }}
                  >
                    {sanitizeText(String(value))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Consultant Info */}
        <div style={{ fontSize: "12px", width: "100%" }}>
          <strong>Internal Sales Consultant:</strong>{" "}
          <span style={{ color: "#333" }}>
            {sanitizeText(salesConsultant) || ""}
          </span>
        </div>
        <div style={{ fontSize: "12px", width: "100%" }}>
          <strong>{`Brokerage Agency (if any)`} :</strong>{" "}
          <span style={{ color: "#333" }}>
            {sanitizeText(brokerageAgency) || ""}
          </span>
        </div>
        <div
          style={{
            fontSize: "12px",
            lineHeight: "1.4",
          }}
        >
          Applicable fees to Dubai Land Department are excluded from the above
          price/plan, plus AED 5,000 Admin Fee. The above-mentioned is not
          considered as a reservation until signed by the seller and approved by
          the developer. This is a computer-generated proposal and does not
          require a signature.
        </div>

        {/* Payment Plan */}
        <div style={{ width: "100%" }}>
          <div
            style={{
              background: brandColor,
              color: "#fff",
              textAlign: "center",
              fontSize: "16px",
              fontWeight: "600",
              padding: "12px 0",
              marginBottom: "10px",
            }}
          >
            *** INSTALLMENT PLAN ***
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #000",
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
                      padding: "10px 8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textAlign: "center",
                      border: "1px solid #000",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(unit?.installments || []).map((inst, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: "#fff",
                  }}
                >
                  <td
                    style={{
                      border: "1px solid #000",
                      textAlign: "center",
                      padding: "8px 6px",
                      fontWeight: "500",
                      fontSize: "12px",
                    }}
                  >
                    {sanitizeText(inst?.installment)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      textAlign: "center",
                      padding: "8px 6px",
                      fontWeight: "600",
                      fontSize: "12px",
                    }}
                  >
                    {Number(inst?.percentagePayable || 0)}%
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      textAlign: "center",
                      padding: "8px 6px",
                      fontSize: "12px",
                    }}
                  >
                    {sanitizeText(inst?.milestone)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      textAlign: "center",
                      padding: "8px 6px",
                      fontSize: "12px",
                    }}
                  >
                    {sanitizeText(inst?.milestoneDate)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      textAlign: "center",
                      padding: "8px 6px",
                      fontWeight: "600",
                      fontSize: "12px",
                    }}
                  >
                    {Number(inst?.total || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>
      {/* Page 2  */}
      <div
        style={{
          height: "306mm",
          display: "flex",
          width: "210mm",
          gap: "2rem",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Header value={extra?.header?.preRegistration} />
        <div style={{ flex: 1, width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #000",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "15px",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "1px solid #000",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    padding: "15px",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "1px solid #000",
                  }}
                >
                  Amount (AED)
                </th>
              </tr>
            </thead>
            <tbody>
              {(unit?.preRegistrationPayment?.breakdown || []).map((b, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: "#fff",
                  }}
                >
                  <td
                    style={{
                      border: "1px solid #000",
                      textAlign: "center",
                      padding: "15px",
                      fontSize: "12px",
                    }}
                  >
                    {sanitizeText(b?.description)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      textAlign: "center",
                      padding: "15px",
                      fontWeight: "600",
                      fontSize: "12px",
                    }}
                  >
                    {sanitizeText(String(b?.amount || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>
      {/* Page 3 */}
      <div
        style={{
          height: "306mm",
          display: "flex",
          width: "210mm",
          gap: "0.2rem",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Header value={extra?.header?.floorPlan} />
        {(unit?.floorPlans?.length || 0) > 0 && (
          <div style={{ padding: "30px" }}>
            <div>
              <div
                style={{
                  display: "grid",
                  gap: "30px",
                  justifyItems: "center",
                }}
              >
                {(unit?.floorPlans || []).map((plan, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "20px",
                    }}
                  >
                    <img
                      src={plan?.layoutsImages || null}
                      alt={`Floor Plan ${i + 1}`}
                      style={{
                        width: "100%",
                        maxHeight: "600px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
};

export default SalesOffer;
