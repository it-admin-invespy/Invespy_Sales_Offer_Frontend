"use client";

import React from "react";
import { resolvePdfTypography } from "@/lib/pdfTypography";

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
              // milestoneDate: "",
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
  termsAndCondition: "",
  customer: {
    name: "",
    date: "",
    email: "",
    address: "",
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

/** A4 — use the same height on every “page” block so PDF slice boundaries align with sections. */
const A4_PAGE = {
  width: "210mm",
  height: "297mm",
  minHeight: "297mm",
  maxHeight: "297mm",
  boxSizing: "border-box",
  overflow: "hidden",
};

const PDFPage = ({ salesOfferData, selectedUnit }) => {
  const data = salesOfferData || emptySalesOfferData;
  const project = data?.projects?.[0];
  const unit = project?.units?.[selectedUnit] || project?.units?.[0];
  const { customer, meta, extra, termsAndCondition } = data || {};
  const brandColor = meta?.brandColors || "#007BFF";

  const { fontFamily, fontWeight } = resolvePdfTypography(meta?.fonts?.[0]);
  const pdfRootFontStyle = {
    fontFamily,
    ...(fontWeight !== undefined ? { fontWeight } : {}),
  };


  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString();
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
          flexShrink: 0,
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <img
          src={meta?.logoUrl || null}
          alt="Logo"
          className="w-auto h-auto max-h-[100px]"
          style={{ margin: 5 }}
        />
      </div>
      <div
        style={{
          background: brandColor,
          color: "#fff",
          height: "55px",
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "600",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div>***</div> {value} <div>***</div>
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
              minWidth: "150px",
              marginTop: "24px",
              marginLeft: "5px",
            }}
          ></div>
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
              marginTop: "24px",
              minWidth: "150px",
              marginLeft: "5px",
            }}
          ></span>
        </div>
      </div>
      <div
        style={{
          paddingTop: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "3px 0", fontWeight: "bold", fontSize: "12px" }} className="">
          {customer.email}
        </p>
        <p style={{ margin: "3px 0", fontSize: "12px" }} className="">{customer.address}</p>
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
          alignItems: "center",
          ...pdfRootFontStyle,
        }}
      >
        <Header value={extra?.header?.salesOffer} />
        <div
          style={{
            width: "100%",
            flex: 1,
          }}
        >
          {/* Project Details */}
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "12px", marginBottom: "8px" }}>
              <strong>{project?.projectName || ""}</strong>,{" "}
              {project?.location || project?.country && (
                project?.location || "" - project?.country || ""
              )
              }
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
          {/* Unit Table */}
          <div style={{ marginTop: "20px", marginBottom: "10px" }}>
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
                    "Price Excl. VAT (AED)",
                    "Price Incl. VAT (AED)"
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
                    formatNumber(unit?.grossArea) || "",
                    formatNumber(unit?.price) || "",
                    formatNumber(unit?.price + (unit?.price * 5) / 100)
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
                      {String(value)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          {/* Consultant Info */}
          <div
            style={{
              fontSize: "12px",
              width: "100%",
              lineHeight: "1.4",
              fontWeight: 900,
            }}
          >
            <div
              style={{
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              Internal Sales Consultant:
            </div>{" "}
            <div
              style={{
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              {`Brokerage Agency (if any)`} :
            </div>{" "}
          </div>
          {/* Terms & Condition */}
          <div
            style={{
              fontSize: "12px",
              lineHeight: "1.4",
              marginTop: "20px",
              marginBottom: "30px",
            }}
          >
            {termsAndCondition &&
              termsAndCondition.split("|").splice(0, 6).map((term, i) => (
                <React.Fragment key={i}>
                  {term.trim() !== "" && (
                    <div className="flex items-start">
                      <div className="font-bold text-black mr-1">*</div>
                      <div>{term}</div>
                    </div>
                  )}
                </React.Fragment>
              ))}
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
                paddingBottom: "20px",
                paddingTop: "10px",
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
                    "Amount Excl. VAT (AED)",
                    "5% VAT Amount (AED)",
                    "Amount INCL. VAT (AED)",
                    ...((unit?.installments || []).some(
                      (inst) => inst?.vat != null && inst?.vat !== "" && inst.vat > 0
                    )
                      ? ["VAT %", "Amount after VAT"]
                      : []),
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
                {(unit?.installments || []).map((inst, i) => {
                  const totalNum = Number(inst?.total) || 0;
                  // const vatNum = Number(inst?.vat) || 0;
                  const vatPrice = (totalNum * 5) /100;
                  const amountAfterVat = totalNum +  vatPrice;
                  // const showVatColumns = (unit?.installments || []).some(
                  //   (instItem) =>
                  //     instItem?.vat != null && instItem?.vat !== "" && instItem.vat > 0
                  // );
                  return (
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
                        {inst?.installment}
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
                        {inst?.milestone}
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
                        {formatNumber(inst?.total)}
                      </td>
                      {/* {showVatColumns && ( */}
                        <>
                          <td
                            style={{
                              border: "1px solid #000",
                              textAlign: "center",
                              padding: "8px 6px",
                              fontWeight: "600",
                              fontSize: "12px",
                            }}
                          >
                            {/* {formatNumber(inst?.vat)} */}
                            {vatPrice}
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
                            {formatNumber(amountAfterVat)}
                          </td>
                        </>
                      {/* // )} */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </div>
      {/* Page 2  */}
      {unit?.preRegistrationPayment?.breakdown?.length > 0 && <div
        style={{
          height: "306mm",
          display: "flex",
          width: "210mm",
          gap: "2rem",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          ...pdfRootFontStyle,
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
                    {b?.description}
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
                    {formatNumber(b?.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Terms & Condition */}
          <div
            style={{
              fontSize: "12px",
              lineHeight: "1.4",
              marginTop: "20px",
              marginBottom: "30px",
            }}
          >
            {termsAndCondition &&
              termsAndCondition.split("|").splice(6).map((term, i) => (
                term.trim() != "" && (
                  <div className="flex items-start">
                    <div className="font-bold text-black mr-1">*</div>
                    <div>{term}</div>
                  </div>
                )
              ))}
          </div>
        </div>
        <Footer />
      </div>}
      
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
          ...pdfRootFontStyle,
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

export default PDFPage;
