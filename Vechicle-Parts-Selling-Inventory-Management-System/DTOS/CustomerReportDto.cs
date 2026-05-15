using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS;

public class CustomerDetailsDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Address { get; set; }
    public List<VehicleDto> Vehicles { get; set; } = new();
}

public class VehicleDto
{
    public int Id { get; set; }
    public string RegistrationNumber { get; set; } = null!;
    public string Make { get; set; } = null!;
    public string Model { get; set; } = null!;
    public int Year { get; set; }
    public string? VIN { get; set; }
}

public class CustomerHistoryDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public int TotalSales { get; set; }
    public decimal TotalSpent { get; set; }
    public List<SaleSummaryDto> Sales { get; set; } = new();
}

public class SaleSummaryDto
{
    public int SaleId { get; set; }
    public string? InvoiceNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime SaleDate { get; set; }
    public string PaymentStatus { get; set; } = null!;
    public int ItemCount { get; set; }
    public List<string> PartsPurchased { get; set; } = new();
}

public class RegularCustomerDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public int TotalPurchases { get; set; }
    public decimal TotalSpent { get; set; }
}

public class HighSpenderDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public decimal TotalSpent { get; set; }
    public int TotalPurchases { get; set; }
    public decimal AveragePerPurchase { get; set; }
}

public class PendingCreditDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public List<PendingSaleDto> PendingSales { get; set; } = new();
    public decimal TotalPendingAmount { get; set; }
}

public class PendingSaleDto
{
    public int SaleId { get; set; }
    public string? InvoiceNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime SaleDate { get; set; }
}

public class CustomerSearchResultDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public int VehicleCount { get; set; }
    public int SaleCount { get; set; }
    public List<string> RegistrationNumbers { get; set; } = new();
}
