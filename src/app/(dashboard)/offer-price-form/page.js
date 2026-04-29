"use client";

import {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import generatePDF from "react-to-pdf";
import {
  convertImageToBase64,
  transformSalesOffer,
} from "@/lib/utils";
import { resolvePdfTypography } from "@/lib/pdfTypography";
import {
  ImageUpload,
  ColorPicker,
  FontDropdown,
  InstallmentCSV,
  BulkImageUpload,
  DynamicHeader,
  ContactInfo,
  InvisibleTable,
  SectionCard,
  InputField,
  DynamicButton,
  TermsConditions,
  ProjectDetailsCSVImport,
} from "@/components";
import { useRouter } from "next/navigation";
import {
  createSalesOffer,
  getSalesOfferById,
  updateSalesOffer,
} from "../dashboard/actions";
import PreRegistrationDetails from "@/components/PreRegistrationDetails";
import CSVUpload from "@/components/Offer-Price-Form/CSVUpload";
import PDFPage from "@/components/Offer-Price-Form/PDFPage";

// ============================================================================
// CONSTANTS
// ============================================================================

const PRE_REGISTRATION_RATE = 0.04;
const PDF_RENDER_DELAY = 300;

const DEFAULT_PRE_REGISTRATION_BREAKDOWN = Object.freeze([
  { description: "4% Pre-Registration Charges (DLD Fee)", amount: 0 },
  { description: "Admin Fee + VAT", amount: 5250 },
]);

const DEFAULT_FORM_VALUES = Object.freeze({
  projects: [
    {
      projectName: "",
      location: "",
      country: "",
      elevation: "",
      units: [],
    },
  ],
  salesConsultant: "",
  brokerageAgency: "",
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
      header: { fontSize: "18px", fontWeight: "600" },
      table: { borderColor: "" },
    },
  },
  extra: {
    header: {
      salesOffer: "OFFICIAL SALES OFFER",
      floorPlan: "INDIVIDUAL UNIT FLOOR PLAN",
      preRegistration: "PRE-REGISTRATION FEE TO BE PAID WITH RESERVATION",
    },
    breakdown: DEFAULT_PRE_REGISTRATION_BREAKDOWN.map((row) => ({ ...row })),
    termsAndCondition: ["", "", "", "", "", "", "", "", ""],
  },
});

const PDF_OPTIONS = Object.freeze({
  page: { margin: 10, format: "a4" },
});

const CSV_SAMPLES = Object.freeze({
  projectUnits: {
    content: [
      "Project Name,Floor / Unit No,Unit Type,View,Area (Sq/Ft),Original Price (AED),Offer Price (AED)",
      "Sample Residency,1/101,2BR,Sea View,1200,1600000,1500000",
    ].join("\n"),
    filename: "project-units-sample.csv",
  },
  installment: {
    content: [
      "Installment,% Payable,Milestone,VAT",
      "On Booking,20,Contract Signing,100",
    ].join("\n"),
    filename: "installment-summary-sample.csv",
  },
});

// ============================================================================
// ICONS (Extracted for cleaner JSX)
// ============================================================================

const ImageIcon = () => (
  <svg
    className="w-5 h-5 mr-2 text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const StyleIcon = () => (
  <svg
    className="w-5 h-5 mr-2 text-purple-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// ============================================================================
// UTILITY FUNCTIONS (Pure functions - no React dependencies)
// ============================================================================

/**
 * Downloads a CSV file with the given content
 */
const downloadSampleCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Recursively removes empty string or null values from an object
 */
const removeEmptyValues = (obj) => {
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val === "" || val === null) {
      delete obj[key];
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      removeEmptyValues(val);
      if (!Object.keys(val).length) delete obj[key];
    } else if (val && Array.isArray(val)) {
      // Filter out empty values from arrays
      for (let i = val.length - 1; i >= 0; i--) {
        if (typeof val[i] === "object") {
          removeEmptyValues(val[i]);
        } else if (val[i] === "" || val[i] === null) {
          val.splice(i, 1);
        }
      }
      if (!val.length) delete obj[key];
    }
  });
};

