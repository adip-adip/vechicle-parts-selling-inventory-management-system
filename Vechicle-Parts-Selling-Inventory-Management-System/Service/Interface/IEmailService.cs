using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface IEmailService
{
    Task SendInvoiceEmailAsync(int saleId);
    Task SendLowStockAlertAsync(VehiclePart part);
    Task SendCreditReminderAsync(Sale sale, int daysOverdue);
}
