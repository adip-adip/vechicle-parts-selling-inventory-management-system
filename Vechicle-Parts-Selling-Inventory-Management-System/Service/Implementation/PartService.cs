using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Implementation;

public class PartService : IPartService
{
    private readonly AppDbContext _dbContext;

    public PartService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
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

        part.Name = dto.Name;
        part.Description = dto.Description;
        part.Price = dto.Price;
        part.StockQuantity = dto.StockQuantity;
        part.Category = dto.Category;
        part.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
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
}
