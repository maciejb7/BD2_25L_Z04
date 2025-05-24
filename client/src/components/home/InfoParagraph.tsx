interface InfoParagraphProps {
  title: string;
  description: string;
}

function InfoParagraph({ title, description }: InfoParagraphProps) {
  return (
    <div className="flex flex-col justify-center max-w-3xl">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 my-6">
        {title}
      </h2>
      <p className="text-md sm:text-lg md:text-xl text-gray-700">
        {description}
      </p>
      <hr className="my-6" />
    </div>
  );
}

export default InfoParagraph;
