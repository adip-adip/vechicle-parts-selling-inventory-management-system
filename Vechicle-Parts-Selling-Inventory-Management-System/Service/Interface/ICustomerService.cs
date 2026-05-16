using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface ICustomerService
{
    Task<CustomerDetailsDto?> GetCustomerByIdAsync(int id);
    Task<CustomerHistoryDto?> GetCustomerHistoryAsync(int id);
    Task<List<VehicleDto>> GetCustomerVehiclesAsync(int id);
    Task<List<RegularCustomerDto>> GetRegularCustomersAsync(int count = 10);
    Task<List<HighSpenderDto>> GetHighSpendersAsync(int count = 10);
    Task<List<PendingCreditDto>> GetPendingCreditsAsync();
    Task<List<CustomerSearchResultDto>> SearchCustomersAsync(string? term = null, int? customerId = null, string? phone = null, string? vehicleNo = null);
}
