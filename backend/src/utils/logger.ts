export const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, ...args);
  },
  otp: (email: string, otp: string) => {
    console.log('\n==============================================');
    console.log(`📧 [PADOSIPRO OTP DISPATCH]`);
    console.log(`To: ${email}`);
    console.log(`Code: [ ${otp} ] (Valid for 10 minutes)`);
    console.log('==============================================\n');
  }
};
