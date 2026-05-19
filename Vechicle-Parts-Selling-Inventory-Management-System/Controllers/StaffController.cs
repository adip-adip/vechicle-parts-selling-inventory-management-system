using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Controllers;

[ApiController]
[Route("api/staff")]
[Authorize(Roles = "Staff")]
public class StaffController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ISaleService _saleService;
    private readonly IEmailService _emailService;
    private readonly ICustomerService _customerService;

    public StaffController(AppDbContext dbContext, ISaleService saleService, IEmailService emailService, ICustomerService customerService)
    {
        _dbContext = dbContext;
        _saleService = saleService;
        _emailService = emailService;
        _customerService = customerService;
    }

    [HttpPost("customers")]
    public async Task<IActionResult> RegisterCustomerWithVehicle([FromBody] CreateCustomerWithVehicleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var customer = new Customer
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address
            };

            _dbContext.Customers.Add(customer);
            await _dbContext.SaveChangesAsync();

            var vehicleIds = new List<int>();

            foreach (var v in dto.Vehicles)
            {
                var vehicle = new Vehicle
                {
                    CustomerId = customer.Id,
                    RegistrationNumber = v.RegistrationNumber,
                    Make = v.Make,
                    Model = v.Model,
                    Year = v.Year,
                    VIN = v.VIN
                };
                _dbContext.Vehicles.Add(vehicle);
                await _dbContext.SaveChangesAsync();
                vehicleIds.Add(vehicle.Id);
            }

            await transaction.CommitAsync();

            return Ok(new
            {
                message = "Customer registered with vehicles successfully.",
                customerId = customer.Id,
                vehicleIds
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPost("sales")]
    public async Task<IActionResult> CreateSale([FromBody] CreateSaleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var sale = await _saleService.CreateSaleAsync(dto);

            return Ok(new
            {
                message = "Sale created successfully.",
                saleId = sale.Id,
                invoiceNumber = sale.InvoiceNumber,
                totalAmount = sale.TotalAmount
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("sales")]
    public async Task<IActionResult> GetAllSales()
    {
        var sales = await _saleService.GetAllSalesAsync();
        return Ok(sales);
    }

    [HttpGet("sales/{id:int}")]
    public async Task<IActionResult> GetSaleById(int id)
    {
        var sale = await _saleService.GetSaleByIdAsync(id);
        if (sale == null)
            return NotFound($"Sale with id {id} not found.");
        return Ok(sale);
    }

    [HttpPost("sales/{id:int}/email")]
    public async Task<IActionResult> SendInvoiceEmail(int id)
    {
        try
        {
            await _emailService.SendInvoiceEmailAsync(id);
            return Ok(new { message = "Invoice email sent successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to send email: {ex.Message}" });
        }
    }

    [HttpGet("customers/{id:int}")]
    public async Task<IActionResult> GetCustomerDetails(int id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);
        if (customer == null)
            return NotFound($"Customer with id {id} not found.");
        return Ok(customer);
    }

    [HttpGet("customers/{id:int}/history")]
    public async Task<IActionResult> GetCustomerHistory(int id)
    {
        var history = await _customerService.GetCustomerHistoryAsync(id);
        if (history == null)
            return NotFound($"Customer with id {id} not found.");
        return Ok(history);
    }

    [HttpGet("customers/{id:int}/vehicles")]
    public async Task<IActionResult> GetCustomerVehicles(int id)
    {
        var vehicles = await _customerService.GetCustomerVehiclesAsync(id);
        if (vehicles.Count == 0)
        {
            var customerExists = await _dbContext.Customers.AnyAsync(c => c.Id == id);
            if (!customerExists)
                return NotFound($"Customer with id {id} not found.");
            return Ok(new List<object>());
        }
        return Ok(vehicles);
    }

    [HttpGet("customers/reports/regular")]
    public async Task<IActionResult> GetRegularCustomers([FromQuery] int count = 10)
    {
        var customers = await _customerService.GetRegularCustomersAsync(count);
        return Ok(customers);
    }

    [HttpGet("customers/reports/high-spenders")]
    public async Task<IActionResult> GetHighSpenders([FromQuery] int count = 10)
    {
        var customers = await _customerService.GetHighSpendersAsync(count);
        return Ok(customers);
    }

    [HttpGet("customers/reports/pending-credits")]
    public async Task<IActionResult> GetPendingCredits()
    {
        var customers = await _customerService.GetPendingCreditsAsync();
        return Ok(customers);
    }

    [HttpGet("customers/search")]
    public async Task<IActionResult> SearchCustomers(
        [FromQuery] string? term = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? phone = null,
        [FromQuery] string? vehicleNo = null)
    {
        var results = await _customerService.SearchCustomersAsync(term, customerId, phone, vehicleNo);
        return Ok(results);
    }

    [HttpGet("part-requests")]
    public async Task<IActionResult> GetAllPartRequests()
    {
        var requests = await _dbContext.PartRequests
            .Include(p => p.Customer)
            .OrderByDescending(p => p.RequestedAt)
            .Select(p => new StaffPartRequestResponseDto
            {
                Id = p.Id,
                CustomerId = p.CustomerId,
                CustomerName = p.Customer.FirstName + " " + p.Customer.LastName,
                CustomerEmail = p.Customer.Email,
                PartName = p.PartName,
                Description = p.Description,
                Status = p.Status,
                RequestedAt = p.RequestedAt
            })
            .ToListAsync();
        return Ok(requests);
    }

    [HttpGet("customers/{id:int}/part-requests")]
    public async Task<IActionResult> GetCustomerPartRequests(int id)
    {
        var exists = await _dbContext.Customers.AnyAsync(c => c.Id == id);
        if (!exists) return NotFound("Customer not found.");

        var requests = await _dbContext.PartRequests
            .Include(p => p.Customer)
            .Where(p => p.CustomerId == id)
            .OrderByDescending(p => p.RequestedAt)
            .Select(p => new StaffPartRequestResponseDto
            {
                Id = p.Id,
                CustomerId = p.CustomerId,
                CustomerName = p.Customer.FirstName + " " + p.Customer.LastName,
                CustomerEmail = p.Customer.Email,
                PartName = p.PartName,
                Description = p.Description,
                Status = p.Status,
                RequestedAt = p.RequestedAt
            })
            .ToListAsync();
        return Ok(requests);
    }

    [HttpPatch("part-requests/{id:int}/status")]
    public async Task<IActionResult> UpdatePartRequestStatus(int id, [FromBody] UpdatePartRequestStatusDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var request = await _dbContext.PartRequests.FindAsync(id);
        if (request == null) return NotFound("Part request not found.");

        request.Status = dto.Status;
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = $"Part request status updated to {dto.Status}." });
    }

    [HttpGet("appointments")]
    public async Task<IActionResult> GetAllAppointments()
    {
        var appointments = await _dbContext.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new
            {
                a.Id,
                a.ServiceType,
                a.AppointmentDate,
                a.Status,
                a.Notes,
                CustomerId = a.Customer.Id,
                CustomerName = a.Customer.FirstName + " " + a.Customer.LastName,
                CustomerEmail = a.Customer.Email,
                VehicleRegistration = a.Vehicle != null ? a.Vehicle.RegistrationNumber : null,
                a.CreatedAt
            })
            .ToListAsync();
        return Ok(appointments);
    }

    [HttpGet("customers/{id:int}/appointments")]
    public async Task<IActionResult> GetCustomerAppointments(int id)
    {
        var exists = await _dbContext.Customers.AnyAsync(c => c.Id == id);
        if (!exists) return NotFound("Customer not found.");

        var appointments = await _dbContext.Appointments
            .Include(a => a.Vehicle)
            .Where(a => a.CustomerId == id)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new
            {
                a.Id,
                a.ServiceType,
                a.AppointmentDate,
                a.Status,
                a.Notes,
                VehicleRegistration = a.Vehicle != null ? a.Vehicle.RegistrationNumber : null,
                a.CreatedAt
            })
            .ToListAsync();
        return Ok(appointments);
    }

    [HttpPatch("appointments/{id:int}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var appointment = await _dbContext.Appointments.FindAsync(id);
        if (appointment == null) return NotFound("Appointment not found.");

        appointment.Status = dto.Status;
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = $"Appointment status updated to {dto.Status}." });
    }
}
