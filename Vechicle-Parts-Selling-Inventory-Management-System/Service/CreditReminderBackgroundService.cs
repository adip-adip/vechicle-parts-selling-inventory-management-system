using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service;

// Runs daily and sends email reminders to customers with overdue (unpaid) balances
// at 7, 14, and 30 days past the sale date.
public class CreditReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CreditReminderBackgroundService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(24);

    public CreditReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<CreditReminderBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Credit reminder background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SendOverdueRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while sending credit reminders.");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task SendOverdueRemindersAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        // Only consider sales that are still unpaid / pending
        var overdueSales = await db.Sales
            .Include(s => s.Customer)
            .Where(s => s.PaymentStatus == "Pending" || s.PaymentStatus == "Unpaid")
            .ToListAsync(cancellationToken);

        var today = DateTime.UtcNow.Date;
        var reminderDays = new[] { 7, 14, 30 };

        foreach (var sale in overdueSales)
        {
            if (sale.Customer == null || string.IsNullOrWhiteSpace(sale.Customer.Email))
                continue;

            var daysOverdue = (today - sale.SaleDate.Date).Days;

            if (reminderDays.Contains(daysOverdue))
            {
                _logger.LogInformation(
                    "Sending {Days}-day overdue reminder for sale {InvoiceNumber} to {Email}.",
                    daysOverdue, sale.InvoiceNumber, sale.Customer.Email);

                try
                {
                    await emailService.SendCreditReminderAsync(sale, daysOverdue);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to send credit reminder for sale {InvoiceNumber}.", sale.InvoiceNumber);
                }
            }
        }
    }
}
