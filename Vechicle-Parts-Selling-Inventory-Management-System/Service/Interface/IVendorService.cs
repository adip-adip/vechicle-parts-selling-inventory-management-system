using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface IVendorService
{
    Task<IEnumerable<Vendor>> GetAllAsync(string? searchTerm = null);
    Task<Vendor?> GetByIdAsync(int id);
    Task<Vendor> CreateAsync(CreateVendorDto dto);
    Task<Vendor?> UpdateAsync(int id, UpdateVendorDto dto);
    Task<bool> DeleteAsync(int id);
}
