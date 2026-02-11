const PreRegistrationDetails = ({ register }) => {
  return (
    <div className="space-y-4">
      {[6, 7, 8].map((value , index) => (
        <input
          key={value}
          {...register(`extra.termsAndCondition.${value}`)}
          placeholder={`Term ${index + 1}...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ))}
    </div>
  );
};

export default PreRegistrationDetails;
