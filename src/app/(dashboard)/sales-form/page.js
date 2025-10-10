"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { usePDF } from "react-to-pdf";

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
import { useRouter } from "next/navigation";
import { createSalesOffer, getSalesOfferById } from "../dashboard/actions";
import { transformSalesOffer } from "@/app/lib/utils";

function SalesFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [salesOfferData, setSalesOfferData] = useState([]);
  const [unitsData, setUnitsData] = useState([]);
  const [floorPlanImages, setFloorPlanImages] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [pdfData, setPdfData] = useState();
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
        elevations: "",
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
      try {
        const data = await getSalesOfferById(id);
        const formData = await transformSalesOffer(data.salesOffer);
        setSalesOfferData(formData);

        reset({ ...formData });
      } catch (error) {
        console.error("Error fetching sales offer:", error);
      }
    };
    if (id) {
      fetchSalesOffer(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onSubmit = async (data) => {
    unitsData.forEach((unit, index) => {
      const floorPlans = floorPlanImages
        .filter((image) => {
          console.log(image.name, unit.unitNo, unit.projectName);
          return (
            image.name.includes(unit.unitNo) &&
            image.name.includes(unit.projectName)
          );
        })
        .map((image) => ({ layoutsImages: image.url }));
      data.projects[0].units[index]["floorPlans"] = floorPlans;
      console.log("Floor Plan Images", floorPlans);
    });
    console.log("Data", data);
    const { extra, ...rest } = data;
    console.log(rest);

    try {
      const response = await createSalesOffer(rest);
      console.log("Form submitted successfully:", response);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const downloadSalesOffer = async () => {
    const data = getValues();
    unitsData.forEach((unit, index) => {
      const floorPlans = floorPlanImages
        .filter((image) => {
          return (
            image.name.includes(unit.unitNo) &&
            image.name.includes(unit.projectName)
          );
        })
        .map((image) => {
          return { layoutsImages: image.localUrl };
        });
      data.projects[0].units[index]["floorPlans"] = floorPlans;
    });
    setPdfData(data);
    setTimeout(() => {
      toPDF();
    }, 0);
  };

  const downloadSalesOfferAll = async () => {
    const data = getValues();
    unitsData.forEach((unit, index) => {
      const floorPlans = floorPlanImages
        .filter((image) => {
          return (
            image.name.includes(unit.unitNo) &&
            image.name.includes(unit.projectName)
          );
        })
        .map((image) => {
          return { layoutsImages: image.localUrl };
        });
      data.projects[0].units[index]["floorPlans"] = floorPlans;
      setSelectedUnit(index);
      setPdfData({ ...data });
      setTimeout(() => {
        toPDF();
      }, 0);
    });
  };

  const { toPDF, targetRef } = usePDF({
    method: "save",
    filename: "sales-offer.pdf",
    page: { margin: 10, format: "a4" },
  });

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
          <div className="grid grid-cols-3 gap-4">
            <ImageUpload
              label={"Upload Logo"}
              onUpload={(url) => {
                console.log("URL", url);
                setValue("meta.logoUrl", url);
              }}
              currentUrl={watch("meta.logoUrl")}
            />
            <ColorPicker
              onChange={(color) => setValue("meta.brandColors", color)}
              value={watch("meta.brandColors")}
              placeholder="Brand Color"
            />
            <FontDropdown register={register} name="meta.fonts.0" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FontSizeDropdown
              register={register}
              name="meta.styles.header.fontSize"
            />
            <FontWeightDropdown
              register={register}
              name="meta.styles.header.fontWeight"
            />
            <ColorPicker
              onChange={(color) =>
                setValue("meta.styles.table.borderColor", color)
              }
              value={watch("meta.styles.table.borderColor")}
              placeholder="Border Color"
            />
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
              name="extra.elevations"
              placeholder="Elevations"
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
            units={salesOfferData && salesOfferData.project?.unit}
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
          <BulkImageUpload onImagesUpload={setFloorPlanImages} />
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
            watch={watch}
            units={unitsData}
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
          <button
            type="button"
            onClick={downloadSalesOfferAll}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Download PDF For All Units
          </button>
          <button
            type="button"
            onClick={downloadSalesOffer}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Download PDF
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save
          </button>
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
