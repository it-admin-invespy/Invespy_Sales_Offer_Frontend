export default function ContactInfo({ register }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4 text-gray-700">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Footer Line 1
        </label>
        <input
          {...register("extra.contactEmail")}
          defaultValue="info@maaia.ae | www.maaia.ae"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Footer Line 2
        </label>
        <input
          {...register("extra.contactAddress")}
          defaultValue="Office Number 5202, Ubora Tower, Business Bay, Dubai, UAE"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