/**
 * Parses a numeric string (with potential commas) to a number
 */
const parseNumericValue = (value) => {
  if (value === undefined) return undefined;
  return typeof value === "string"
    ? parseFloat(value.replace(/,/g, "")) || 0
    : Number(value) || 0;
};

/**
 * Converts a date string to ISO 8601 format (YYYY-MM-DD)
 */
const convertToISODate = (dateValue) => {
  if (!dateValue) return dateValue;

  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) return dateValue;

  let parsedDate;
  if (dateValue.includes("/")) {
    // Format: M/D/YYYY or MM/DD/YYYY
    const parts = dateValue.split("/");
    if (parts.length === 3) {
      const month = parts[0].padStart(2, "0");
      const day = parts[1].padStart(2, "0");
      const year = parts[2];
      parsedDate = new Date(`${year}-${month}-${day}`);
    }
  } else {
    parsedDate = new Date(dateValue);
  }

  return parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toISOString().split("T")[0]
    : dateValue;
};

/**
 * Calculates breakdown data for a unit
 */
const calculateUnitBreakdown = (breakdown, unitPrice, applyDldFromUnit) => {
  const arr = (Array.isArray(breakdown) ? breakdown : []).map((item) => ({
    ...item,
  }));
  if (applyDldFromUnit && arr.length > 0) {
    const first = arr[0] || {};
    arr[0] = {
      ...first,
    amount: Math.round(unitPrice * PRE_REGISTRATION_RATE) || 0,
  };
  }

  const totalAmount = arr.reduce(
    (sum, item) => sum + (Number(item?.amount) || 0),
    0
  );

  const unitBreakdown = arr.map((item) => ({
    description: item.description,
    amount: Number(item.amount) || 0,
  }));

  return { totalAmount, breakdown: unitBreakdown };
};

/**
 * Transforms unit data for submission.
 * Omits `vat` from each installment when there is no VAT (undefined or empty).
 */
const transformUnits = (units) => {
  if (!units) return units;

  return units.map((unit) => {
    const installments = (unit.installments || []).map((inst) => {
      const { vat, ...rest } = inst;
      if (vat != null && vat !== "") {
        return { ...rest, vat };
      }
      return rest;
    });
    return {
      ...unit,
      grossArea: parseNumericValue(unit.grossArea),
      originalPrice: parseNumericValue(unit.originalPrice),
      price: parseNumericValue(unit.price),
      installments,
    };
  });
};

/**
 * Fetches floor plan images in parallel and combines with metadata
 */
const fetchFloorPlanImages = async (unitsArray, projectName) => {
  const imagePromises = [];
  const imageMetadata = [];
  const normalizedProjectName =
    projectName?.trim().toUpperCase().replace(/\s+/g, "_") || "";

  for (const unit of unitsArray) {
    const floorPlans = unit.floorPlans || [];
    for (let j = 0; j < floorPlans.length; j++) {
      imageMetadata.push({
        url: floorPlans[j].layoutsImages,
        name: `${normalizedProjectName}_${unit.unitNo}`,
      });
      imagePromises.push(convertImageToBase64(floorPlans[j].layoutsImages));
    }
  }

  const base64Results = await Promise.all(imagePromises);

  return imageMetadata.map((meta, index) => ({
    ...meta,
    localUrl: base64Results[index],
  }));
};

