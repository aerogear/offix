function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  export default timeout;