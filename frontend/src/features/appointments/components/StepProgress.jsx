export default function StepProgress({ step, totalSteps }) {
  return (
    <div className="mt-3 flex gap-1.5" role="presentation">
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 flex-1 rounded-full ${index < step ? "bg-pink-600" : "bg-gray-200"}`}
        />
      ))}
    </div>
  );
}
