using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Implementation;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _dbContext;

    public CustomerService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CustomerDetailsDto?> GetCustomerByIdAsync(int id)
    {
        var customer = await _dbContext.Customers
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return null;

        return new CustomerDetailsDto
        {
            Id = customer.Id,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            Email = customer.Email,
            Phone = customer.Phone,
            Address = customer.Address,
            Vehicles = customer.Vehicles.Select(v => new VehicleDto
            {
                Id = v.Id,
                RegistrationNumber = v.RegistrationNumber,
                Make = v.Make,
                Model = v.Model,
                Year = v.Year,
                VIN = v.VIN
            }).ToList()
        };
    }

    public async Task<CustomerHistoryDto?> GetCustomerHistoryAsync(int id)
    {
        var customer = await _dbContext.Customers
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return null;

        var sales = await _dbContext.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.VehiclePart)
            .Where(s => s.CustomerId == id)
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();

        return new CustomerHistoryDto
        {
            Id = customer.Id,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            Email = customer.Email,
            Phone = customer.Phone,
            TotalSales = sales.Count,
            TotalSpent = sales.Sum(s => s.TotalAmount),
            Sales = sales.Select(s => new SaleSummaryDto
            {
                SaleId = s.Id,
                InvoiceNumber = s.InvoiceNumber,
                TotalAmount = s.TotalAmount,
                SaleDate = s.SaleDate,
                PaymentStatus = s.PaymentStatus,
                ItemCount = s.SaleItems.Count,
                PartsPurchased = s.SaleItems.Select(si => $"{si.VehiclePart.Name} x{si.Quantity}").ToList()
            }).ToList()
        };
    }

    public async Task<List<VehicleDto>> GetCustomerVehiclesAsync(int id)
    {
        var customerExists = await _dbContext.Customers.AnyAsync(c => c.Id == id);
        if (!customerExists) return new List<VehicleDto>();

        var vehicles = await _dbContext.Vehicles
            .Where(v => v.CustomerId == id)
            .ToListAsync();

        return vehicles.Select(v => new VehicleDto
        {
            Id = v.Id,
            RegistrationNumber = v.RegistrationNumber,
            Make = v.Make,
            Model = v.Model,
            Year = v.Year,
            VIN = v.VIN
        }).ToList();
    }

    public async Task<List<RegularCustomerDto>> GetRegularCustomersAsync(int count = 10)
    {
        var customers = await _dbContext.Customers
            .Select(c => new RegularCustomerDto
            {
                Id = c.Id,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Email = c.Email,
                Phone = c.Phone,
                TotalPurchases = c.Sales.Count,
                TotalSpent = c.Sales.Sum(s => s.TotalAmount)
            })
            .Where(c => c.TotalPurchases > 0)
            .OrderByDescending(c => c.TotalPurchases)
            .Take(count)
            .ToListAsync();

        return customers;
    }

    public async Task<List<HighSpenderDto>> GetHighSpendersAsync(int count = 10)
    {
        var customers = await _dbContext.Customers
            .Select(c => new HighSpenderDto
            {
                Id = c.Id,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Email = c.Email,
                Phone = c.Phone,
                TotalSpent = c.Sales.Sum(s => s.TotalAmount),
                TotalPurchases = c.Sales.Count,
                AveragePerPurchase = c.Sales.Any() ? c.Sales.Average(s => s.TotalAmount) : 0
            })
            .Where(c => c.TotalSpent > 0)
            .OrderByDescending(c => c.TotalSpent)
            .Take(count)
            .ToListAsync();

        return customers;
    }

    public async Task<List<PendingCreditDto>> GetPendingCreditsAsync()
    {
        var customers = await _dbContext.Customers
            .Where(c => c.Sales.Any(s => s.PaymentStatus == "Pending"))
            .Select(c => new PendingCreditDto
            {
                Id = c.Id,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Email = c.Email,
                Phone = c.Phone,
                PendingSales = c.Sales
                    .Where(s => s.PaymentStatus == "Pending")
                    .Select(s => new PendingSaleDto
                    {
                        SaleId = s.Id,
                        InvoiceNumber = s.InvoiceNumber,
                        TotalAmount = s.TotalAmount,
                        SaleDate = s.SaleDate
                    }).ToList(),
                TotalPendingAmount = c.Sales
                    .Where(s => s.PaymentStatus == "Pending")
                    .Sum(s => s.TotalAmount)
            })
            .ToListAsync();

        return customers;
    }

    public async Task<List<CustomerSearchResultDto>> SearchCustomersAsync(
        string? term = null, int? customerId = null,
        string? phone = null, string? vehicleNo = null)
    {
        var query = _dbContext.Customers
            .Include(c => c.Vehicles)
            .Include(c => c.Sales)
            .AsQueryable();

        if (customerId.HasValue)
            query = query.Where(c => c.Id == customerId.Value);

        if (!string.IsNullOrWhiteSpace(phone))
            query = query.Where(c => c.Phone.Contains(phone));

        if (!string.IsNullOrWhiteSpace(vehicleNo))
            query = query.Where(c => c.Vehicles.Any(v =>
                v.RegistrationNumber.Contains(vehicleNo)));

        if (!string.IsNullOrWhiteSpace(term))
        {
            var searchTerm = term.ToLower();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(searchTerm) ||
                c.LastName.ToLower().Contains(searchTerm) ||
                c.Email.ToLower().Contains(searchTerm) ||
                c.Phone.Contains(searchTerm) ||
                c.Vehicles.Any(v =>
                    v.RegistrationNumber.ToLower().Contains(searchTerm)));
        }

        var results = await query
            .OrderBy(c => c.FirstName)
            .Select(c => new CustomerSearchResultDto
            {
                Id = c.Id,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Email = c.Email,
                Phone = c.Phone,
                VehicleCount = c.Vehicles.Count,
                SaleCount = c.Sales.Count,
                RegistrationNumbers = c.Vehicles.Select(v => v.RegistrationNumber).ToList()
            })
            .ToListAsync();

        return results;
    }
}
