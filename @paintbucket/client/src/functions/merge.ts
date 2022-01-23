export function deepMerge<T extends object = {}>(...args: T[]): T {

  // create a new object
  const target: { [key: string]: any } = {}

  // merge the object into the target object
  const merger = (obj: any) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        target[prop] = obj[prop]
      }
    }
  }

  // iterate through all objects and merge them with target
  for (let i = 0; i < args.length; i++) {
    merger(args[i])
  }

  return target as T
}