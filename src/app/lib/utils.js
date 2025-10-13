export const transformSalesOffer = async (data) => {
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
        units: await Promise.all(
          (project?.units || []).map(async (unit) => ({
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
            floorPlans: await Promise.all(
              (unit?.floorPlans || []).map(async (f) => ({
                layoutsImages:
                  (await convertImageToBase64(f?.layoutsImages)) || "",
              }))
            ),
          }))
        ),
      },
    ],

    salesConsultant: offer?.salesConsultant || "",
    brokerageAgency: offer?.brokerageAgency || "",
    customer: {
      name: offer?.customers?.[0]?.name || "",
      date: offer?.customers?.[0]?.date || "",
    },
    meta: {
      logoUrl: (await convertImageToBase64(meta?.logoUrl)) || "",
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

export const createPayloadForDuplicateObj = (objectA) => {
  if (!objectA || !objectA.project) return null;

  return {
    projects: [
      {
        projectName: objectA.project.projectName,
        location: objectA.project.location,
        country: objectA.project.country,
        units: objectA.project.units.map((unit) => ({
          unitNo: unit.unitNo,
          floorNo: unit.floorNo,
          unitType: unit.unitType,
          view: unit.view,
          grossArea: parseFloat(unit.grossArea),
          price: parseFloat(unit.price),

          // combine pre-registration payments into a single object
          preRegistrationPayment: {
            totalAmount: unit.preRegistrationPayments.reduce(
              (sum, p) => sum + p.amount,
              0
            ),
            breakdown: unit.preRegistrationPayments.map((p) => ({
              description: p.description,
              amount: p.amount,
            })),
          },

          // map installments array
          installments: unit.installments.map((inst) => ({
            installment: inst.installment,
            percentagePayable: parseFloat(inst.percentagePayable),
            milestone: inst.milestone,
            milestoneDate: inst.milestoneDate || null,
            total: parseFloat(inst.total),
          })),

          // keep only image URLs
          floorPlans: unit.floorPlans.map((fp) => ({
            layoutsImages: fp.layoutsImages,
          })),
        })),
      },
    ],
    salesConsultant: objectA.salesConsultant,
    brokerageAgency: objectA.brokerageAgency,

    // take first customer (assuming one)
    customer:
      objectA.customers && objectA.customers.length
        ? {
            name: objectA.customers[0].name,
            date: objectA.customers[0].date,
          }
        : null,

    // meta information
    meta: {
      logoUrl: objectA.project.meta.logoUrl,
      brandColors: objectA.project.meta.brandColors,
      fonts: objectA.project.meta.fonts ? [objectA.project.meta.fonts] : [],
      styles: objectA.project.meta.styles,
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
