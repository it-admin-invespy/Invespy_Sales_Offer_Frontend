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
    header: {
      salesOffer: "OFFICIAL SALES OFFER",
      floorPlan: "INDIVIDUAL UNIT FLOOR PLAN",
      preRegistration: "PRE-REGISTRATION FEE TO BE PAID WITH RESERVATION",
    },
  },
};

const SalesOffer = ({ salesOfferData, selectedUnit }) => {
  const data = salesOfferData || emptySalesOfferData;
  const project = data.projects?.[0];
  const unit = project?.units?.[selectedUnit] || project?.units?.[0];
  const { salesConsultant, brokerageAgency, customer, meta, extra } = data;
  const brandColor = meta?.brandColors || "#007BFF";
  const fontFamily = meta?.fonts?.[0] || "Arial, sans-serif";

  const Header = ({ value }) => (
    <div style={{ marginBottom: 30 }}>
      <div
        style={{
          background: brandColor,
          color: "#fff",
          padding: "15px",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: `${meta.styles.header.fontSize}`,
            fontWeight: `${meta.styles.header.fontWeight}`,
            margin: 0,
          }}
        >
          {value}
        </h1>
      </div>
    </div>
  );

  const Footer = () => (
    <div
      style={{
        marginTop: 40,
        paddingTop: 20,
        borderTop: `2px solid ${brandColor}`,
        fontSize: 12,
        color: "#666",
        textAlign: "center",
      }}
    >
      <p style={{ margin: "5px 0", fontWeight: "bold" }}>
        info@maaia.ae | www.maaia.ae
      </p>
      <p style={{ margin: "5px 0" }}>
        Office Number 5202, Ubora Tower, Business Bay, Dubai, UAE
      </p>
    </div>
  );

  return (
    <div
      style={{
        fontFamily,
        color: "#000",
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
      >
        <img src={meta?.logoUrl || null} alt="Logo" style={{ width: 160 }} />
      </div>
      x{/* Page 1 - Sales Offer Details */}
      <div
        style={{
          padding: "30px",
          minHeight: "100vh",
          pageBreakAfter: "always",
        }}
      >
        <Header value={extra?.header?.salesOffer} />

        {/* Project Info */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            marginBottom: 30,
            border: `1px solid ${brandColor}20`,
          }}
        >
          <h2
            style={{
              color: brandColor,
              margin: "0 0 10px 0",
              fontSize: "20px",
            }}
          >
            {project.projectName}
          </h2>
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            <strong>{project.location}</strong> |{" "}
            <strong>{project.country}</strong>
          </p>
          <p style={{ margin: "5px 0", fontStyle: "italic", color: "#666" }}>
            ({project.elevation})
          </p>
        </div>

        {/* Greeting */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: 30,
            borderLeft: `4px solid ${brandColor}`,
          }}
        >
          <p style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
            Dear <strong>Valued Client</strong>,
          </p>
          <p style={{ margin: 0, lineHeight: "1.6" }}>
            Considering the points we discussed, I believe that the below listed
            project will cater to your requirements.
          </p>
        </div>

        {/* Unit Table */}
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ color: brandColor, marginBottom: 15, fontSize: "18px" }}>
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
                      padding: "12px 8px",
                      fontSize: "14px",
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
                  project.projectName,
                  unit.unitNo,
                  unit.floorNo,
                  unit.unitType,
                  unit.view,
                  unit.grossArea,
                  unit.price,
                ].map((value, index) => (
                  <td
                    key={index}
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "12px 8px",
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                      fontSize: "14px",
                    }}
                  >
                    {value}
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
            padding: "20px",
            borderRadius: "8px",
            marginBottom: 30,
          }}
        >
          <h3 style={{ color: brandColor, marginBottom: 15, fontSize: "18px" }}>
            Contact Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: 20,
            }}
          >
            <div>
              <strong>Internal Sales Consultant:</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {salesConsultant || "N/A"}
              </p>
            </div>
            <div>
              <strong>Brokerage Agency:</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {brokerageAgency || "N/A"}
              </p>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "6px",
              padding: "15px",
              fontSize: "13px",
              lineHeight: "1.5",
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
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ color: brandColor, marginBottom: 15, fontSize: "18px" }}>
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
                      padding: "15px 10px",
                      fontSize: "14px",
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
              {unit.installments.map((inst, i) => (
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
                      padding: "12px 10px",
                      fontWeight: "500",
                    }}
                  >
                    {inst.installment}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "12px 10px",
                      color: brandColor,
                      fontWeight: "600",
                    }}
                  >
                    {inst.percentagePayable}%
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "12px 10px",
                    }}
                  >
                    {inst.milestone}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "12px 10px",
                    }}
                  >
                    {inst.milestoneDate}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                      padding: "12px 10px",
                      fontWeight: "600",
                      color: "#28a745",
                    }}
                  >
                    {inst.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Header value={extra?.header?.floorPlan} />
          {unit.floorPlans?.length > 0 && (
            <div style={{ padding: "30px" }}>
              <div>
                <div
                  style={{
                    display: "grid",
                    gap: "30px",
                    justifyItems: "center",
                  }}
                >
                  {unit.floorPlans.map((plan, i) => (
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
                        src={plan.layoutsImages || null}
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
      </div>
      {/* Page 3 - Pre-registration Payment */}
      <div
        style={{
          padding: "30px",
          minHeight: "100vh",
        }}
      >
        {/* Pre-registration Payment */}
        <Header value={extra?.header?.preRegistration} />

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
            {unit.preRegistrationPayment.breakdown.map((b, i) => (
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
                  {b.description}
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
                  {b.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Footer />
      </div>
    </div>
  );
};

export default SalesOffer;
