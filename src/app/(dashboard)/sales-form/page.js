"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import generatePDF from "react-to-pdf";
import { convertImageToBase64 } from "@/app/lib/utils";
import ImageUpload from "../../../components/ImageUpload";
import ColorPicker from "../../../components/ColorPicker";
import FontDropdown from "../../../components/FontDropdown";
import CSVUpload from "../../../components/CSVUpload";
import InstallmentCSV from "../../../components/InstallmentCSV";
import BulkImageUpload from "../../../components/BulkImageUpload";
import DynamicHeader from "../../../components/DynamicHeader";
import ContactInfo from "../../../components/ContactInfo";
import InvisibleTable from "../../../components/InvisibleTable";
import SalesOffer from "../../../components/SalesOffer";
import { SectionCard, InputField } from "../../../components/FormComponents";
import DynamicButton from "../../../components/DynamicButton";
import { useRouter } from "next/navigation";
import {
  createSalesOffer,
  getSalesOfferById,
  updateSalesOffer,
} from "../dashboard/actions";
import { transformSalesOffer } from "@/app/lib/utils";

function SalesFormPage() {
  const router = useRouter();
  const targetRef = useRef();
  const searchParams = useSearchParams();
  const [salesOfferData, setSalesOfferData] = useState([]);
  const [unitsData, setUnitsData] = useState([]);
  const [floorPlanImages, setFloorPlanImages] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [pdfData, setPdfData] = useState();
  const [loading, setLoading] = useState(false);
  const [loaderButton, setLoaderButton] = useState(false);
  const csvImportRef = useRef();

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
    defaultValues: {
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
        breakdown: [],
      },
    },
  });

  useEffect(() => {
    const id = searchParams.get("id");
    const fetchSalesOffer = async (id) => {
      setLoading(true);
      try {
        const data = await getSalesOfferById(id);
        console.log("Fetched sales offer data:", data);
        const floorPlanUnitImages = [];
        const unitsArray = data.salesOffer?.project?.units;
        for (let i = 0; i < unitsArray?.length; i++) {
          const fp = unitsArray[i].floorPlans;
          for (let j = 0; j < fp.length; j++) {
            floorPlanUnitImages.push({
              url: fp[j].layoutsImages,
              name: `${unitsArray[i].unitNo} - floorPlan - ${j + 1}`,
              localUrl: await convertImageToBase64(fp[j].layoutsImages),
            });
          }
        }
        setFloorPlanImages(floorPlanUnitImages);
        const formData = await transformSalesOffer(data.salesOffer);
        setSalesOfferData(formData);
        const breakdown =
          formData.projects?.[0]?.units?.[0]?.preRegistrationPayment?.breakdown;
        formData.extra.breakdown = breakdown || [];
        setUnitsData(
          formData.projects?.[0]?.units?.map((unit) => {
            return {
              projectName: formData.projects?.[0]?.projectName,
              ...unit,
            };
          }) || []
        );
        reset({ ...formData });
      } catch (error) {
        console.error("Error fetching sales offer:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchSalesOffer(id);
    } else {
      setSelectedUnit(0);
      setUnitsData([]);
      setFloorPlanImages([]);
      reset({
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
          breakdown: [],
        },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const breakdown = watch(`extra.breakdown`);
    if (breakdown.length > 0 && unitsData.length > 0) {
      const unitPrice = unitsData[selectedUnit]?.price || 0;
      const amount = unitPrice * 0.04;
      setValue("extra.breakdown.0.amount", amount);
    }
  }, [selectedUnit, unitsData]);

  const onSubmit = async (formValue) => {
    const data = formValue;
    setLoaderButton(true);
    const id = searchParams.get("id");
    unitsData.forEach((unit, index) => {
      const floorPlans = getFloorPlansForUnit(unit);
      if (data.projects?.[0]?.units?.[index]) {
        data.projects[0].units[index]["floorPlans"] = floorPlans;
      }
    });
    const breakdown = { ...watch(`extra.breakdown`) };
    unitsData.forEach((element, index) => {
      const totalAmount = Object.values(breakdown).reduce((sum, item) => {
        return sum + (Number(item?.amount) || 0);
      }, 0);
      const unitBreakdown = Object.values(breakdown).map((item) => ({
        description: item.description,
        amount: Number(item.amount) || 0,
      }));

      data.projects[0].units[index]["preRegistrationPayment"] = {
        totalAmount: totalAmount,
        breakdown: unitBreakdown,
      };
    });
    const { extra, ...rest } = data;

    // Remove empty string or null values
    const removeEmptyValues = (obj) => {
      Object.keys(obj).forEach((key) => {
        const val = obj[key];
        if (val === "" || val === null) {
          delete obj[key];
        } else if (val && typeof val === "object" && !Array.isArray(val)) {
          removeEmptyValues(val);
          if (!Object.keys(val).length) delete obj[key];
        } else if (val && Array.isArray(val)) {
          val.forEach((item, index) => {
            if (typeof item === "object") {
              removeEmptyValues(item);
            } else if (item === "" || item === null) {
              val.splice(index, 1);
            }
          });
          removeEmptyValues(val);
          if (!Object.keys(val).length) delete obj[key];
        }
      });
    };

    removeEmptyValues(rest);

    console.log("Submitting form data:", rest);

    try {
      const response = id
        ? await updateSalesOffer(rest, id)
        : await createSalesOffer(rest);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.message || "Failed to submit form"}`);
    } finally {
      setLoaderButton(false);
    }
  };

  const downloadSalesOffer = async () => {
    setLoaderButton(true);
    const data = getValues();
    const breakdown = { ...watch(`extra.breakdown`) };
    const currentUnit = data.projects[0].units[selectedUnit];
    unitsData.forEach((unit, index) => {
      const floorPlans = getFloorPlansForUnit(unit, true);
      if (data.projects?.[0]?.units?.[index]) {
        data.projects[0].units[index]["floorPlans"] = floorPlans;
      }
      const totalAmount = Object.values(breakdown).reduce((sum, item) => {
        return sum + (Number(item?.amount) || 0);
      }, 0);
      const unitBreakdown = Object.values(breakdown).map((item) => ({
        description: item.description,
        amount: Number(item.amount) || 0,
      }));

      currentUnit["preRegistrationPayment"] = {
        totalAmount: totalAmount,
        breakdown: unitBreakdown,
      };
    });
    setPdfData({ ...data });
    // Wait for the DOM to update (React render cycle)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Then trigger PDF for the updated view
    generatePDF(targetRef, {
      method: "open",
      filename: `${data.projects[0].projectName}-${currentUnit.unitNo}-sales-offer.pdf`,
      page: { margin: 10, format: "a4" },
    });
    setLoaderButton(false);
  };

  const downloadSalesOfferAll = async () => {
    setLoaderButton(true);
    const data = getValues();
    const breakdown = [...watch(`extra.breakdown`)];

    for (let index = 0; index < unitsData.length; index++) {
      const unit = unitsData[index];
      const floorPlans = getFloorPlansForUnit(unit, true);

      if (data.projects?.[0]?.units?.[index]) {
        data.projects[0].units[index].floorPlans = floorPlans;
      }

      const currentUnit = data.projects[0].units[index];
      const totalAmount = Object.values(breakdown).reduce((sum, item) => {
        return sum + (Number(item?.amount) || 0);
      }, 0);

      data.projects[0].units[index]["preRegistrationPayment"] = {
        totalAmount: totalAmount,
        breakdown: breakdown,
      };

      setSelectedUnit(index);
      setPdfData({ ...data });

      // Wait for the DOM to update (React render cycle)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Then trigger PDF for the updated view
      generatePDF(targetRef, {
        method: "save",
        filename: `${data.projects[0].projectName}-${currentUnit.unitNo}-sales-offer.pdf`,
        page: { margin: 10, format: "a4" },
      });
      setLoaderButton(false);
    }
  };

  const getFloorPlansForUnit = (unit, useLocalUrl = false) => {
    return (
      floorPlanImages
        ?.filter((image) => {
          return image?.name?.includes(unit?.unitNo);
        })
        .map((image) => ({
          layoutsImages: useLocalUrl ? image?.localUrl : image?.url,
        })) || []
    );
  };

  const handleCSVImport = () => {
    csvImportRef.current?.click();
  };

  const handleCSVFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const lines = csv.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        if (lines.length > 1) {
          console.log("CSV lines:", lines);
          const values = lines[1].split(",").map((v) => v.trim());

          // Map CSV headers to form fields
          headers.forEach((header, index) => {
            const value = values[index] || "";

            switch (header.toLowerCase()) {
              case "brand color":
                setValue("meta.brandColors", value);
                break;
              case "font family":
                setValue("meta.fonts.0", value);
                break;
              case "project name":
                setValue("projects.0.projectName", value);
                break;
              case "country":
                setValue("projects.0.country", value);
                break;
              case "location":
                setValue("projects.0.location", value);
                break;
              case "elevation":
                setValue("projects.0.elevation", value);
                break;
              case "sales consultant":
                setValue("salesConsultant", value);
                break;
              case "brokerage agency":
                setValue("brokerageAgency", value);
                break;
              case "signature":
                setValue("customer.name", value);
                break;
              case "date":
                setValue(
                  "customer.date",
                  new Date(value).toISOString().split("T")[0]
                );
                break;
              case "email-website":
                setValue("customer.email", value);
                break;
              case "address":
                const addressValue = `${value}, ${values[index + 1]}, ${
                  values[index + 2]
                }, ${values[index + 3]}`;
                const cleaned = addressValue.replace(/[@#$"]/g, "");
                setValue("customer.address", cleaned);
                break;
            }
          });
        }
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales offer data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-[1400px] m-6 p-6 mx-auto space-y-8 bg-gray-50 min-h-screen"
      >
        <DynamicHeader
          register={register}
          name="extra.header.salesOffer"
          meta={watch("meta")}
          headerValue={"OFFICIAL SALES OFFER"}
        />

        {/* Meta */}
        <SectionCard title="Form Styles">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Logo Section */}
            <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
                Brand Logo
              </h3>
              <ImageUpload
                label={"Upload Logo"}
                onUpload={(url) => {
                  setValue("meta.logoUrl", url);
                }}
                currentUrl={watch("meta.logoUrl")}
              />
              {watch("meta.logoUrl") && (
                <div className="mt-4 bg-white rounded-lg p-4 border-2 border-dashed border-gray-200 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setValue("meta.logoUrl", "")}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                    >
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
                    </button>
                  </div>
                  <div className="flex justify-center items-center min-h-[80px] bg-gray-50 rounded">
                    <img
                      src={watch("meta.logoUrl")}
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
                Document Styling
              </h3>

              <div className="space-y-6">
                {/* Input Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Color
                    </label>
                    <ColorPicker
                      onChange={(color) => setValue("meta.brandColors", color)}
                      value={watch("meta.brandColors")}
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
                      className="h-8 rounded flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        backgroundColor: watch("meta.brandColors") || "#007BFF",
                      }}
                    >
                      Header Preview
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Font: {watch("meta.fonts.0") || "Default"}
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

        {/* CSV Upload */}
        <SectionCard title="Project Units">
          <CSVUpload
            onDataLoad={setUnitsData}
            register={register}
            setSelectedUnit={setSelectedUnit}
            unitsData={unitsData}
            units={salesOfferData?.projects?.[0]?.units || []}
          />
          {errors.projects?.[0]?.units && (
            <p className="text-red-500 text-sm mt-2">
              {errors.projects[0].units.message}
            </p>
          )}
        </SectionCard>

        {/* Consultant */}
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
        <SectionCard title="Installment Summary">
          <InstallmentCSV
            setValue={setValue}
            disabled={unitsData.length === 0}
            price={unitsData[selectedUnit]?.price}
            units={unitsData}
          />
        </SectionCard>

        <DynamicHeader
          register={register}
          name="extra.header.floorPlan"
          meta={watch("meta")}
          headerValue={"INDIVIDUAL UNIT FLOOR PLAN"}
        />

        {/* Bulk Upload Floor Plans */}
        <SectionCard title="Bulk Upload Floor Plans">
          <BulkImageUpload
            onImagesUpload={setFloorPlanImages}
            imageArray={floorPlanImages}
          />
        </SectionCard>

        <DynamicHeader
          register={register}
          name="extra.header.preRegistration"
          meta={watch("meta")}
          headerValue={"PRE-REGISTRATION FEE TO BE PAID WITH RESERVATION"}
        />

        <SectionCard title="Pre Registeration Payment">
          <InvisibleTable
            register={register}
            meta={watch("meta")}
            control={control}
          />
        </SectionCard>

        {/* Customer */}
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

        <ContactInfo register={register} />

        {/* Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Import Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
              </div>
              <div>
                <DynamicButton
                  type="button"
                  onClick={handleCSVImport}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                  variant="secondary"
                >
                  Import Fields from CSV
                </DynamicButton>
                <p className="text-xs text-gray-500 mt-1">
                  Upload CSV to auto-fill form fields
                </p>
              </div>
            </div>

            <input
              ref={csvImportRef}
              type="file"
              accept=".csv"
              onChange={handleCSVFileChange}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <DynamicButton
                type="button"
                onClick={downloadSalesOfferAll}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2"
                variant="success"
                loading={loaderButton}
              >
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
                Download All PDFs
              </DynamicButton>

              <DynamicButton
                type="button"
                onClick={downloadSalesOffer}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2"
                variant="success"
                loading={loaderButton}
              >
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
                Download PDF
              </DynamicButton>

              <DynamicButton
                type="submit"
                className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-md flex items-center gap-2"
                variant="primary"
                loading={loaderButton}
              >
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
                Save Form
              </DynamicButton>
            </div>
          </div>
        </div>
      </form>

      <div
        ref={targetRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
        }}
      >
        <SalesOffer salesOfferData={pdfData} selectedUnit={selectedUnit} />
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SalesFormPage />
    </Suspense>
  );
}
