export default function FontDropdown({ register, name }) {
  const fonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Impact",
    "Comic Sans MS",
    "Courier New",
    "Fjalla One",
    "Poppins",
    "Lora",
    "Montserrat",
    "The Seasons",
    "Founders Grotesk",
    "Helvetica Neue Ultra Light",
    "Helvetica Neue Light",
  ];

  return (
    <select
      {...register(name)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">Select Font</option>
      {fonts.map((font) => (
        <option key={font} value={font}>
          {font}
        </option>
      ))}
    </select>
  );
}
