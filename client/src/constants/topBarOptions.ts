export interface TopBarOption {
  name: string;
  link: string;
  visible: boolean;
}

/**
 * Global options for the top bar.
 */
export const options: TopBarOption[] = [
  { name: "Strona Główna", link: "/", visible: false },
  { name: "Logowanie", link: "/login", visible: false },
  { name: "Rejestracja", link: "/register", visible: false },
];

/**
 * Function to get the top bar options.
 * @param visibleOptions - An array of option names that should be visible.
 * @returns The top bar options with visibility set based on the provided names.
 */
export const getTopBarOptions = (visibleOptions?: string[]) => {
  options.forEach((option) => {
    if (visibleOptions && visibleOptions.includes(option.name))
      option.visible = true;
    else option.visible = false;
  });

  return options;
};
