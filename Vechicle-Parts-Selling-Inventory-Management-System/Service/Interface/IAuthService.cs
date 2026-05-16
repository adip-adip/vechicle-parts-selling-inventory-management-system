using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS.Response;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface IAuthService
{
    Task<(bool Success, string Message, string? UserId)> RegisterAdminAsync(RegisterAdminDto dto);

    Task<(bool Success, string Message, string? UserId)> RegisterStaffAsync(RegisterStaffDto dto);

    Task<(bool Success, string Message, string? UserId)> RegisterCustomerAsync(RegisterCustomerDto dto);

    Task<LoginResponse> LoginAsync(LoginDto dto);
}
