const TermsConditions = ({ register }) => {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          {...register(`extra.termsAndCondition.${index}`)}
          placeholder={`Term ${index + 1}...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ))}
    </div>
  );
};

export default TermsConditions;
