"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import generatePDF from "react-to-pdf";
import { convertImageToBase64 } from "@/app/lib/utils";
import ImageUpload from "../../../components/ImageUpload";
import ColorPicker from "../../../components/ColorPicker";
import FontSizeDropdown from "../../../components/FontSizeDropdown";
import FontWeightDropdown from "../../../components/FontWeightDropdown";
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
      customer: { name: "", date: "" },
      meta: {
        logoUrl: "",
        brandColors: "",
        fonts: [""],
        styles: {
          header: { fontSize: "", fontWeight: "" },
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const unitPrice = unitsData[selectedUnit]?.price || 0;
    const amount = unitPrice * 0.04;
    setValue("extra.breakdown.0.amount", amount);
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
      const totalAmount = element.price * 0.04 + Number(breakdown[1].amount);
      const unitBreakdown = [{}, {}];
      unitBreakdown[0]["description"] = "4% of Sales Price (DLD FEE)";
      unitBreakdown[0]["amount"] = element.price * 0.04;
      unitBreakdown[1]["description"] = "Admin Fee + VAT ";
      unitBreakdown[1]["amount"] = Number(breakdown[1].amount);

      data.projects[0].units[index]["preRegistrationPayment"] = {
        totalAmount: totalAmount,
        breakdown: unitBreakdown,
      };
    });
    const { extra, ...rest } = data;
    rest.projects[0].units.map((unit) => {
      console.log("Submitting unit:", unit.preRegistrationPayment);
    });

    try {
      const response = id
        ? await updateSalesOffer(rest, id)
        : await createSalesOffer(rest);
      console.log("Form submitted successfully:", response);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
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
      const totalAmount = unit.price * 0.04 + Number(breakdown[1].amount);
      const unitBreakdown = [{}, {}];
      unitBreakdown[0]["description"] = "4% of Sales Price (DLD FEE)";
      unitBreakdown[0]["amount"] = unit.price * 0.04;
      unitBreakdown[1]["description"] = "Admin Fee + VAT ";
      unitBreakdown[1]["amount"] = Number(breakdown[1].amount);

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
      method: "save",
      filename: `${data.projects[0].projectName}-${currentUnit.unitNo}-sales-offer.pdf`,
      page: { margin: 10, format: "a4" },
    });
    setLoaderButton(false);
  };

  const downloadSalesOfferAll = async () => {
    setLoaderButton(true);
    const data = getValues();
    const breakdown = { ...watch(`extra.breakdown`) };

    for (let index = 0; index < unitsData.length; index++) {
      const unit = unitsData[index];
      const floorPlans = getFloorPlansForUnit(unit, true);

      if (data.projects?.[0]?.units?.[index]) {
        data.projects[0].units[index].floorPlans = floorPlans;
      }

      const currentUnit = data.projects[0].units[index];
      const totalAmount = unit.price * 0.04 + Number(breakdown[1].amount);
      const unitBreakdown = [{}, {}];
      unitBreakdown[0]["description"] = "4% of Sales Price (DLD FEE)";
      unitBreakdown[0]["amount"] = unit.price * 0.04;
      unitBreakdown[1]["description"] = "Admin Fee + VAT ";
      unitBreakdown[1]["amount"] = Number(breakdown[1].amount);

      data.projects[0].units[index]["preRegistrationPayment"] = {
        totalAmount: totalAmount,
        breakdown: unitBreakdown,
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
        className="p-6 mx-auto space-y-8 bg-gray-50 min-h-screen"
      >
        <DynamicHeader
          register={register}
          name="extra.header.salesOffer"
          meta={watch("meta")}
          headerValue={"OFFICIAL SALES OFFER"}
        />

        {/* Meta */}
        <SectionCard title="Form Styles">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ImageUpload
                label={"Upload Logo"}
                onUpload={(url) => {
                  console.log("URL", url);
                  setValue("meta.logoUrl", url);
                }}
                currentUrl={watch("meta.logoUrl")}
              />
              {watch("meta.logoUrl") && (
                <div className="border rounded-lg p-4 bg-gray-50 relative">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Logo Preview:
                    </p>
                    <button
                      type="button"
                      onClick={() => setValue("meta.logoUrl", "")}
                      className="text-red-500 hover:text-red-700 p-1"
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
                  <img
                    src={watch("meta.logoUrl")}
                    alt="Logo Preview"
                    className="max-h-20 max-w-full object-contain"
                  />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorPicker
                  onChange={(color) => setValue("meta.brandColors", color)}
                  value={watch("meta.brandColors")}
                  placeholder="Brand Color"
                />
                <FontDropdown register={register} name="meta.fonts.0" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FontSizeDropdown
                  register={register}
                  name="meta.styles.header.fontSize"
                />
                <FontWeightDropdown
                  register={register}
                  name="meta.styles.header.fontWeight"
                />
              </div>
              <ColorPicker
                onChange={(color) =>
                  setValue("meta.styles.table.borderColor", color)
                }
                value={watch("meta.styles.table.borderColor")}
                placeholder="Border Color"
              />
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
              required
            />
            <InputField
              register={register}
              name="projects.0.country"
              placeholder="Country"
              required
            />

            <InputField
              register={register}
              name="projects.0.location"
              placeholder="Location"
            />
            <InputField
              register={register}
              name="projects.0.elevation"
              placeholder="Elevation"
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
              required
            />
            <InputField
              register={register}
              name="brokerageAgency"
              placeholder="Brokerage Agency"
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
              required
            />
            <InputField
              register={register}
              type="date"
              name="customer.date"
              placeholder="Date"
              required
            />
          </div>
        </SectionCard>

        <ContactInfo register={register} />

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <DynamicButton
            type="button"
            onClick={downloadSalesOfferAll}
            className="px-6 py-2 rounded-lg"
            variant="success"
            loading={loaderButton}
          >
            Download PDF For All Units
          </DynamicButton>
          <DynamicButton
            type="button"
            onClick={downloadSalesOffer}
            className="px-6 py-2 rounded-lg"
            variant="success"
            loading={loaderButton}
          >
            Download PDF
          </DynamicButton>
          <DynamicButton
            type="submit"
            className="px-6 py-2 rounded-lg"
            variant="primary"
            loading={loaderButton}
          >
            Save
          </DynamicButton>
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
