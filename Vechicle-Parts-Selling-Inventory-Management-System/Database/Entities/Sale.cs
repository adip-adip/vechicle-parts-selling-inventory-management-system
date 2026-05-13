using System.ComponentModel.DataAnnotations;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

public class Sale
{
    [Key]
    public int Id { get; set; }

    [Required]
    public decimal TotalAmount { get; set; }

    [Required]
    public DateTime SaleDate { get; set; } = DateTime.UtcNow;

    public string? CustomerId { get; set; }

    [StringLength(20)]
    public string PaymentStatus { get; set; } = "Pending";
}
