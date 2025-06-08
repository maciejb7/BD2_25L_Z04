interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function UserPagination({
  currentPage,
  totalPages,
  onPageChange,
}: UserPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        {"<"}
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded ${
            page === currentPage
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        {">"}
      </button>
    </div>
  );
}

export default UserPagination;
