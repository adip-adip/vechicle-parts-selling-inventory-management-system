using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerPortalService _service;
    private readonly AppDbContext _db;

    public CustomerController(ICustomerPortalService service, AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    private async Task<int?> GetCustomerIdAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return null;
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        return customer?.Id;
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.UpdateProfileAsync(customerId.Value, dto);
        return result ? Ok("Profile updated successfully.") : NotFound("Customer not found.");
    }

    [HttpPost("vehicles")]
    public async Task<IActionResult> AddVehicle([FromBody] CreateVehicleDto dto)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.AddVehicleAsync(customerId.Value, dto);
        return Ok(result);
    }

    [HttpPut("vehicles/{vehicleId:int}")]
    public async Task<IActionResult> UpdateVehicle(int vehicleId, [FromBody] UpdateVehicleDto dto)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.UpdateVehicleAsync(customerId.Value, vehicleId, dto);
        return result ? Ok("Vehicle updated successfully.") : NotFound("Vehicle not found.");
    }

    [HttpPost("appointments")]
    public async Task<IActionResult> BookAppointment([FromBody] CreateAppointmentDto dto)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.BookAppointmentAsync(customerId.Value, dto);
        return Ok(result);
    }

    [HttpGet("appointments")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.GetMyAppointmentsAsync(customerId.Value);
        return Ok(result);
    }

    [HttpPost("part-requests")]
    public async Task<IActionResult> RequestPart([FromBody] CreatePartRequestDto dto)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.RequestPartAsync(customerId.Value, dto);
        return Ok(result);
    }

    [HttpGet("part-requests")]
    public async Task<IActionResult> GetMyPartRequests()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.GetMyPartRequestsAsync(customerId.Value);
        return Ok(result);
    }

    [HttpPost("reviews")]
    public async Task<IActionResult> SubmitReview([FromBody] CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5.");
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.SubmitReviewAsync(customerId.Value, dto);
        return Ok(result);
    }

    [HttpDelete("vehicles/{vehicleId:int}")]
    public async Task<IActionResult> DeleteVehicle(int vehicleId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.DeleteVehicleAsync(customerId.Value, vehicleId);
        return result ? Ok("Vehicle deleted successfully.") : NotFound("Vehicle not found.");
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetMyVehicles()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.GetMyVehiclesAsync(customerId.Value);
        return Ok(result);
    }

    [HttpGet("reviews")]
    public async Task<IActionResult> GetMyReviews()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.GetMyReviewsAsync(customerId.Value);
        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetMyHistory()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");
        var result = await _service.GetMyHistoryAsync(customerId.Value);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("loyalty-check")]
    public async Task<IActionResult> CheckLoyaltyDiscount([FromQuery] decimal amount)
    {
        var discounted = await _service.ApplyLoyaltyDiscountAsync(amount);
        return Ok(new
        {
            OriginalAmount = amount,
            DiscountApplied = amount > 5000,
            DiscountedAmount = discounted,
            YouSave = amount - discounted
        });
    }
}