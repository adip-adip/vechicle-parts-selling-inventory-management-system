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

    public StaffController(AppDbContext dbContext, ISaleService saleService, IEmailService emailService)
    {
        _dbContext = dbContext;
        _saleService = saleService;
        _emailService = emailService;
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

            var vehicle = new Vehicle
            {
                CustomerId = customer.Id,
                RegistrationNumber = dto.RegistrationNumber,
                Make = dto.Make,
                Model = dto.Model,
                Year = dto.Year,
                VIN = dto.VIN
            };

            _dbContext.Vehicles.Add(vehicle);
            await _dbContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                message = "Customer registered with vehicle successfully.",
                customerId = customer.Id,
                vehicleId = vehicle.Id
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
}
