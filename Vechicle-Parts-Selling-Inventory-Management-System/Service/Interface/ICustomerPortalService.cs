using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

public interface ICustomerPortalService
{
    Task<bool> UpdateProfileAsync(int customerId, UpdateProfileDto dto);
    Task<bool> UpdateVehicleAsync(int customerId, int vehicleId, UpdateVehicleDto dto);
    Task<VehicleDto> AddVehicleAsync(int customerId, CreateVehicleDto dto);
    Task<bool> DeleteVehicleAsync(int customerId, int vehicleId);
    Task<AppointmentResponseDto> BookAppointmentAsync(int customerId, CreateAppointmentDto dto);
    Task<List<AppointmentResponseDto>> GetMyAppointmentsAsync(int customerId);
    Task<PartRequestResponseDto> RequestPartAsync(int customerId, CreatePartRequestDto dto);
    Task<List<PartRequestResponseDto>> GetMyPartRequestsAsync(int customerId);
    Task<ReviewResponseDto> SubmitReviewAsync(int customerId, CreateReviewDto dto);
    Task<List<ReviewResponseDto>> GetMyReviewsAsync(int customerId);
    Task<List<VehicleDto>> GetMyVehiclesAsync(int customerId);
    Task<CustomerProfileDto?> GetMyProfileAsync(int customerId);
    Task<CustomerHistoryDto?> GetMyHistoryAsync(int customerId);
    Task<decimal> ApplyLoyaltyDiscountAsync(decimal totalAmount);
}