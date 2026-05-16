using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Implementation;

public class PurchaseInvoiceService : IPurchaseInvoiceService
{
    private readonly AppDbContext _dbContext;
    private readonly IEmailService _emailService;

    public PurchaseInvoiceService(AppDbContext dbContext, IEmailService emailService)
    {
        _dbContext = dbContext;
        _emailService = emailService;
    }

    public async Task<IEnumerable<PurchaseInvoice>> GetAllAsync()
    {
        return await _dbContext.PurchaseInvoices
            .Include(pi => pi.Vendor)
            .Include(pi => pi.Items)
            .ThenInclude(item => item.VehiclePart)
            .OrderByDescending(pi => pi.InvoiceDate)
            .ToListAsync();
    }

    public async Task<PurchaseInvoice?> GetByIdAsync(int id)
    {
        return await _dbContext.PurchaseInvoices
            .Include(pi => pi.Vendor)
            .Include(pi => pi.Items)
            .ThenInclude(item => item.VehiclePart)
            .FirstOrDefaultAsync(pi => pi.Id == id);
    }

    public async Task<PurchaseInvoice> CreateAsync(CreatePurchaseInvoiceDto dto)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var vendor = await _dbContext.Vendors.FirstOrDefaultAsync(v => v.Id == dto.VendorId);
            if (vendor == null)
                throw new InvalidOperationException($"Vendor with id {dto.VendorId} not found.");

            decimal totalCost = 0;
            var invoiceItems = new List<PurchaseInvoiceItem>();
            var partsToCheckStock = new List<VehiclePart>();

            foreach (var itemDto in dto.Items)
            {
                var part = await _dbContext.VehicleParts.FirstOrDefaultAsync(p => p.Id == itemDto.VehiclePartId);
                if (part == null)
                    throw new InvalidOperationException($"Part with id {itemDto.VehiclePartId} not found.");

                var subtotal = itemDto.UnitCost * itemDto.Quantity;
                totalCost += subtotal;

                invoiceItems.Add(new PurchaseInvoiceItem
                {
                    VehiclePartId = part.Id,
                    Quantity = itemDto.Quantity,
                    UnitCost = itemDto.UnitCost,
                    Subtotal = subtotal
                });

                // Increase stock when procuring parts from vendor
                part.StockQuantity += itemDto.Quantity;
                part.UpdatedAt = DateTime.UtcNow;
                partsToCheckStock.Add(part);
            }

            var invoice = new PurchaseInvoice
            {
                InvoiceNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                VendorId = dto.VendorId,
                TotalCost = totalCost,
                InvoiceDate = dto.InvoiceDate?.ToUniversalTime() ?? DateTime.UtcNow,
                Status = dto.Status,
                Items = invoiceItems
            };

            _dbContext.PurchaseInvoices.Add(invoice);
            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            // Check low stock after restocking (parts that are still below threshold)
            foreach (var part in partsToCheckStock)
            {
                if (part.StockQuantity < 10)
                {
                    // Fire-and-forget; don't block invoice creation on email failure
                    _ = _emailService.SendLowStockAlertAsync(part);
                }
            }

            return invoice;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PurchaseInvoice?> UpdateStatusAsync(int id, string status)
    {
        var invoice = await _dbContext.PurchaseInvoices.FirstOrDefaultAsync(pi => pi.Id == id);
        if (invoice == null)
            return null;

        invoice.Status = status;
        await _dbContext.SaveChangesAsync();
        return invoice;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var invoice = await _dbContext.PurchaseInvoices
            .Include(pi => pi.Items)
            .FirstOrDefaultAsync(pi => pi.Id == id);

        if (invoice == null)
            return false;

        _dbContext.PurchaseInvoiceItems.RemoveRange(invoice.Items);
        _dbContext.PurchaseInvoices.Remove(invoice);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
