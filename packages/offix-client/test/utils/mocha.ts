export const skipRestOnFail = () => {
  beforeEach(function() {
    if (this.currentTest.parent.failedTests) {
      this.skip();
    }
  });
  
  afterEach(function() {
    if (this.currentTest.state === "failed") {
      this.currentTest.parent.failedTests = true;
    }
  });
};
