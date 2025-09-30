import React from "react";
import clsx from "clsx";

// Props definition for the Cell component
interface Props extends React.PropsWithChildren<unknown> {
  className?: string;      // Additional CSS classes for styling the cell
  isActive?: boolean;      // Indicates if the cell is active (selected)
  onClick?: () => void;    // Click handler function for clickable cells
}

/**
 * Cell component representing a single calendar grid cell.
 * Applies base styles and conditional styles depending on active and clickable states.
 *
 * @param children - Contents to render inside the cell
 * @param className - Additional CSS classes to apply
 * @param isActive - Whether the cell is active/selected
 * @param onClick - Function to call on click, if clickable and not active
 */
const Cell: React.FC<Props> = ({
  children,
  className,
  isActive = false,
  onClick,
}) => {
  // Disable click event if cell is active to prevent redundant clicks
  const clickHandler = !isActive ? onClick : undefined;

  return (
    <div
      onClick={clickHandler}
      className={clsx(
        // Base styling for cell container
        "h-10 border-b border-r flex items-center justify-center select-none transition-colors",
        // Style adjustments when cell is clickable (not active)
        {
          "cursor-pointer hover:bg-gray-100 active:bg-gray-200": !isActive && onClick,
          // Style for active (selected) cell
          "font-bold text-white bg-blue-600": isActive,
        },
        // Additional user-provided classes
        className
      )}
    >
      {children}
    </div>
  );
};

export default Cell;
