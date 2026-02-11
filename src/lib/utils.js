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
        elevation: project?.elevation || "",
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
              vat: inst?.vat != null ? inst.vat : undefined,
            })),
            preRegistrationPayment: {
              totalAmount:
                (unit?.preRegistrationPayments || []).reduce(
                  (sum, p) => sum + (p?.amount || 0),
                  0
                ) || 0,
              breakdown: (unit?.preRegistrationPayments || []).map((p) => ({
                description: p?.description || "",
                amount: p?.amount || 0,
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
    termsAndCondition: offer?.termsAndCondition || "",
    customer: {
      name: offer?.customers?.[0]?.name || "",
      date: offer?.customers?.[0]?.date || "",
      email: offer?.customers?.[0]?.email || "",
      address: offer?.customers?.[0]?.address || "",
    },
    meta: {
      logoUrl: (await convertImageToBase64(meta?.logoUrl)) || "",
      brandColors: meta?.brandColors || "",
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
      header: {
        salesOffer: "OFFICIAL SALES OFFER",
        floorPlan: "INDIVIDUAL UNIT FLOOR PLAN",
        preRegistration: "PRE-REGISTRATION FEE TO BE PAID WITH RESERVATION",
      },
      termsAndCondition:
        offer?.termsAndCondition?.split("|").map((t) => t.trim()) || [],
    },
  };
};

export const createPayloadForDuplicateObj = (objectA) => {
  if (!objectA || !objectA.project) return null;

  try {
    return {
      projects: [
        {
          projectName: objectA?.project?.projectName || "",
          location: objectA?.project?.location || "",
          country: objectA?.project?.country || "",
          units: (objectA?.project?.units || []).map((unit) => ({
            unitNo: unit?.unitNo || "",
            floorNo: unit?.floorNo || "",
            unitType: unit?.unitType || "",
            view: unit?.view || "",
            grossArea: parseFloat(unit?.grossArea || 0),
            price: parseFloat(unit?.price || 0),

            // combine pre-registration payments into a single object
            preRegistrationPayment: {
              totalAmount: (unit?.preRegistrationPayments || []).reduce(
                (sum, p) => sum + (p?.amount || 0),
                0
              ),
              breakdown: (unit?.preRegistrationPayments || []).map((p) => ({
                description: p?.description || "",
                amount: p?.amount || 0,
              })),
            },

            // map installments array
            installments: (unit?.installments || []).map((inst) => ({
              installment: inst?.installment || "",
              percentagePayable: parseFloat(inst?.percentagePayable || 0),
              milestone: inst?.milestone || "",
              milestoneDate: inst?.milestoneDate || null,
              total: parseFloat(inst?.total || 0),
            })),

            // keep only image URLs
            floorPlans: (unit?.floorPlans || []).map((fp) => ({
              layoutsImages: fp?.layoutsImages || "",
            })),
          })),
        },
      ],
      salesConsultant: objectA?.salesConsultant || "",
      brokerageAgency: objectA?.brokerageAgency || "",
      termsAndCondition: objectA?.termsAndCondition || "",

      // take first customer (assuming one)
      customer: objectA?.customers?.length
        ? {
            name: objectA.customers[0]?.name || "",
            date: objectA.customers[0]?.date || "",
            email: objectA.customers[0]?.email || "",
            address: objectA.customers[0]?.address || "",
          }
        : { name: "", date: "", email: "", address: "" },

      // meta information
      meta: {
        logoUrl: objectA?.project?.meta?.logoUrl || "",
        brandColors: objectA?.project?.meta?.brandColors || "",
        fonts: objectA?.project?.meta?.fonts
          ? [objectA.project.meta.fonts]
          : [],
        styles: objectA?.project?.meta?.styles || {},
      },
    };
  } catch (error) {
    console.error("Error creating payload for duplicate:", error);
    return null;
  }
};

export const convertImageToBase64 = async (url) => {
  if (!url || typeof url !== "string") return url;

  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return url;
    }

    const response = await fetch(
      `/api/proxy-image?url=${encodeURIComponent(url)}`
    );
    return response.url;
  } catch (error) {
    console.error("Error converting image:", error);
    return url;
  }
};

export const formatCurrency = (amount) => {
  const parsedAmount = parseFloat(amount);
  return parsedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const parsePercentage = (value) => {
  return parseFloat(value?.replace(/[^0-9.]/g, "") || "0");
};

export const calculateAmount = (percentage, price) => {
  return ((percentage || 0) / 100) * (price || 0);
};

export const parseNumericValue = (value) => {
  if (typeof value === "number") return value;
  return parseFloat(String(value).replace(/,/g, "")) || 0;
};

export const formatArea = (value) => {
  return Math.round(parseNumericValue(value)).toLocaleString("en-US");
};
