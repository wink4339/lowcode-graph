const appHelper = {
  utils: {
    demoUtil: (...params: any[]) => { console.log(`this is a demoUtil with params ${params}`)},
    execCommandEvent: (...args: any) => { 
      console.log("参数", args) 
    }
  },
  constants: {
    ConstantA: 'ConstantA',
    ConstantB: 'ConstantB'
  }
};
export default appHelper;