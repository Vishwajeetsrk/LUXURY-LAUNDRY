export declare const InvoiceDocument: ({ invoice, logoBuffer, qrBuffer }: {
    invoice: any;
    logoBuffer?: Buffer;
    qrBuffer?: Buffer;
}) => import("react/jsx-runtime").JSX.Element;
export declare function generateInvoicePdfStream(invoice: any, logoBuffer?: Buffer, qrBuffer?: Buffer): Promise<NodeJS.ReadableStream>;
//# sourceMappingURL=generatePdf.d.ts.map