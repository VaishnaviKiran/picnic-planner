import React from "react";
import clsx from "clsx";

// Props definition for the Button component
interface Props extends React.PropsWithChildren<unknown> {
  onClick?: () => void;    // Click event handler
  className?: string;      // Additional CSS classes for styling
}

/**
 * Reusable Button component
 * - Renders a styled button element
 * - Accepts click handler and additional CSS classes as props
 *
 * @param onClick - Function called when the button is clicked
 * @param className - Extra CSS classes to apply
 * @param children - Button content (text, icons, etc.)
 */
const Button: React.FC<Props> = ({ onClick, className, children }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-white bg-blue-600 active:bg-blue-700 text-sm px-4 py-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
