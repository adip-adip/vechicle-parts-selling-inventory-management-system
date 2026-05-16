using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface IPurchaseInvoiceService
{
    Task<IEnumerable<PurchaseInvoice>> GetAllAsync();
    Task<PurchaseInvoice?> GetByIdAsync(int id);
    Task<PurchaseInvoice> CreateAsync(CreatePurchaseInvoiceDto dto);
    Task<PurchaseInvoice?> UpdateStatusAsync(int id, string status);
    Task<bool> DeleteAsync(int id);
}
