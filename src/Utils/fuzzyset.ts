export let fuzzy_array = [];

export const update_fuzzy = async (value: any) => {
  if (value.length !== 0) {
    fuzzy_array = value;
  }
  return fuzzy_array;
};
