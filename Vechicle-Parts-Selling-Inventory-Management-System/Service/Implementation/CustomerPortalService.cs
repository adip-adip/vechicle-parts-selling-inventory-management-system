using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Service.Implementation;

public class CustomerPortalService : ICustomerPortalService
{
    private readonly AppDbContext _db;

    public CustomerPortalService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> UpdateProfileAsync(int customerId, UpdateProfileDto dto)
    {
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer == null) return false;

        if (dto.FirstName != null) customer.FirstName = dto.FirstName;
        if (dto.LastName != null) customer.LastName = dto.LastName;
        if (dto.Phone != null) customer.Phone = dto.Phone;
        if (dto.Address != null) customer.Address = dto.Address;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<VehicleDto> AddVehicleAsync(int customerId, CreateVehicleDto dto)
    {
        var vehicle = new Vehicle
        {
            CustomerId = customerId,
            RegistrationNumber = dto.RegistrationNumber,
            Make = dto.Make,
            Model = dto.Model,
            Year = dto.Year,
            VIN = dto.VIN
        };

        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        return new VehicleDto
        {
            Id = vehicle.Id,
            RegistrationNumber = vehicle.RegistrationNumber,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Year = vehicle.Year,
            VIN = vehicle.VIN
        };
    }

    public async Task<bool> DeleteVehicleAsync(int customerId, int vehicleId)
    {
        var vehicle = await _db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customerId);
        if (vehicle == null) return false;

        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateVehicleAsync(int customerId, int vehicleId, UpdateVehicleDto dto)
    {
        var vehicle = await _db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customerId);
        if (vehicle == null) return false;

        if (dto.Make != null) vehicle.Make = dto.Make;
        if (dto.Model != null) vehicle.Model = dto.Model;
        if (dto.Year.HasValue) vehicle.Year = dto.Year.Value;
        if (dto.VIN != null) vehicle.VIN = dto.VIN;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<AppointmentResponseDto> BookAppointmentAsync(int customerId, CreateAppointmentDto dto)
    {
        var appointment = new Appointment
        {
            CustomerId = customerId,
            VehicleId = dto.VehicleId,
            ServiceType = dto.ServiceType,
            AppointmentDate = dto.AppointmentDate,
            Notes = dto.Notes
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        var vehicle = dto.VehicleId.HasValue
            ? await _db.Vehicles.FindAsync(dto.VehicleId.Value)
            : null;

        return new AppointmentResponseDto
        {
            Id = appointment.Id,
            ServiceType = appointment.ServiceType,
            AppointmentDate = appointment.AppointmentDate,
            Status = appointment.Status,
            Notes = appointment.Notes,
            VehicleRegistration = vehicle?.RegistrationNumber,
            CreatedAt = appointment.CreatedAt
        };
    }

    public async Task<List<AppointmentResponseDto>> GetMyAppointmentsAsync(int customerId)
    {
        return await _db.Appointments
            .Include(a => a.Vehicle)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new AppointmentResponseDto
            {
                Id = a.Id,
                ServiceType = a.ServiceType,
                AppointmentDate = a.AppointmentDate,
                Status = a.Status,
                Notes = a.Notes,
                VehicleRegistration = a.Vehicle != null ? a.Vehicle.RegistrationNumber : null,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<PartRequestResponseDto> RequestPartAsync(int customerId, CreatePartRequestDto dto)
    {
        var request = new PartRequest
        {
            CustomerId = customerId,
            PartName = dto.PartName,
            Description = dto.Description
        };

        _db.PartRequests.Add(request);
        await _db.SaveChangesAsync();

        return new PartRequestResponseDto
        {
            Id = request.Id,
            PartName = request.PartName,
            Description = request.Description,
            Status = request.Status,
            RequestedAt = request.RequestedAt
        };
    }

    public async Task<List<PartRequestResponseDto>> GetMyPartRequestsAsync(int customerId)
    {
        return await _db.PartRequests
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.RequestedAt)
            .Select(r => new PartRequestResponseDto
            {
                Id = r.Id,
                PartName = r.PartName,
                Description = r.Description,
                Status = r.Status,
                RequestedAt = r.RequestedAt
            })
            .ToListAsync();
    }

    public async Task<List<VehicleDto>> GetMyVehiclesAsync(int customerId)
    {
        return await _db.Vehicles
            .Where(v => v.CustomerId == customerId)
            .Select(v => new VehicleDto
            {
                Id = v.Id,
                RegistrationNumber = v.RegistrationNumber,
                Make = v.Make,
                Model = v.Model,
                Year = v.Year,
                VIN = v.VIN
            })
            .ToListAsync();
    }

    public async Task<List<ReviewResponseDto>> GetMyReviewsAsync(int customerId)
    {
        return await _db.Reviews
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ReviewResponseDto> SubmitReviewAsync(int customerId, CreateReviewDto dto)
    {
        var review = new Review
        {
            CustomerId = customerId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return new ReviewResponseDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<CustomerHistoryDto?> GetMyHistoryAsync(int customerId)
    {
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer == null) return null;

        var sales = await _db.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.VehiclePart)
            .Where(s => s.CustomerId == customerId)
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

    public Task<decimal> ApplyLoyaltyDiscountAsync(decimal totalAmount)
    {
        var discounted = totalAmount > 5000 ? totalAmount * 0.90m : totalAmount;
        return Task.FromResult(discounted);
    }
}