using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Implementation;

public class PartService : IPartService
{
    private readonly AppDbContext _dbContext;
    private readonly IEmailService _emailService;

    public PartService(AppDbContext dbContext, IEmailService emailService)
    {
        _dbContext = dbContext;
        _emailService = emailService;
    }

    public async Task<IEnumerable<VehiclePart>> GetAllAsync()
    {
        return await _dbContext.VehicleParts.ToListAsync();
    }

    public async Task<VehiclePart?> GetByIdAsync(int id)
    {
        return await _dbContext.VehicleParts.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<VehiclePart> CreateAsync(CreatePartDto dto)
    {
        var part = new VehiclePart
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            Category = dto.Category,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.VehicleParts.Add(part);
        await _dbContext.SaveChangesAsync();
        return part;
    }

    public async Task<VehiclePart?> UpdateAsync(int id, UpdatePartDto dto)
    {
        var part = await _dbContext.VehicleParts.FirstOrDefaultAsync(p => p.Id == id);
        if (part == null)
            return null;

        var previousStock = part.StockQuantity;

        part.Name = dto.Name;
        part.Description = dto.Description;
        part.Price = dto.Price;
        part.StockQuantity = dto.StockQuantity;
        part.Category = dto.Category;
        part.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        // Send low stock alert if stock just crossed below threshold
        if (part.StockQuantity < 10 && previousStock >= 10)
        {
            _ = _emailService.SendLowStockAlertAsync(part);
        }

        return part;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var part = await _dbContext.VehicleParts.FirstOrDefaultAsync(p => p.Id == id);
        if (part == null)
            return false;

        _dbContext.VehicleParts.Remove(part);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<VehiclePart>> GetLowStockAsync()
    {
        return await _dbContext.VehicleParts
            .Where(p => p.StockQuantity < 10)
            .OrderBy(p => p.StockQuantity)
            .ToListAsync();
    }
}
