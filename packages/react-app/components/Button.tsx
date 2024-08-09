type Props = {
  title: string;
  onClick: () => void;
  widthFull?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

function PrimaryButton({
  title,
  onClick,
  widthFull = false,
  disabled,
  loading,
  className = "",
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${widthFull ? "w-full" : "px-4"}
        ${className}
        font-bold
        rounded-2xl
        py-3
        flex
        justify-center
        items-center
        transition-colors
        ${
          disabled || loading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-colors-secondary text-white hover:bg-colors-primaryComp"
        }
      `}
    >
      {loading ? "Loading..." : title}
    </button>
  );
}

export default PrimaryButton;