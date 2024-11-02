export const getTime = () => {
  const time = new Date().toLocaleString();
  return `${time} - pkg_list`;
};
