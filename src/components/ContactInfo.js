export default function ContactInfo({ register }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-2 text-gray-700">
      <input
        {...register("contactEmail")}
        defaultValue="info@maaia.ae | www.maaia.ae"
        className="w-full border-none outline-none bg-transparent"
      />
      <input
        {...register("contactAddress")}
        defaultValue="Office Number 5202, Ubora Tower, Business Bay, Dubai, UAE"
        className="w-full border-none outline-none bg-transparent"
      />
    </div>
  );
}
