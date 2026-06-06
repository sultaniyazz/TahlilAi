declare module "pdf-parse" {
  const pdfParse: (data: ArrayBuffer | Buffer) => Promise<{ text: string }>; 
  export default pdfParse;
}

declare module "mammoth" {
  interface MammothResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  interface MammothOptions {
    buffer: ArrayBuffer | Buffer;
  }
  const mammoth: {
    extractRawText: (options: MammothOptions) => Promise<MammothResult>;
  };
  export default mammoth;
}
