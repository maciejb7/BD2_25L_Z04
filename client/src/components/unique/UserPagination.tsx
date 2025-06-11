interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * UserPagination is a component that displays pagination controls for user lists.
 */
function UserPagination({
  currentPage,
  totalPages,
  onPageChange,
}: UserPaginationProps) {
  const getPagesToShow = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();

    pages.add(1);
    pages.add(totalPages);

    if (currentPage === 1 || currentPage === 2) {
      pages.add(2);
    } else if (currentPage === totalPages || currentPage === totalPages - 1) {
      pages.add(totalPages - 1);
    } else {
      pages.add(currentPage);
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const pages = getPagesToShow();

  return (
    <div className="flex justify-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        {"<"}
      </button>

      {pages.map((page, idx) => {
        const prev = pages[idx - 1];
        const showDots = prev && page - prev > 1;

        return (
          <span key={page} className="flex items-center">
            {showDots && <span className="px-2">...</span>}
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

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
