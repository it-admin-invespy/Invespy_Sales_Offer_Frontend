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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "8px",
          fontSize: `${meta?.styles?.header?.fontSize || "24px"}`,
          fontWeight: `${meta?.styles?.header?.fontWeight || "700"}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div>{sanitizeText(value)}</div>
      </div>
    </div>
  );

  const Footer = () => (
    <div
      style={{
        borderTop: `2px solid ${brandColor}`,
        paddingTop: "8px",
        textAlign: "center",
      }}
    >
      <p style={{ margin: "3px 0", fontWeight: "bold", fontSize: "10px" }}>
        info@maaia.ae | www.maaia.ae
      </p>
      <p style={{ margin: "3px 0", fontSize: "9px" }}>
        Office Number 5202, Ubora Tower, Business Bay, Dubai, UAE
      </p>
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
        {/* Greeting */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: 15,
            borderLeft: `4px solid ${brandColor}`,
          }}
        >
          <p style={{ margin: "0 0 6px 0", fontSize: "13px" }}>
            Dear <strong>Valued Client</strong>,
          </p>
          <p style={{ margin: 0, lineHeight: "1.4", fontSize: "12px" }}>
            Considering the points we discussed, I believe that the below listed
            project will cater to your requirements.
          </p>
        </div>

        {/* Unit Table */}
        <div style={{ marginBottom: 15 }}>
          <h3 style={{ color: brandColor, marginBottom: 8, fontSize: "14px" }}>
            Unit Details
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              overflow: "hidden",
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
                      background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
                      color: "#fff",
                      padding: "8px 6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
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
                  unit?.grossArea || "",
                  unit?.price || "",
                ].map((value, index) => (
                  <td
                    key={index}
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "8px 6px",
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                      fontSize: "11px",
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
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "12px",
            borderRadius: "6px",
          }}
        >
          <h3 style={{ color: brandColor, marginBottom: 8, fontSize: "14px" }}>
            Contact Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: 12,
            }}
          >
            <div>
              <strong style={{ fontSize: "12px" }}>
                Internal Sales Consultant:
              </strong>
              <p style={{ margin: "3px 0", color: "#666", fontSize: "11px" }}>
                {sanitizeText(salesConsultant) || "N/A"}
              </p>
            </div>
            <div>
              <strong style={{ fontSize: "12px" }}>Brokerage Agency:</strong>
              <p style={{ margin: "3px 0", color: "#666", fontSize: "11px" }}>
                {sanitizeText(brokerageAgency) || "N/A"}
              </p>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "6px",
              padding: "10px",
              fontSize: "10px",
              lineHeight: "1.3",
            }}
          >
            <strong>Important Notice:</strong>
            <br />
            Applicable fees to Dubai Land Department are excluded from the above
            price/plan, plus AED 5,000 Admin Fee. The above-mentioned is not
            considered as a reservation until signed by the seller and approved
            by the developer. This is a computer-generated proposal and does not
            require a signature.
          </div>
        </div>

        {/* Payment Plan */}
        <div style={{ width: "100%" }}>
          <h3 style={{ color: brandColor, marginBottom: 8, fontSize: "14px" }}>
            Payment Schedule
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              overflow: "hidden",
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
                      background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
                      color: "#fff",
                      padding: "8px 6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center",
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
                    backgroundColor: i % 2 === 0 ? "#f8f9fa" : "#fff",
                    transition: "background-color 0.2s",
                  }}
                >
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "6px 4px",
                      fontWeight: "500",
                      fontSize: "10px",
                    }}
                  >
                    {sanitizeText(inst?.installment)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "6px 4px",
                      color: brandColor,
                      fontWeight: "600",
                      fontSize: "10px",
                    }}
                  >
                    {sanitizeText(String(inst?.percentagePayable || 0))}%
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "6px 4px",
                      fontSize: "10px",
                    }}
                  >
                    {sanitizeText(inst?.milestone)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "6px 4px",
                      fontSize: "10px",
                    }}
                  >
                    {sanitizeText(inst?.milestoneDate)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "6px 4px",
                      fontWeight: "600",
                      color: "#28a745",
                      fontSize: "10px",
                    }}
                  >
                    {sanitizeText(String(inst?.total || 0))}
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
          gap: "0.2rem",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Header value={extra?.header?.salesOffer} />
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
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: `2px solid ${brandColor}20`,
                    }}
                  >
                    <img
                      src={plan?.layoutsImages || null}
                      alt={`Floor Plan ${i + 1}`}
                      style={{
                        width: "100%",
                        maxHeight: "600px",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                    />
                    <p
                      style={{
                        textAlign: "center",
                        marginTop: "15px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: brandColor,
                      }}
                    >
                      Floor Plan {i + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
      {/* Page 3 */}
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
        <Header value={extra?.header?.salesOffer} />
        <div style={{ flex: 1, width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
                    color: "#fff",
                    padding: "15px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
                    color: "#fff",
                    padding: "15px",
                    fontSize: "14px",
                    fontWeight: "600",
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
                    backgroundColor: i % 2 === 0 ? "#f8f9fa" : "#fff",
                  }}
                >
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "15px",
                      fontSize: "14px",
                    }}
                  >
                    {sanitizeText(b?.description)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "15px",
                      fontWeight: "600",
                      color: "#28a745",
                      fontSize: "14px",
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
    </>
  );
};

export default SalesOffer;
