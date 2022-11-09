import React from "react";

type IButton = {
  name: string;
  onClick?: () => any;
  link?: string;
  disabled?: boolean;
};

const Button = ({ name, onClick, link, disabled, ...rest }: IButton) => {
  let buttonClasses =
    "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800";
  if (disabled) {
    buttonClasses += "cursor-not-allowed";
  }
  return link ? (
    <a
      href={link}
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      {...rest}
    >
      {name}
    </a>
  ) : (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {name}
    </button>
  );
};

export default Button;
