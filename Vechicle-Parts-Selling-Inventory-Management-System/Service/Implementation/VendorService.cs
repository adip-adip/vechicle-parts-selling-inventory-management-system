using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Implementation;

public class VendorService : IVendorService
{
    private readonly AppDbContext _dbContext;

    public VendorService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Vendor>> GetAllAsync(string? searchTerm = null)
    {
        var query = _dbContext.Vendors.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(v =>
                v.Name.ToLower().Contains(term) ||
                v.Phone.Contains(term));
        }

        return await query.OrderBy(v => v.Name).ToListAsync();
    }

    public async Task<Vendor?> GetByIdAsync(int id)
    {
        return await _dbContext.Vendors
            .Include(v => v.PurchaseInvoices)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<Vendor> CreateAsync(CreateVendorDto dto)
    {
        var vendor = new Vendor
        {
            Name = dto.Name,
            ContactPerson = dto.ContactPerson,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            PaymentTerms = dto.PaymentTerms
        };

        _dbContext.Vendors.Add(vendor);
        await _dbContext.SaveChangesAsync();
        return vendor;
    }

    public async Task<Vendor?> UpdateAsync(int id, UpdateVendorDto dto)
    {
        var vendor = await _dbContext.Vendors.FirstOrDefaultAsync(v => v.Id == id);
        if (vendor == null)
            return null;

        vendor.Name = dto.Name;
        vendor.ContactPerson = dto.ContactPerson;
        vendor.Phone = dto.Phone;
        vendor.Email = dto.Email;
        vendor.Address = dto.Address;
        vendor.PaymentTerms = dto.PaymentTerms;

        await _dbContext.SaveChangesAsync();
        return vendor;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var vendor = await _dbContext.Vendors.FirstOrDefaultAsync(v => v.Id == id);
        if (vendor == null)
            return false;

        _dbContext.Vendors.Remove(vendor);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
