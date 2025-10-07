export const transformSalesOffer = (data) => {
  if (!data) return null;

  const offer = data;
  const project = offer.project;
  const meta = project?.meta || {};

  return {
    projects: [
      {
        projectName: project?.projectName || "",
        location: project?.location || "",
        country: project?.country || "",
        units: (project?.units || []).map((unit) => ({
          unitNo: unit?.unitNo || "",
          floorNo: unit?.floorNo || "",
          unitType: unit?.unitType || "",
          view: unit?.view || "",
          grossArea: unit?.grossArea || "",
          price: unit?.price || "",
          installments: (unit?.installments || []).map((inst) => ({
            installment: inst?.installment || "",
            percentagePayable: inst?.percentagePayable || "",
            milestone: inst?.milestone || "",
            milestoneDate: inst?.milestoneDate || "",
            amount: inst?.total || "",
            total: inst?.total || "",
          })),
          preRegistrationPayment: {
            totalAmount:
              unit?.preRegistrationPayments?.reduce(
                (sum, p) => sum + (p?.amount || 0),
                0
              ) || "",
            breakdown: (unit?.preRegistrationPayments || []).map((p) => ({
              description: p?.description || "",
              amount: p?.amount || "",
            })),
          },
          floorPlans: (unit?.floorPlans || []).map((f) => ({
            layoutsImages: f?.layoutsImages || "",
          })),
        })),
      },
    ],

    salesConsultant: offer?.salesConsultant || "",
    brokerageAgency: offer?.brokerageAgency || "",
    customer: {
      name: offer?.customers?.[0]?.name || "",
      date: offer?.customers?.[0]?.date || "",
    },
    meta: {
      logoUrl: meta?.logoUrl || "",
      brandColors: meta?.brandColors || "",
      accentColor: meta?.brandColors || "", // same as brand color (fallback)
      fonts: [meta?.fonts || ""],
      styles: {
        header: {
          fontSize: meta?.styles?.header?.fontSize || "",
          fontWeight: meta?.styles?.header?.fontWeight || "",
        },
        table: {
          borderColor: meta?.styles?.table?.borderColor || "",
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
};

export const convertImageToBase64 = async (url) => {
  try {
    const response = await fetch(
      `/api/proxy-image?url=${encodeURIComponent(url)}`
    );
    console.log("Response", response.url);
    return response.url;
  } catch (error) {
    console.error("Error converting image:", error);
    return url;
  }
};
