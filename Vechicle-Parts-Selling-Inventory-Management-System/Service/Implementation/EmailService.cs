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

        var smtpHost = _configuration["Smtp:Host"]!;
        var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
        var smtpUsername = _configuration["Smtp:Username"]!;
        var smtpPassword = _configuration["Smtp:Password"]!;
        var fromEmail = _configuration["Smtp:FromEmail"]!;

        var body = BuildInvoiceBody(sale);

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = true
        };

        var message = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = $"Invoice {sale.InvoiceNumber} - Vehicle Parts Inventory",
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(sale.Customer!.Email);

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
