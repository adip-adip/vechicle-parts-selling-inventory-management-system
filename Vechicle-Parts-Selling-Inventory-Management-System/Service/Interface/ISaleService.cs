using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface ISaleService
{
    Task<Sale> CreateSaleAsync(CreateSaleDto dto);
    Task<Sale?> GetSaleByIdAsync(int id);
    Task<IEnumerable<Sale>> GetAllSalesAsync();
}
