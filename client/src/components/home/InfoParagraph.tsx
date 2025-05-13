interface InfoParagraphProps {
  title: string;
  description: string;
}

function InfoParagraph({ title, description }: InfoParagraphProps) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
        {title}
      </h2>
      <p className="text-md sm:text-lg md:text-xl text-gray-700 text-lg leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default InfoParagraph;
