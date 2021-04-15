/**
 * Performs parallel fn's on array
 * @param array Array to batch process
 * @param fn Function to perform on each member of array
 * @param parallel Number of operations to perform in parallel
 * @param fnArgs additional arguments to pass to function
 */
export const asyncBatchProcess = async (
  array: any[],
  fn,
  parallel: number,
  fnArgs = {}
) => {
  const parallelBatches = Math.ceil(array.length / parallel);

  // Split up the Array
  let k = 0;
  const allValues = [];
  for (let i = 0; i < array.length; i += parallel) {
    k++;
    const promises = [];
    for (let j = 0; j < parallel; j++) {
      const elem = i + j;
      // only proceed if there is an element
      if (array[elem] != undefined) {
        // Promise to take Screenshots
        promises.push(fn(array[elem], fnArgs));
      }
    }

    // await promise all and close browser
    await Promise.all(promises).then(values => {
      allValues.push(...values);
    });
  }
  return allValues;
};
