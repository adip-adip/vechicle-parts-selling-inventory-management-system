using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service;

public class LowStockBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LowStockBackgroundService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(24);

    public LowStockBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<LowStockBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Low stock background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckLowStockAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking low stock.");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task CheckLowStockAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var lowStockParts = await db.VehicleParts
            .Where(p => p.StockQuantity < 10)
            .ToListAsync(cancellationToken);

        if (lowStockParts.Count == 0)
        {
            _logger.LogInformation("No low-stock parts found.");
            return;
        }

        _logger.LogInformation("Found {Count} low-stock part(s). Sending alert.", lowStockParts.Count);

        try
        {
            await emailService.SendLowStockAlertBatchAsync(lowStockParts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send low stock alert.");
        }
    }
}
