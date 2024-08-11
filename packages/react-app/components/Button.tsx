import Spinner from "./Spinner";

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
            : "bg-gradient-to-r from-[#fcb603] to-[#f98307] text-white hover:bg-colors-primaryComp"
        }
      `}
    >
      {loading ? <Spinner /> : title}
    </button>
  );
}

export default PrimaryButton;