/**
 * Delays execution for specified milliseconds
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// LOADING COMPONENT
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading sales offer data...</p>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function SalesFormPage() {
  const router = useRouter();
  const targetRef = useRef();
  const searchParams = useSearchParams();

  // State
  const [salesOfferData, setSalesOfferData] = useState([]);
  const [unitsData, setUnitsData] = useState([]);
  const [floorPlanImages, setFloorPlanImages] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [pdfData, setPdfData] = useState();
  const [loading, setLoading] = useState(false);
  const [loaderButton, setLoaderButton] = useState(false);
  const [isDownloadLoader, setIsDownloadLoader] = useState(false);
  const [isAllDownloadLoader, setIsAllDownloadLoader] = useState(false);
  const [projectId, setProjectId] = useState("");
  /** When true, row 0 amount follows 4% of selected unit (Calculate / submit / PDF). Turns false if user removes row 0 or empties the table. */
  const [autoPreRegFromUnit, setAutoPreRegFromUnit] = useState(true);

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // Memoized values to prevent unnecessary re-renders
  const meta = watch("meta");
  const logoUrl = watch("meta.logoUrl");
  const brandColors = watch("meta.brandColors");
  const fontFamily = watch("meta.fonts.0");
  const previewTypography = useMemo(
    () => resolvePdfTypography(fontFamily),
    [fontFamily]
  );

  const projectName = watch("projects.0.projectName");
  const existingUnits = useMemo(
    () => salesOfferData?.projects?.[0]?.units || [],
    [salesOfferData]
  );
  const currentUnitPrice = useMemo(
    () => unitsData[selectedUnit]?.price,
    [unitsData, selectedUnit]
  );
  const currentUnitId = useMemo(
    () =>
      unitsData[selectedUnit]?.unitId ||
      unitsData[selectedUnit]?._id ||
      unitsData[selectedUnit]?.id ||
      "",
    [unitsData, selectedUnit]
  );
  const hasUnits = unitsData.length > 0;

  // ============================================================================
  // HELPER FUNCTIONS (Memoized with useCallback)
  // ============================================================================

  const getFloorPlansForUnit = useCallback(
    (unit, useLocalUrl = false) => {
      return (
        floorPlanImages
          ?.filter((image) => image.name.endsWith("_" + String(unit.unitNo).trim()))
          .map((image) => ({
            layoutsImages: useLocalUrl ? image?.localUrl : image?.url,
          })) || []
      );
    },
    [floorPlanImages]
  );

  const resetToDefaults = useCallback(() => {
    setSelectedUnit(0);
    setUnitsData([]);
    setFloorPlanImages([]);
    setAutoPreRegFromUnit(true);
    reset(DEFAULT_FORM_VALUES);
  }, [reset]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    const id = searchParams.get("id");

    if (!id) {
      resetToDefaults();
      return;
    }

    const fetchSalesOffer = async () => {
      setLoading(true);
      try {
        const data = await getSalesOfferById(id);
        setProjectId(
          data.salesOffer?.project?._id ||
            data.salesOffer?.project?.id ||
            data.salesOffer?.project?.projectId ||
            ""
        );
        const unitsArray = data.salesOffer?.project?.units || [];
        const fetchedProjectName = data.salesOffer?.project?.projectName || "";

        // Fetch floor plan images in parallel
        const floorPlanUnitImages = await fetchFloorPlanImages(
          unitsArray,
          fetchedProjectName
        );
        setFloorPlanImages(floorPlanUnitImages);

        // Transform and set form data
        const formData = await transformSalesOffer(data.salesOffer);
        setSalesOfferData(formData);

        const breakdown =
          formData.projects?.[0]?.units?.[0]?.preRegistrationPayment
            ?.breakdown?.reverse() || [];
        const orderedBreakdown = breakdown
        formData.extra.breakdown = orderedBreakdown;
        setAutoPreRegFromUnit(
          orderedBreakdown.length > 0 &&
          String(orderedBreakdown[0]?.description || "").includes("4%")
        );

        setUnitsData(
          formData.projects?.[0]?.units?.map((unit, index) => ({
            projectName: formData.projects?.[0]?.projectName,
            unitId:
              unitsArray[index]?._id ||
              unitsArray[index]?.id ||
              unitsArray[index]?.unitId ||
              unit?.unitId ||
              "",
            ...unit,
          })) || []
        );

        reset({ ...formData });
      } catch (error) {
        console.error("Error fetching sales offer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOffer();
  }, [searchParams, reset, resetToDefaults]);

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  const prepareSubmissionData = useCallback(
    (formValue) => {
      const data = { ...formValue };
      const breakdown = (watch("extra.breakdown") || []).map((item) => ({
        ...item,
      }));
      const selectedUnits = unitsData || [];

      if (!data.projects?.[0]) {
        data.projects = [{ units: [] }];
      }

      // Units from table state are source of truth; avoid sending stale form units.
      data.projects[0].units = (data.projects[0].units || []).slice(
        0,
        selectedUnits.length
      );

      // Attach floor plans, payment breakdown, and installments from unitsData (source of truth)
      selectedUnits.forEach((unit, index) => {
        if (data.projects?.[0]?.units?.[index]) {
          data.projects[0].units[index].installments = unit.installments || [];
          data.projects[0].units[index].floorPlans = getFloorPlansForUnit(unit);
          data.projects[0].units[index].preRegistrationPayment =
            calculateUnitBreakdown(breakdown, unit.price, autoPreRegFromUnit);
        }
      });

      const { extra, ...rest } = data;
      rest.termsAndCondition = extra?.termsAndCondition.join(" | ");

      // Clean up empty values
      removeEmptyValues(rest);

      // Transform units
      if (rest.projects?.[0]?.units) {
        rest.projects[0].units = transformUnits(rest.projects[0].units);
      }

      // Convert date to ISO format
      if (rest.customer?.date) {
        rest.customer.date = convertToISODate(rest.customer.date);
      }

      return rest;
    },
    [unitsData, watch, getFloorPlansForUnit, autoPreRegFromUnit]
  );

  const onSubmit = useCallback(
    async (formValue) => {
      setLoaderButton(true);
      const id = searchParams.get("id");
      try {
        const submissionData = prepareSubmissionData(formValue);
        await (id
          ? updateSalesOffer(submissionData, id)
          : createSalesOffer(submissionData));
        router.push("/dashboard");
      } catch (error) {
        console.error("Error submitting form:", error);
        alert(`Error: ${error.message || "Failed to submit form"}`);
      } finally {
        setLoaderButton(false);
      }
    },
    [searchParams, router, prepareSubmissionData]
  );

  // ============================================================================
  // PDF GENERATION
  // ============================================================================

  const preparePdfData = useCallback(
    async (useLocalUrl = false) => {
      const data = getValues();
      const breakdown = (watch("extra.breakdown") || []).map((item) => ({
        ...item,
      }));

      // Convert logo to base64
      data.meta.logoUrl = await convertImageToBase64(data.meta.logoUrl);

      // SalesOffer expects top-level termsAndCondition (string); form stores extra.termsAndCondition (array)
      const termsArray = data.extra?.termsAndCondition || [];
      data.termsAndCondition = Array.isArray(termsArray)
        ? termsArray.join(" | ")
        : String(termsArray || "");

      // Attach floor plans to all units
      unitsData.forEach((unit, index) => {
        if (data.projects?.[0]?.units?.[index]) {
          data.projects[0].units[index].floorPlans = getFloorPlansForUnit(
            unit,
            useLocalUrl
          );
        }
      });

      return { data, breakdown };
    },
    [getValues, watch, unitsData, getFloorPlansForUnit]
  );

  const downloadSalesOffer = useCallback(async () => {
    setIsDownloadLoader(true);

    try {
      const { data, breakdown } = await preparePdfData(true);
      const currentUnit = data.projects[0].units[selectedUnit];

      currentUnit.preRegistrationPayment = calculateUnitBreakdown(
        breakdown,
        currentUnit?.price,
        autoPreRegFromUnit
      );

      setPdfData({ ...data });
      await delay(PDF_RENDER_DELAY);

      generatePDF(targetRef, {
        method: "open",
        filename: `${data.projects[0].projectName}-${currentUnit.unitNo}-sales-offer.pdf`,
        ...PDF_OPTIONS,
      });
    } finally {
      setIsDownloadLoader(false);
    }
  }, [preparePdfData, selectedUnit, autoPreRegFromUnit]);

  const downloadSalesOfferAll = useCallback(async () => {
    setIsAllDownloadLoader(true);

    try {
      const { data, breakdown } = await preparePdfData(true);

      for (let index = 0; index < unitsData.length; index++) {
        const currentUnit = data.projects[0].units[index];

        currentUnit.preRegistrationPayment = calculateUnitBreakdown(
          breakdown,
          currentUnit.price,
          autoPreRegFromUnit
        );

        setSelectedUnit(index);
        setPdfData({ ...data });

        await delay(PDF_RENDER_DELAY);

        generatePDF(targetRef, {
          method: "save",
          filename: `${data.projects[0].projectName}-${currentUnit.unitNo}-sales-offer.pdf`,
          ...PDF_OPTIONS,
        });
      }
    } finally {
      setIsAllDownloadLoader(false);
    }
  }, [preparePdfData, unitsData, autoPreRegFromUnit]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleLogoUpload = useCallback(
    (url) => setValue("meta.logoUrl", url),
    [setValue]
  );

  const handleLogoRemove = useCallback(
    () => setValue("meta.logoUrl", ""),
    [setValue]
  );

  const handleBrandColorChange = useCallback(
    (color) => setValue("meta.brandColors", color),
    [setValue]
  );

  const handleProjectUnitsCSVDownload = useCallback(() => {
    downloadSampleCSV(
      CSV_SAMPLES.projectUnits.content,
      CSV_SAMPLES.projectUnits.filename
    );
  }, []);

  const handleInstallmentCSVDownload = useCallback(() => {
    downloadSampleCSV(
      CSV_SAMPLES.installment.content,
      CSV_SAMPLES.installment.filename
    );
  }, []);


  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-[1400px] m-6 p-6 mx-auto space-y-8 bg-gray-50 min-h-screen"
      >
        {/* Sales Offer Header */}
        <DynamicHeader
          register={register}
          name="extra.header.salesOffer"
          meta={meta}
          headerValue="OFFICIAL SALES OFFER"
        />
        <div className="shadow-sm rounded-lg p-6 space-y-4 flex justify-end">
          <ProjectDetailsCSVImport setValue={setValue} />
        </div>
        {/* Form Styles Section */}
        <SectionCard title="Form Styles">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Logo Section */}
            <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ImageIcon />
                Brand Logo
              </h3>
              <ImageUpload
                label="Upload Logo"
                onUpload={handleLogoUpload}
                currentUrl={logoUrl}
              />
              {logoUrl && (
                <div className="mt-4 bg-white rounded-lg p-4 border-2 border-dashed border-gray-200 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      Preview
                    </span>
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  <div className="flex justify-center items-center min-h-[80px] bg-gray-50 rounded">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Styling Options */}
            <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <StyleIcon />
                Document Styling
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Color
                    </label>
                    <ColorPicker
                      onChange={handleBrandColorChange}
                      value={brandColors}
                      placeholder="Choose brand color"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <FontDropdown register={register} name="meta.fonts.0" />
                  </div>
                </div>

                {/* Preview Row */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Style Preview
                  </h4>
                  <div className="space-y-2">
                    <div
                      className={`h-8 rounded flex items-center justify-center text-white text-sm ${previewTypography.fontWeight === undefined
                        ? "font-medium"
                        : ""
                        }`}
                      style={{
                        backgroundColor: brandColors || "#007BFF",
                        fontFamily: previewTypography.fontFamily,
                        ...(previewTypography.fontWeight !== undefined
                          ? { fontWeight: previewTypography.fontWeight }
                          : {}),
                      }}
                    >
                      Header Preview
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Font: {fontFamily || "Default"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Project Details */}
        <SectionCard title="Project Details">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              register={register}
              name="projects.0.projectName"
              placeholder="Project Name"
              label="Project Name"
              required
              validation={{ required: "Project name is required" }}
              error={errors?.projects?.[0]?.projectName?.message}
            />
            <InputField
              register={register}
              name="projects.0.country"
              placeholder="Country"
              label="Country"
            />
            <InputField
              register={register}
              name="projects.0.location"
              placeholder="Location"
              label="Location"
            />
            <InputField
              register={register}
              name="projects.0.elevation"
              placeholder="Elevation"
              label="Elevation"
            />
          </div>
        </SectionCard>

        {/* Terms & Conditions */}
        <SectionCard title="Terms & Conditions">
          <TermsConditions register={register} />
        </SectionCard>

        {/* Project Units */}
        <SectionCard
          title="Project Units"
          buttonText="Download Sample"
          onButtonClick={handleProjectUnitsCSVDownload}
        >
          <CSVUpload
            onDataLoad={setUnitsData}
            register={register}
            setSelectedUnit={setSelectedUnit}
            unitsData={unitsData}
            setValue={setValue}
            autoPreRegFromUnit={autoPreRegFromUnit}
            units={existingUnits}
            projectId={projectId}
          />
          {errors.projects?.[0]?.units && (
            <p className="text-red-500 text-sm mt-2">
              {errors.projects[0].units.message}
            </p>
          )}
        </SectionCard>

        {/* Consultant & Agency */}
        <SectionCard title="Consultant & Agency">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              register={register}
              name="salesConsultant"
              placeholder="Sales Consultant"
              label="Sales Consultant"
            />
            <InputField
              register={register}
              name="brokerageAgency"
              placeholder="Brokerage Agency"
              label="Brokerage Agency"
            />
          </div>
        </SectionCard>

        {/* Installment Summary */}
        <SectionCard
          title="Installment Summary"
          buttonText="Download Sample"
          onButtonClick={handleInstallmentCSVDownload}
        >
          <InstallmentCSV
            setValue={setValue}
            disabled={!hasUnits}
            price={currentUnitPrice}
            units={unitsData}
            setUnitsData={setUnitsData}
            selectedUnit={selectedUnit}
            selectedUnitId={currentUnitId}
          />
        </SectionCard>

        {/* Floor Plan Header */}
        <DynamicHeader
          register={register}
          name="extra.header.floorPlan"
          meta={meta}
          headerValue="INDIVIDUAL UNIT FLOOR PLAN"
        />

        {/* Floor Plans Upload */}
        <SectionCard title="Bulk Upload Floor Plans">
          <BulkImageUpload
            onImagesUpload={setFloorPlanImages}
            imageArray={floorPlanImages}
            projectName={projectName}
          />
        </SectionCard>

        {/* Pre-Registration Header */}
        <DynamicHeader
          register={register}
          name="extra.header.preRegistration"
          meta={meta}
          headerValue="PRE-REGISTRATION FEE TO BE PAID WITH RESERVATION"
        />

        {/* Pre-Registration Payment */}
        <SectionCard title="Pre Registeration Payment">
          <InvisibleTable
            register={register}
            meta={meta}
            control={control}
            autoPreRegFromUnit={autoPreRegFromUnit}
            onDisableAutoPreRegFromUnit={() => setAutoPreRegFromUnit(false)}
          />
          <PreRegistrationDetails register={register} />
        </SectionCard>

        {/* Signature */}
        <SectionCard title="Signature">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              register={register}
              name="customer.name"
              placeholder="Signature Name"
              label="Signature Name"
            />
            <InputField
              register={register}
              type="date"
              name="customer.date"
              placeholder="Date"
              label="Date"
            />
          </div>
        </SectionCard>

        {/* Contact Info */}
        <ContactInfo register={register} />

        {/* Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">

            <div className="flex flex-wrap gap-3">
              <DynamicButton
                type="button"
                onClick={downloadSalesOfferAll}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2"
                variant="success"
                disabled={loaderButton || isAllDownloadLoader}
                loading={isAllDownloadLoader}
              >
                <DownloadIcon />
                Download All PDFs
              </DynamicButton>

              <DynamicButton
                type="button"
                onClick={downloadSalesOffer}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2"
                variant="success"
                disabled={isDownloadLoader || loaderButton}
                loading={isDownloadLoader}
              >
                <DownloadIcon />
                Download PDF
              </DynamicButton>

              <DynamicButton
                type="submit"
                className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-md flex items-center gap-2"
                variant="primary"
                loading={loaderButton}
                disabled={loaderButton}
              >
                <CheckIcon />
                Save Form
              </DynamicButton>
            </div>
          </div>
        </div>
      </form>

      {/* Hidden PDF Preview */}
      <div
        ref={targetRef}
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <PDFPage salesOfferData={pdfData} selectedUnit={selectedUnit} />
      </div>
    </>
  );
}

// ============================================================================
// PAGE EXPORT WITH SUSPENSE
// ============================================================================

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SalesFormPage />
    </Suspense>
  );
}
