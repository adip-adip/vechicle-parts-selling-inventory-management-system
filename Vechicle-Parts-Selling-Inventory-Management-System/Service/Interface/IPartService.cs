using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface IPartService
{
    Task<IEnumerable<VehiclePart>> GetAllAsync();
    Task<VehiclePart?> GetByIdAsync(int id);
    Task<VehiclePart> CreateAsync(CreatePartDto dto);
    Task<VehiclePart?> UpdateAsync(int id, UpdatePartDto dto);
    Task<bool> DeleteAsync(int id);
}
