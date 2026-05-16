namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface IEmailService
{
    Task SendInvoiceEmailAsync(int saleId);
}
