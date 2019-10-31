const waitFor = async (conditionFn, time = 0) => {
  while (!(await conditionFn())) {
    await new Promise(resolve => setTimeout(resolve, time));
  }
};

export default waitFor;
