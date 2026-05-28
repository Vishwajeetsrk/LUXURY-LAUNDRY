export declare function sendEmail({ to, subject, html }: {
    to: string;
    subject: string;
    html: string;
}): Promise<void>;
export declare function buildOrderConfirmationEmail(order: any): string;
//# sourceMappingURL=email.d.ts.map