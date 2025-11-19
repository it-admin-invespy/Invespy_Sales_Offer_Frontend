const TermsConditions = ({ register, control }) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start">
        <textarea
          {...register(`termsAndCondition`)}
          placeholder="Enter terms and conditions..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
        />
      </div>
    </div>
  );
};

export default TermsConditions;
