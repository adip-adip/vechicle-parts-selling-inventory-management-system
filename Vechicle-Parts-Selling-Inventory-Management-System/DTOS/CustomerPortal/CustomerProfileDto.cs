namespace Vechicle_Parts_Selling_Inventory_Management_System.DTOS.CustomerPortal;

public class CustomerProfileDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Address { get; set; }
    public int TotalSales { get; set; }
    public decimal TotalSpent { get; set; }
}
