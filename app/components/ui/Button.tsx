type Props = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
};

export default function Button({
  children,
  variant = "primary",
}: Props) {
  const base =
    "px-6 py-3 rounded-xl font-semibold transition duration-300";

  const style =
    variant === "primary"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "border border-rose-500 text-rose-800 hover:bg-rose-600 hover:text-white";

  return (
    <button className={`${base} ${style}`}>
      {children}
    </button>
  );
}
