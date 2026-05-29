import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const router = Router();

// GET /api/reports/excel
router.get("/excel", authenticate, requirePermission("dashboard:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        service: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders Report");

    worksheet.columns = [
      { header: "Order ID", key: "id", width: 30 },
      { header: "Customer Name", key: "customerName", width: 25 },
      { header: "Customer Phone", key: "customerPhone", width: 15 },
      { header: "Service", key: "serviceName", width: 25 },
      { header: "Status", key: "status", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 25 },
    ];

    orders.forEach(order => {
      worksheet.addRow({
        id: order.id,
        customerName: order.customer.name,
        customerPhone: order.customer.phone || "",
        serviceName: order.service.name,
        status: order.status,
        amount: order.totalAmount,
        date: order.createdAt.toISOString(),
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=orders_report_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export Excel error:", error);
    res.status(500).json({ message: "Server error during export" });
  }
});

// GET /api/reports/pdf
router.get("/pdf", authenticate, requirePermission("dashboard:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        service: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=orders_report_${new Date().toISOString().split('T')[0]}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text("LuxWash Orders Report", { align: "center" });
    doc.moveDown();
    
    if (startDate && endDate) {
      doc.fontSize(12).text(`Date Range: ${new Date(startDate as string).toLocaleDateString()} to ${new Date(endDate as string).toLocaleDateString()}`);
      doc.moveDown();
    }

    let yPosition = doc.y;
    
    // Draw table headers
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Order ID", 30, yPosition);
    doc.text("Customer", 200, yPosition);
    doc.text("Service", 320, yPosition);
    doc.text("Amount", 440, yPosition);
    doc.text("Status", 500, yPosition);
    
    doc.moveDown();
    doc.moveTo(30, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica");

    orders.forEach(order => {
      yPosition = doc.y;
      
      // Add page break if near bottom
      if (yPosition > 750) {
        doc.addPage();
        yPosition = 30;
      }

      doc.text(order.id.substring(0, 15) + "...", 30, yPosition, { width: 160 });
      doc.text(order.customer.name, 200, yPosition, { width: 110 });
      doc.text(order.service.name, 320, yPosition, { width: 110 });
      doc.text(`Rs. ${order.totalAmount}`, 440, yPosition, { width: 50 });
      doc.text(order.status, 500, yPosition, { width: 60 });
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Export PDF error:", error);
    res.status(500).json({ message: "Server error during export" });
  }
});

export default router;
