export default function ContactInfo({ register }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 space-y-4 text-gray-700">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {`Footer Line ( email | website )`}
        </label>
        <input
          {...register("customer.email")}
          defaultValue="info@maaia.ae | www.maaia.ae"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {`Footer Line ( address )`}
        </label>
        <input
          {...register("customer.address")}
          defaultValue="Office Number 5202, Ubora Tower, Business Bay, Dubai, UAE"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
