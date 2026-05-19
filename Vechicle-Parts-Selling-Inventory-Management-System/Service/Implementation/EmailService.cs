using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Implementation;

public class EmailService : IEmailService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public EmailService(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task SendInvoiceEmailAsync(int saleId)
    {
        var sale = await _dbContext.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.VehiclePart)
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == saleId);

        if (sale == null)
            throw new InvalidOperationException($"Sale with id {saleId} not found.");

        var body = BuildInvoiceBody(sale);

        await SendEmailAsync(
            to: sale.Customer!.Email,
            subject: $"Invoice {sale.InvoiceNumber} - Vehicle Parts Inventory",
            body: body);
    }

    public async Task SendLowStockAlertAsync(VehiclePart part)
    {
        // Configured in appsettings.json as Smtp:AdminEmail
        var adminEmail = _configuration["Smtp:AdminEmail"];
        if (string.IsNullOrWhiteSpace(adminEmail))
            return;

        var body = $@"
<html>
<body>
    <h2 style=""color:red;"">⚠ Low Stock Alert</h2>
    <p>The following part has dropped below the minimum stock threshold (10 units):</p>
    <table style=""border-collapse:collapse;"">
        <tr><th style=""text-align:left;padding:4px 12px;"">Field</th><th style=""text-align:left;padding:4px 12px;"">Value</th></tr>
        <tr><td style=""padding:4px 12px;"">Part ID</td><td style=""padding:4px 12px;"">{part.Id}</td></tr>
        <tr><td style=""padding:4px 12px;"">Part Name</td><td style=""padding:4px 12px;"">{part.Name}</td></tr>
        <tr><td style=""padding:4px 12px;"">Category</td><td style=""padding:4px 12px;"">{part.Category ?? "N/A"}</td></tr>
        <tr><td style=""padding:4px 12px;"">Current Stock</td><td style=""padding:4px 12px;""><strong style=""color:red;"">{part.StockQuantity}</strong></td></tr>
    </table>
    <p>Please reorder this part from a vendor as soon as possible.</p>
</body>
</html>";

        await SendEmailAsync(
            to: adminEmail,
            subject: $"Low Stock Alert: {part.Name} ({part.StockQuantity} units remaining)",
            body: body);
    }

    public async Task SendLowStockAlertBatchAsync(List<VehiclePart> parts)
    {
        var adminEmail = _configuration["Smtp:AdminEmail"];
        if (string.IsNullOrWhiteSpace(adminEmail)) return;

        var rows = string.Join("", parts.Select(p => $@"
            <tr>
                <td style=""padding:6px 12px;"">{p.Id}</td>
                <td style=""padding:6px 12px;"">{p.Name}</td>
                <td style=""padding:6px 12px;"">{p.Category ?? "N/A"}</td>
                <td style=""padding:6px 12px;""><strong style=""color:red;"">{p.StockQuantity}</strong></td>
            </tr>"));

        var body = $@"
<html>
<body>
    <h2 style=""color:red;"">⚠ Low Stock Alert — {parts.Count} Part(s) Low on Stock</h2>
    <p>The following parts have dropped below the minimum stock threshold (10 units):</p>
    <table style=""border-collapse:collapse;border:1px solid #ddd;"">
        <tr style=""background:#f2f2f2;"">
            <th style=""text-align:left;padding:6px 12px;"">ID</th>
            <th style=""text-align:left;padding:6px 12px;"">Name</th>
            <th style=""text-align:left;padding:6px 12px;"">Category</th>
            <th style=""text-align:left;padding:6px 12px;"">Stock</th>
        </tr>
        {rows}
    </table>
    <p>Please reorder these parts from vendors as soon as possible.</p>
</body>
</html>";

        await SendEmailAsync(adminEmail, $"Low Stock Alert: {parts.Count} part(s) below minimum threshold", body);
    }

    public async Task SendCreditReminderAsync(Sale sale, int daysOverdue)
    {
        if (sale.Customer == null)
            return;

        var body = $@"
<html>
<body>
    <h2>Payment Reminder — {daysOverdue} Days Overdue</h2>
    <p>Dear {sale.Customer.FirstName} {sale.Customer.LastName},</p>
    <p>This is a reminder that the following invoice is overdue by <strong>{daysOverdue} days</strong>.</p>
    <table style=""border-collapse:collapse;"">
        <tr><th style=""text-align:left;padding:4px 12px;"">Field</th><th style=""text-align:left;padding:4px 12px;"">Value</th></tr>
        <tr><td style=""padding:4px 12px;"">Invoice Number</td><td style=""padding:4px 12px;"">{sale.InvoiceNumber}</td></tr>
        <tr><td style=""padding:4px 12px;"">Sale Date</td><td style=""padding:4px 12px;"">{sale.SaleDate:yyyy-MM-dd}</td></tr>
        <tr><td style=""padding:4px 12px;"">Amount Owed</td><td style=""padding:4px 12px;""><strong>${sale.TotalAmount:F2}</strong></td></tr>
        <tr><td style=""padding:4px 12px;"">Days Overdue</td><td style=""padding:4px 12px;""><strong style=""color:red;"">{daysOverdue}</strong></td></tr>
    </table>
    <p>Please settle the outstanding balance at your earliest convenience. Contact us if you have any questions.</p>
    <p>Thank you,<br/>Vehicle Parts Inventory Team</p>
</body>
</html>";

        await SendEmailAsync(
            to: sale.Customer.Email,
            subject: $"Payment Reminder ({daysOverdue} days overdue) — Invoice {sale.InvoiceNumber}",
            body: body);
    }

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpHost = _configuration["Smtp:Host"]!;
        var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
        var smtpUsername = _configuration["Smtp:Username"]!;
        var smtpPassword = _configuration["Smtp:Password"]!;
        var fromEmail = _configuration["Smtp:FromEmail"]!;

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = true
        };

        var message = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(to);

        await client.SendMailAsync(message);
    }

    private static string BuildInvoiceBody(Sale sale)
    {
        var itemsHtml = string.Join("", sale.SaleItems.Select(item =>
            $"<tr><td>{item.VehiclePart.Name}</td><td>{item.Quantity}</td><td>${item.UnitPrice:F2}</td><td>${item.Subtotal:F2}</td></tr>"
        ));

        return $@"
<html>
<head><style>
    table {{ width:100%; border-collapse:collapse; }}
    th,td {{ padding:8px; text-align:left; border-bottom:1px solid #ddd; }}
    th {{ background-color:#f2f2f2; }}
</style></head>
<body>
    <h2>Invoice: {sale.InvoiceNumber}</h2>
    <p><strong>Customer:</strong> {sale.Customer!.FirstName} {sale.Customer.LastName}</p>
    <p><strong>Email:</strong> {sale.Customer.Email}</p>
    <p><strong>Date:</strong> {sale.SaleDate:yyyy-MM-dd}</p>
    <table>
        <tr><th>Part</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
        {itemsHtml}
    </table>
    <h3>Total: ${sale.TotalAmount:F2}</h3>
    <p>Thank you for your business!</p>
</body>
</html>";
    }
}
