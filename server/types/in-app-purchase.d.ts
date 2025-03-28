declare module 'in-app-purchase' {
  function config(options: Record<string, any>): void;
  function setup(): Promise<void>;
  function validate(receiptData: string): Promise<any>;
  function isValidated(response: any): boolean;
  function getPurchaseData(response: any): any[];
}