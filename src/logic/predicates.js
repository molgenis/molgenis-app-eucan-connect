export const sortAsc = prop => (a, b) => {
  if (a[prop] > b[prop]) return 1
  if (a[prop] < b[prop]) return -1

  return 0
}

export const sortDesc = prop => (a, b) => {
  if (a[prop] > b[prop]) return -1
  if (a[prop] < b[prop]) return 1

  return 0
}

export const unique = prop => (obj, index, self) => {
  return self.findIndex(arr => arr[prop] === obj[prop] && obj[prop]) === index
}
