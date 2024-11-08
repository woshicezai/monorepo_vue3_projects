import { getTest } from '@/utils/test'

export const getTime = () => {
  const time = new Date().toLocaleString()
  return `${time} - pkg_list - ${getTest()}`
}
