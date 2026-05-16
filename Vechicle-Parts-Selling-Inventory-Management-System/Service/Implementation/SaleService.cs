using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Implementation;

public class SaleService : ISaleService
{
    private readonly AppDbContext _dbContext;
    private readonly IEmailService _emailService;

    public SaleService(AppDbContext dbContext, IEmailService emailService)
    {
        _dbContext = dbContext;
        _emailService = emailService;
    }

    public async Task<Sale> CreateSaleAsync(CreateSaleDto dto)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.Id == dto.CustomerId);
            if (customer == null)
                throw new InvalidOperationException($"Customer with id {dto.CustomerId} not found.");

            decimal totalAmount = 0;
            var saleItems = new List<SaleItem>();
            var lowStockParts = new List<VehiclePart>();

            foreach (var item in dto.Items)
            {
                var part = await _dbContext.VehicleParts.FirstOrDefaultAsync(p => p.Id == item.VehiclePartId);
                if (part == null)
                    throw new InvalidOperationException($"Part with id {item.VehiclePartId} not found.");

                if (part.StockQuantity < item.Quantity)
                    throw new InvalidOperationException($"Insufficient stock for '{part.Name}'. Available: {part.StockQuantity}, Requested: {item.Quantity}.");

                var previousStock = part.StockQuantity;
                var subtotal = part.Price * item.Quantity;
                totalAmount += subtotal;

                saleItems.Add(new SaleItem
                {
                    VehiclePartId = part.Id,
                    Quantity = item.Quantity,
                    UnitPrice = part.Price,
                    Subtotal = subtotal
                });

                part.StockQuantity -= item.Quantity;
                part.UpdatedAt = DateTime.UtcNow;

                // Track parts that just crossed below the threshold
                if (part.StockQuantity < 10 && previousStock >= 10)
                    lowStockParts.Add(part);
            }

            var sale = new Sale
            {
                CustomerId = dto.CustomerId,
                TotalAmount = totalAmount,
                SaleDate = DateTime.UtcNow,
                PaymentStatus = "Paid",
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                SaleItems = saleItems
            };

            _dbContext.Sales.Add(sale);
            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            // Send low stock alerts after transaction commits
            foreach (var part in lowStockParts)
            {
                _ = _emailService.SendLowStockAlertAsync(part);
            }

            return sale;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<Sale?> GetSaleByIdAsync(int id)
    {
        return await _dbContext.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.VehiclePart)
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Sale>> GetAllSalesAsync()
    {
        return await _dbContext.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.VehiclePart)
            .Include(s => s.Customer)
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();
    }
}
